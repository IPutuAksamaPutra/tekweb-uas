'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Search, FileText, ChevronDown, ChevronLeft, ChevronRight, Filter, ReceiptText, Loader2, AlertTriangle
} from 'lucide-react'; 
import * as XLSX from 'xlsx';

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`; 

interface Transaksi {
    id: number;
    payment_method: string;
    total_amount: number; 
    transaction_date: string;
    jenis: "Produk" | "Booking" | "Jasa Manual" | "Campuran" | "Pelunasan Order";
    nama_item_utama: string; 
    status: "Lunas" | "Pending";
    is_order: boolean; 
}

type FilterType = 'Semua' | 'Produk' | 'Booking' | 'Jasa Manual' | 'Campuran' | 'Pelunasan Order';

export default function TransaksiPage() {
    const [search, setSearch] = useState("");
    const [filterJenis, setFilterJenis] = useState<FilterType>('Semua');
    const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [isMount, setIsMount] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const getAuthToken = useCallback(() => {
        if (typeof document === "undefined") return null;
        return document.cookie.match(/token=([^;]+)/)?.[1] || null;
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = getAuthToken();

        if (!token) {
            setError("Sesi login tidak ditemukan. Silakan login kembali.");
            setIsLoading(false);
            return;
        }

        try {
            const headers = { "Accept": "application/json", "Authorization": `Bearer ${token}` };
            const [posRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/transactions`, { headers, cache: 'no-store' }),
                fetch(`${API_URL}/admin/orders`, { headers, cache: 'no-store' })
            ]);

            let combinedRawData: any[] = [];

            if (posRes.ok) {
                const posJson = await posRes.json();
                combinedRawData = [...combinedRawData, ...(posJson.transactions || posJson.data || []).map((item: any) => ({ ...item, is_order: false }))];
            }

            if (ordersRes.ok) {
                const orderJson = await ordersRes.json();
                combinedRawData = [...combinedRawData, ...(orderJson.orders || orderJson.data || []).map((item: any) => ({ ...item, is_order: true }))];
            }

            combinedRawData.sort((a, b) => new Date(b.transaction_date || b.created_at).getTime() - new Date(a.transaction_date || a.created_at).getTime());

            // Normalisasi
            const normalized: Transaksi[] = combinedRawData.map((t: any) => {
                let jenis: Transaksi['jenis'] = 'Campuran';
                let namaUtama = "";
                const total = Number(t.total_amount || t.total || t.total_price || 0); 
                const status = ['lunas','completed','success'].includes((t.status || '').toLowerCase()) ? "Lunas" : "Pending";
                const items = Array.isArray(t.items) ? t.items : Array.isArray(t.order_items) ? t.order_items : [];
                if (t.is_order) { 
                    jenis = 'Pelunasan Order'; 
                    const customerName = t.user?.name || t.customer_name || 'Pelanggan Marketplace';
                    namaUtama = `Pesanan Marketplace - ${customerName}`;
                } else if (items.length > 0) {
                    const types = items.map((item: any) => item.item_type || item.type || '');
                    const uniqueTypes = Array.from(new Set(types));
                    if (uniqueTypes.length === 1) {
                        const type = String(uniqueTypes[0]).toLowerCase();
                        if (type.includes('product')) jenis = 'Produk';
                        else if (type.includes('booking')) jenis = 'Booking';
                        else if (type.includes('manual') || type.includes('service')) jenis = 'Jasa Manual';
                    } else jenis = 'Campuran';
                    const firstItem = items[0];
                    namaUtama = firstItem?.item_name || firstItem?.name || "Item Tanpa Nama";
                    if (items.length > 1) namaUtama += ` (+${items.length - 1} item lainnya)`;
                } else namaUtama = `Transaksi Tanpa Detail #${t.id}`;

                return {
                    id: t.id,
                    payment_method: t.payment_method || t.payment || 'Tunai',
                    total_amount: total,
                    transaction_date: t.transaction_date || t.created_at || new Date().toISOString(),
                    jenis,
                    nama_item_utama: namaUtama,
                    status,
                    is_order: !!t.is_order,
                };
            });

            setTransaksiList(normalized);
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat memuat data.");
        } finally {
            setIsLoading(false);
        }
    }, [getAuthToken]);

    useEffect(() => {
        setIsMount(true);
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        return transaksiList.filter(t => {
            const searchLower = search.toLowerCase();
            const matchesSearch = t.nama_item_utama.toLowerCase().includes(searchLower) || t.id.toString().includes(searchLower);
            const matchesJenis = filterJenis === 'Semua' || t.jenis === filterJenis;
            return matchesSearch && matchesJenis;
        });
    }, [transaksiList, search, filterJenis]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData.map(t => ({
            ID_Transaksi: t.id,
            Sumber: t.is_order ? "Marketplace" : "Kasir POS",
            Tanggal: new Date(t.transaction_date).toLocaleString("id-ID"),
            Item_Utama: t.nama_item_utama,
            Kategori: t.jenis,
            Metode_Bayar: t.payment_method,
            Total_Rp: t.total_amount,
            Status: t.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
        XLSX.writeFile(workbook, `Laporan_Bengkel_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (!isMount) return null;

    return (
        <div className="p-4 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-4xl font-black text-[#234C6A] tracking-tighter uppercase flex items-center gap-3 italic">
                    <ReceiptText size={38} className="text-[#FF6D1F]" />
                    Finance <span className="text-orange-500">History</span>
                </h1>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative">
                        <button 
                            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                            className="bg-[#234C6A] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-orange-500 transition-all shadow-lg active:scale-95"
                        >
                            <FileText size={18} /> Ekspor Data <ChevronDown size={14} />
                        </button>
                        {isExportDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in">
                                <button onClick={exportToExcel} className="flex items-center gap-3 w-full px-5 py-4 text-xs font-bold text-gray-600 hover:bg-orange-50 border-b transition-colors">
                                    <FileText className="text-green-600" size={16} /> Excel (.xlsx)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Cari ID atau nama barang..."
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-orange-500 font-bold text-slate-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-orange-500 appearance-none font-bold text-slate-700 cursor-pointer"
                        value={filterJenis}
                        onChange={(e) => setFilterJenis(e.target.value as FilterType)}
                    >
                        {['Semua', 'Produk', 'Booking', 'Jasa Manual', 'Campuran', 'Pelunasan Order'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 font-bold rounded-xl flex items-center gap-3">
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            {/* TABLE */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-auto">
                <table className="w-full min-w-[700px] text-left">
                    <thead className="bg-slate-900 text-white">
                        <tr className="italic">
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">ID</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Deskripsi</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Tipe</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Nominal</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Tanggal</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <Loader2 className="animate-spin mx-auto text-orange-500" size={40} />
                                </td>
                            </tr>
                        ) : currentItems.map((t) => (
                            <tr key={`${t.is_order ? 'ord' : 'pos'}-${t.id}`} className="hover:bg-orange-50 transition-colors">
                                <td className="p-6">
                                    <span className="bg-slate-100 px-3 py-1 rounded-lg font-black text-[10px] text-slate-500">
                                        {t.is_order ? 'MARKET' : 'POS'}-{t.id}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <p className="font-black text-[#234C6A] text-sm uppercase italic leading-tight">{t.nama_item_utama}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Via {t.payment_method}</p>
                                </td>
                                <td className="p-6 text-center">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[9px] font-black uppercase italic">{t.jenis}</span>
                                </td>
                                <td className="p-6 text-center font-black text-orange-600 text-lg">
                                    Rp {t.total_amount.toLocaleString("id-ID")}
                                </td>
                                <td className="p-6 text-center text-xs font-bold text-gray-400 uppercase italic">
                                    {new Date(t.transaction_date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="p-6 text-center">
                                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase italic shadow-sm ${t.status === "Lunas" ? "bg-green-500 text-white" : "bg-amber-400 text-white"}`}>
                                        {t.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {!isLoading && filteredData.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase italic">Total {filteredData.length} Records</p>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 bg-gray-100 rounded-xl disabled:opacity-30">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="px-6 py-3 bg-[#234C6A] text-white rounded-xl text-xs font-black">{currentPage} / {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 bg-gray-100 rounded-xl disabled:opacity-30">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
