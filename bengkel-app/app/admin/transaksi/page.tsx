'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Search, Eye, Loader2, AlertTriangle, ChevronDown, 
    FileText, Printer, ChevronLeft, ChevronRight, Filter, ReceiptText 
} from 'lucide-react'; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// URL API Laravel
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tekweb-uas-production.up.railway.app/api"; 

/* ===============================
   INTERFACES
================================ */
interface TransactionItem {
    item_type: 'product' | 'service_manual' | 'booking_pelunasan';
    item_name: string; 
    quantity: number;
    price: number;
}

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

/* ===============================
   MAIN COMPONENT
================================ */
export default function TransaksiPage() {
    const [search, setSearch] = useState("");
    const [filterJenis, setFilterJenis] = useState<FilterType>('Semua');
    const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [isMount, setIsMount] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 

    // Helper: Token Cookie
    const getCookie = useCallback((name: string) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
        return null;
    }, []);

    // ==================== LOGIKA NORMALISASI ====================
    const normalizeData = useCallback((rawData: any[]): Transaksi[] => {
        return rawData.map((t: any) => {
            let jenis: Transaksi['jenis'] = 'Campuran';
            let namaUtama = `Transaksi #${t.id}`;
            const total = Number(t.total_amount || t.total || 0); 
            const status = (t.status === 'Lunas' || total > 0 || t.status === 'completed') ? "Lunas" : "Pending"; 
            
            const items: TransactionItem[] = Array.isArray(t.items) ? t.items : [];

            if (t.is_order) { 
                jenis = 'Pelunasan Order'; 
                const customerName = t.name || t.customer_name || t.user?.name || 'Pelanggan';
                namaUtama = `Order #${t.id} - ${customerName}`;
            } else if (items.length > 0) {
                const types = items.map(item => item.item_type);
                const uniqueTypes = Array.from(new Set(types));

                if (uniqueTypes.length === 1) {
                    if (uniqueTypes[0] === 'product') jenis = 'Produk';
                    else if (uniqueTypes[0] === 'booking_pelunasan') jenis = 'Booking';
                    else if (uniqueTypes[0] === 'service_manual') jenis = 'Jasa Manual';
                }
                namaUtama = items[0].item_name;
                if (items.length > 1) namaUtama += ` (+${items.length - 1} item)`;
            }

            return {
                id: t.id,
                payment_method: t.payment_method || t.payment || 'N/A',
                total_amount: total,
                transaction_date: t.transaction_date || t.created_at,
                jenis,
                nama_item_utama: namaUtama,
                status,
                is_order: !!t.is_order,
            };
        });
    }, []);

    // ==================== FETCH DATA ====================
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = getCookie("token");

        if (!token) {
            setError("Sesi berakhir. Silakan login ulang.");
            setIsLoading(false);
            return;
        }

        try {
            const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };

            // Fetch POS dan Orders secara paralel
            const [posRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/transactions`, { headers }),
                fetch(`${API_URL}/admin/orders`, { headers })
            ]);

            if (!posRes.ok || !ordersRes.ok) throw new Error("Gagal menyinkronkan data dari server.");

            const posData = await posRes.json();
            const ordersData = await ordersRes.json();

            const rawPOS = posData.data || posData.transactions || [];
            const rawOrders = ordersData.data || ordersData.orders || [];

            const combinedRawData = [
                ...rawPOS.map((t: any) => ({ ...t, is_order: false })),
                ...rawOrders.map((o: any) => ({
                    ...o,
                    total_amount: o.total || o.total_price || 0,
                    transaction_date: o.created_at,
                    is_order: true
                }))
            ];

            // Sort data terbaru di atas
            combinedRawData.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

            setTransaksiList(normalizeData(combinedRawData));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [getCookie, normalizeData]);

    useEffect(() => {
        setIsMount(true);
        fetchData();
    }, [fetchData]);

    // Inject Print Styles
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const styleId = 'transaction-print-styles';
        let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
        const printStyles = `
            @media print {
                .print-hidden { display: none !important; }
                body { background: white; }
                .print-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .print-table th, .print-table td { border: 1px solid #000; padding: 8px; font-size: 10pt; color: black; }
                .print-title { display: block !important; text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
            }
        `;
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = printStyles;
    }, []);

    // ==================== FILTER & PAGINATION ====================
    const filteredData = useMemo(() => {
        return transaksiList.filter(t => {
            const matchesSearch = t.nama_item_utama.toLowerCase().includes(search.toLowerCase()) || t.id.toString().includes(search);
            const matchesJenis = filterJenis === 'Semua' || t.jenis === filterJenis;
            return matchesSearch && matchesJenis;
        });
    }, [transaksiList, search, filterJenis]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData.map(t => ({
            ID: t.id,
            Sumber: t.is_order ? "Marketplace" : "POS Kasir",
            Tanggal: new Date(t.transaction_date).toLocaleDateString("id-ID"),
            Deskripsi: t.nama_item_utama,
            Jenis: t.jenis,
            Metode: t.payment_method,
            Total: t.total_amount,
            Status: t.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transaksi");
        XLSX.writeFile(workbook, `Laporan_Transaksi_${new Date().getTime()}.xlsx`);
    };

    if (!isMount) return null;

    return (
        <div className="p-4 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#234C6A] tracking-tighter uppercase flex items-center gap-3">
                        <ReceiptText size={32} className="text-[#FF6D1F]" />
                        Riwayat Transaksi
                    </h1>
                    <p className="text-gray-500 font-medium">Monitoring pendapatan kasir dan marketplace secara real-time.</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto print-hidden">
                    <div className="relative flex-1 md:flex-none">
                        <button 
                            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                            className="w-full bg-[#234C6A] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-[#1a3a52] transition-all shadow-lg shadow-blue-900/20"
                        >
                            <FileText size={18} /> Ekspor <ChevronDown size={14} />
                        </button>
                        {isExportDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <button onClick={exportToExcel} className="flex items-center gap-3 w-full px-5 py-4 text-xs font-bold text-gray-600 hover:bg-gray-50 border-b transition-colors">
                                    <FileText className="text-green-600" size={16} /> Excel (.xlsx)
                                </button>
                                <button onClick={() => window.print()} className="flex items-center gap-3 w-full px-5 py-4 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                    <Printer className="text-blue-600" size={16} /> Cetak PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-hidden">
                <div className="md:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6D1F] transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Cari ID transaksi atau nama item..."
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-transparent shadow-sm focus:border-[#FF6D1F] focus:outline-none font-bold text-slate-700 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6D1F]" size={18} />
                    <select 
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-transparent shadow-sm focus:border-[#FF6D1F] focus:outline-none appearance-none font-bold text-slate-700 cursor-pointer transition-all"
                        value={filterJenis}
                        onChange={(e) => setFilterJenis(e.target.value as FilterType)}
                    >
                        {['Semua', 'Produk', 'Booking', 'Jasa Manual', 'Campuran', 'Pelunasan Order'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-l-8 border-red-500 text-red-700 rounded-xl flex items-center gap-3 animate-in shake duration-500">
                    <AlertTriangle size={24} />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            {/* TABLE AREA */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse print-table">
                        <thead className="bg-gray-50/50 border-b">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">No</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item / Deskripsi</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Metode</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bayar</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center print-hidden">Status</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center print-hidden">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-[#FF6D1F]" size={40} />
                                        <p className="mt-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Menyelaraskan Data...</p>
                                    </td>
                                </tr>
                            ) : currentItems.map((t, index) => (
                                <tr key={`${t.is_order ? 'ord' : 'pos'}-${t.id}`} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-6 text-gray-300 font-black text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="p-6">
                                        <p className="font-black text-[#234C6A] text-sm group-hover:text-[#FF6D1F] transition-colors">{t.nama_item_utama}</p>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">ID: {t.is_order ? 'ORD' : 'POS'}-{t.id}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase border border-blue-100">
                                            {t.jenis}
                                        </span>
                                    </td>
                                    <td className="p-6 text-xs font-bold text-gray-500 uppercase">{t.payment_method}</td>
                                    <td className="p-6 font-black text-[#FF6D1F]">
                                        Rp {t.total_amount.toLocaleString("id-ID")}
                                    </td>
                                    <td className="p-6 text-xs font-bold text-gray-400">
                                        {new Date(t.transaction_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-6 text-center print-hidden">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm
                                            ${t.status === "Lunas" ? "bg-green-50 text-green-600 border border-green-100" : "bg-amber-50 text-amber-600 border border-amber-100"}
                                        `}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center print-hidden">
                                        <button className="p-3 bg-gray-50 text-[#234C6A] rounded-2xl hover:bg-[#FF6D1F] hover:text-white transition-all shadow-sm">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            {!isLoading && filteredData.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 print-hidden">
                    <div className="flex items-center gap-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Tampil {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}
                        </p>
                        <select 
                            value={itemsPerPage} 
                            onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                            className="bg-gray-50 border-none px-3 py-1 rounded-lg text-xs font-bold text-gray-500 outline-none"
                        >
                            {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v} / Halaman</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-3 rounded-2xl border-2 border-gray-50 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="px-6 py-2 bg-[#234C6A] text-white rounded-xl text-xs font-black">
                            {currentPage} / {totalPages}
                        </span>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-3 rounded-2xl border-2 border-gray-50 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}