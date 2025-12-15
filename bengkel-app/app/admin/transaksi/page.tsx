'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Loader2, AlertTriangle, ChevronDown, FileText, Printer } from 'lucide-react'; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// Import Alert component Anda di sini (dihapus sementara untuk menjaga keringkasan kode)

// URL API Laravel Anda
const API_URL = "http://localhost:8000/api"; 

// --- Helper: Ambil token dari cookies ---
function getCookie(name: string) {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
    return null;
}

// --- Interfaces yang Disesuaikan (Universal) ---
interface TransactionItem {
    item_type: 'product' | 'service_manual' | 'booking_pelunasan';
    item_name: string; 
    quantity: number;
    price: number;
}

interface Transaksi {
    id: number;
    // Kolom Umum
    payment_method: string;
    total_amount: number; 
    transaction_date: string;
    
    // Properti yang diproses di frontend
    jenis: "Produk" | "Booking" | "Jasa Manual" | "Campuran" | "Pelunasan Order";
    nama_item_utama: string; 
    status: "Lunas" | "Pending";
}

// --- Filter Types ---
type FilterType = 'Semua' | 'Produk' | 'Booking' | 'Jasa Manual' | 'Campuran' | 'Pelunasan Order';


export default function TransaksiPage() {
    const [search, setSearch] = useState("");
    const [filterJenis, setFilterJenis] = useState<FilterType>('Semua');
    const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);


    // ==================== LOGIKA PEMBENTUKAN DATA ====================
    
    // Fungsi untuk menormalisasi data dari satu sumber gabungan (/api/transactions)
    const normalizeData = (rawData: any[]): Transaksi[] => {
        return rawData.map((t: any) => {
            let jenis: Transaksi['jenis'] = 'Campuran';
            let namaUtama = `Transaksi #${t.id}`;
            const total = Number(t.total_amount || t.total || 0); 
            const status = (t.status === 'Lunas' || total > 0) ? "Lunas" : "Pending"; 
            
            // Logika Deteksi:
            const items: TransactionItem[] = Array.isArray(t.items) ? t.items : [];

            if (items.length > 0) {
                const types = items.map(item => item.item_type);
                const uniqueTypes = Array.from(new Set(types));

                if (uniqueTypes.length === 1) {
                    if (uniqueTypes[0] === 'product') jenis = 'Produk';
                    else if (uniqueTypes[0] === 'booking_pelunasan') jenis = 'Booking';
                    else if (uniqueTypes[0] === 'service_manual') jenis = 'Jasa Manual';
                }
                
                namaUtama = items[0].item_name;
                if (items.length > 1) {
                    namaUtama += ` (+${items.length - 1} item)`;
                }
            
            } else if (t.jenis_service) { 
                jenis = 'Pelunasan Order'; 
                namaUtama = `Order #${t.id} (${t.jenis_service}) - ${t.user?.name || t.customer_name || 'Pelanggan'}`;
            
            } else {
                 namaUtama = t.nama_item || namaUtama;
            }


            return {
                id: t.id,
                payment_method: t.payment_method || 'N/A',
                total_amount: total,
                transaction_date: t.transaction_date || t.created_at,
                
                jenis: jenis,
                nama_item_utama: namaUtama,
                status: status,
            } as Transaksi;
        });
    };


    // ==================== LOAD DATA (SINGLE SOURCE) ====================
    useEffect(() => {
        const loadTransactions = async () => {
            setIsLoading(true);
            try {
                setError(null);
                const token = getCookie("token");

                if (!token) {
                    setError("Token tidak ditemukan. Silakan login ulang.");
                    return;
                }
                
                const fetchOptions = {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };

                // 🔥 MENGGUNKAN ENDPOINT /api/transactions
                const res = await fetch(`${API_URL}/transactions`, fetchOptions); 
                
                if (res.status === 404) {
                    throw new Error("Endpoint '/api/transactions' tidak ditemukan. Pastikan rute di backend sudah benar.");
                }

                if (!res.ok) {
                    throw new Error("Gagal mengambil transaksi. Status: " + res.status);
                }

                const data = await res.json();
                
                let rawData: any[] = data.data || data.transactions || [];
                
                const processed = normalizeData(rawData);
                setTransaksiList(processed);


            } catch (err: any) {
                console.error("Fetch Error:", err);
                setError(err.message || "Terjadi kesalahan saat koneksi atau pemrosesan data.");
            } finally {
                setIsLoading(false);
            }
        };

        loadTransactions();
    }, []);

    // Filter berdasarkan input pencarian & dropdown
    const filtered = useMemo(() => {
        let list = transaksiList;

        // 1. Filter Dropdown Jenis
        if (filterJenis !== 'Semua') {
            list = list.filter(t => t.jenis === filterJenis);
        }

        // 2. Filter Search Bar
        if (search.trim() === "") {
            return list;
        }

        const searchTerm = search.toLowerCase();
        
        return list.filter((t) =>
            t.nama_item_utama.toLowerCase().includes(searchTerm) || 
            t.id.toString().includes(searchTerm)
        );
    }, [transaksiList, search, filterJenis]);


    // ==================== FUNGSI EKSPOR ====================

    const exportToExcel = () => {
        if (transaksiList.length === 0) {
            alert("Tidak ada data transaksi untuk diekspor.");
            return;
        }

        setIsExportDropdownOpen(false); 

        const dataForExport = transaksiList.map((t) => ({
            ID: t.id,
            "Tanggal Transaksi": new Date(t.transaction_date).toLocaleDateString("id-ID"),
            "Deskripsi Item Utama": t.nama_item_utama,
            "Jenis Transaksi": t.jenis,
            "Metode Pembayaran": t.payment_method,
            "Total (Rp)": t.total_amount, 
            Status: t.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transaksi");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(data, "Riwayat_Transaksi_Kasir_" + new Date().getTime() + ".xlsx");
    };

    const printToPDF = () => {
        setIsExportDropdownOpen(false); 
        window.print();
    };


    // ==================== UI ====================
    return (
        <div className="p-4 lg:p-8 space-y-6"> {/* Padding disesuaikan */}
            <h1 className="text-2xl lg:text-3xl font-bold text-[#234C6A] print:text-black">📄 Riwayat Transaksi Kasir</h1>

            {/* CONTAINER BAR FILTER & EXPORT */}
            {/* Menggunakan flex-wrap untuk wrapping di mobile */}
            <div className="flex justify-between items-center flex-wrap gap-3 lg:gap-4 print:hidden"> 
                
                {/* Search Bar - Full width di mobile, max-w-sm di desktop */}
                <div className="flex items-center bg-white p-3 rounded-xl shadow gap-3 w-full md:max-w-sm">
                    <Search size={20} className="text-gray-500" />
                    <input
                        placeholder="Cari ID transaksi atau nama item..."
                        className="w-full outline-none"
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                </div>
                
                {/* Dropdown Group - Menggunakan flex untuk tetap bersebelahan */}
                <div className='flex gap-3 lg:gap-4'>
                    
                    {/* Dropdown Filter Jenis */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                            className="flex items-center bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-xl shadow hover:bg-gray-50 transition-colors text-sm"
                        >
                            Jenis: {filterJenis}
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                        </button>
                        
                        {isFilterDropdownOpen && (
                            <div 
                                className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20"
                                onBlur={() => setIsFilterDropdownOpen(false)}
                                tabIndex={-1} 
                            >
                                {['Semua', 'Produk', 'Booking', 'Jasa Manual', 'Campuran', 'Pelunasan Order'].map(jenis => (
                                    <button
                                        key={jenis}
                                        onClick={() => {
                                            setFilterJenis(jenis as FilterType);
                                            setIsFilterDropdownOpen(false);
                                        }}
                                        className={`block w-full px-4 py-2 text-sm text-left ${filterJenis === jenis ? 'bg-indigo-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        {jenis}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                
                    {/* Dropdown Cetak/Ekspor */}
                    <div className="relative">
                        <button
                            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                            className="flex items-center bg-gray-600 text-white px-3 py-2 rounded-xl shadow hover:bg-gray-700 transition-colors text-sm"
                        >
                            Ekspor & Cetak
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isExportDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                        </button>
                        
                        {/* Konten Dropdown */}
                        {isExportDropdownOpen && (
                            <div 
                                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                                onBlur={() => setIsExportDropdownOpen(false)}
                                tabIndex={-1} 
                            >
                                <button
                                    onClick={exportToExcel}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                >
                                    <FileText className="w-4 h-4 mr-2 text-emerald-600" />
                                    Ekspor ke Excel
                                </button>
                                <button
                                    onClick={printToPDF}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                >
                                    <Printer className="w-4 h-4 mr-2 text-red-600" />
                                    Cetak (PDF)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            {/* TABEL CONTAINER - PENTING UNTUK SCROLLING DI MOBILE */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full border-collapse text-left print:table text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            {/* Menambah min-width agar kolom tidak terlalu sempit di mobile */}
                            <th className="p-3 min-w-[70px]">ID</th>
                            <th className="p-3 min-w-[200px]">Item/Deskripsi</th>
                            <th className="p-3 min-w-[100px]">Jenis</th>
                            <th className="p-3 min-w-[100px]">Metode</th>
                            <th className="p-3 min-w-[120px]">Total</th>
                            <th className="p-3 min-w-[100px]">Tanggal</th>
                            <th className="p-3 min-w-20">Status</th>
                            <th className="p-3 print:hidden min-w-20">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={8} className="text-center py-5">
                                    <Loader2 className="animate-spin mx-auto" />
                                </td>
                            </tr>
                        )}

                        {
                        !isLoading && filtered.map((t) => (
                            // PERBAIKAN KEY: Menggabungkan jenis dan ID untuk mengatasi tabrakan ID
                            <tr key={`${t.jenis}-${t.id}`} className="border-b hover:bg-gray-100">
                                <td className="p-3 font-semibold">#{t.id}</td>
                                <td className="p-3">{t.nama_item_utama}</td> 
                                <td className="p-3">{t.jenis}</td>
                                <td className="p-3">{t.payment_method}</td>
                                <td className="p-3 text-[#FF6D1F] font-semibold">
                                    Rp {Number(t.total_amount).toLocaleString("id-ID")}
                                </td>
                                <td className="p-3">
                                    {new Date(t.transaction_date).toLocaleDateString("id-ID")}
                                </td>
                                <td className="p-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs text-white ${
                                            t.status === "Lunas" ? "bg-green-600" : "bg-yellow-600"
                                        }`}
                                    >
                                        {t.status}
                                    </span>
                                </td>
                                <td className="p-3 print:hidden">
                                    <button className="text-blue-600 flex items-center gap-1">
                                        <Eye size={18} /> Detail
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!isLoading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-5 text-gray-500">
                                    Tidak ada transaksi ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}