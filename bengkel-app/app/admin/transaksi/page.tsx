'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Loader2, AlertTriangle, ChevronDown, FileText, Printer, ChevronLeft, ChevronRight } from 'lucide-react'; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
    // Tambahkan properti khusus untuk membedakan asal data di normalization
    is_order: boolean; 
}

// --- Filter Types ---
type FilterType = 'Semua' | 'Produk' | 'Booking' | 'Jasa Manual' | 'Campuran' | 'Pelunasan Order';


export default function TransaksiPage() {
    // ... (States Anda tetap sama)
    const [search, setSearch] = useState("");
    const [filterJenis, setFilterJenis] = useState<FilterType>('Semua');
    const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 


    // ==================== LOGIKA PEMBENTUKAN DATA ====================
    
    // Fungsi untuk menormalisasi data
    const normalizeData = (rawData: any[]): Transaksi[] => {
        return rawData.map((t: any) => {
            let jenis: Transaksi['jenis'] = 'Campuran';
            let namaUtama = `Transaksi #${t.id}`;
            const total = Number(t.total_amount || t.total || 0); 
            const status = (t.status === 'Lunas' || total > 0) ? "Lunas" : "Pending"; 
            
            const items: TransactionItem[] = Array.isArray(t.items) ? t.items : [];

            // 🔥 Logika Pelunasan Order dari tabel 'orders'
            if (t.is_order) { 
                // Jika ini adalah data yang berasal dari tabel 'orders'
                jenis = 'Pelunasan Order'; 
                // Sesuaikan nama field jika berbeda di tabel orders
                const customerName = t.customer_name || t.user?.name || 'Pelanggan';
                namaUtama = `Order #${t.id} (${t.jenis_service || 'Service'}) - ${customerName}`;
            
            // Logika Transaksi POS (dari tabel 'transactions')
            } else if (items.length > 0) {
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
                is_order: !!t.is_order, // Menandai asal data
            } as Transaksi;
        });
    };


    // ==================== LOAD ORDERS (SUMBER 2) ====================
    const fetchApiData = async (endpoint: string, token: string) => {
        const fetchOptions = {
            method: "GET",
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        };
        const res = await fetch(`${API_URL}${endpoint}`, fetchOptions); 
        
        if (res.status === 404) {
             throw new Error(`Endpoint '${endpoint}' tidak ditemukan.`);
        }
        if (!res.ok) {
            throw new Error(`Gagal mengambil data dari ${endpoint}. Status: ${res.status}`);
        }
        
        const data = await res.json();
        return data.data || data.transactions || data.orders || [];
    }

    // ==================== LOAD ALL DATA (GABUNGAN) ====================
    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            try {
                setError(null);
                const token = getCookie("token");

                if (!token) {
                    setError("Token tidak ditemukan. Silakan login ulang.");
                    return;
                }
                
                // 1. Ambil data TRANSAKSI POS
                const rawTransactions = await fetchApiData('/transactions', token);
                
                // 2. Ambil data ORDERS (Pelunasan Order)
                // ASUMSI: Rute Admin Order Anda adalah '/admin/orders'
                const rawOrders = await fetchApiData('/admin/orders', token);
                
                // 3. Gabungkan dan tandai asal data
                const combinedRawData = [
                    ...rawTransactions.map((t:any) => ({...t, is_order: false})),
                    ...rawOrders.map((o:any) => ({
                        ...o, 
                        // Ambil jumlah yang harus dibayar (contoh: total_price)
                        total_amount: o.total_price || o.total || 0,
                        transaction_date: o.updated_at || o.created_at,
                        payment_method: o.payment_method || 'Bayar di Tempat',
                        is_order: true,
                    }))
                ];
                
                // Urutkan berdasarkan tanggal transaksi terbaru (opsional)
                combinedRawData.sort((a:any, b:any) => 
                    new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
                );
                
                const processed = normalizeData(combinedRawData);
                setTransaksiList(processed);

            } catch (err: any) {
                console.error("Fetch Error:", err);
                setError(err.message || "Terjadi kesalahan saat koneksi atau pemrosesan data.");
            } finally {
                setIsLoading(false);
            }
        };

        loadAllData();
    }, []);

    // ------------------------------------------------------------------
    // 🔥 Solusi: Inject CSS Cetak Lokal ke dalam Head (Pertahankan)
    // ------------------------------------------------------------------
    useEffect(() => {
        const styleId = 'transaction-print-styles';
        let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;

        const printStyles = `
            @media print {
                .print-hidden, .header, .sidebar, .no-print { display: none !important; }
                body { margin: 0; padding: 0; }
                .print-title { text-align: center; margin-bottom: 20px; font-size: 1.5rem; font-weight: bold; color: black; }
                .print-table { width: 100%; border-collapse: collapse; }
                .print-table th, .print-table td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 10px; }
                .print-table th { background-color: #f0f0f0; color: black; }
                .print-only { display: block !important; }
            }
        `;

        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = printStyles;
    }, []); 

    // ... (Logika FILTER & PAGINASI, EKSPOR, dan UI tetap sama)
    // ==================== FILTER & PAGINASI LOGIC ====================
    const paginatedList = useMemo(() => {
        let list = transaksiList;

        // 1. Filter Dropdown Jenis
        if (filterJenis !== 'Semua') {
            list = list.filter(t => t.jenis === filterJenis);
        }

        // 2. Filter Search Bar
        const searchTerm = search.trim().toLowerCase();
        if (searchTerm !== "") {
            list = list.filter((t) =>
                t.nama_item_utama.toLowerCase().includes(searchTerm) || 
                t.id.toString().includes(searchTerm)
            );
        }

        // --- Paginasi ---
        const totalItems = list.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Sesuaikan current page jika sudah melewati batas
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (currentPage === 0 && totalPages > 0) {
            setCurrentPage(1);
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        // Item yang ditampilkan di halaman saat ini
        const currentItems = list.slice(startIndex, endIndex);

        return {
            items: currentItems,
            totalItems,
            totalPages,
        };
    }, [transaksiList, search, filterJenis, currentPage, itemsPerPage]);

    const { items: filtered, totalItems, totalPages } = paginatedList;

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset ke halaman 1 setiap kali limit berubah
    };

    // ==================== FUNGSI EKSPOR ====================
    const exportToExcel = () => {
        if (transaksiList.length === 0) {
            alert("Tidak ada data transaksi untuk diekspor.");
            return;
        }

        setIsExportDropdownOpen(false); 

        const dataForExport = transaksiList.map((t, index) => ({
            "No Urut": index + 1, // Tambahkan penomoran di ekspor
            "ID Transaksi/Order": t.id,
            "Jenis Sumber": t.is_order ? "Order" : "Transaksi POS",
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
            <h1 className="text-2xl lg:text-3xl font-bold text-[#234C6A] print-title">📄 Riwayat Transaksi Kasir</h1>

            {/* CONTAINER BAR FILTER & EXPORT */}
            <div className="flex justify-between items-center flex-wrap gap-3 lg:gap-4 print-hidden"> 
                
                {/* Search Bar */}
                <div className="flex items-center bg-white p-3 rounded-xl shadow gap-3 w-full md:max-w-sm">
                    <Search size={20} className="text-gray-500" />
                    <input
                        placeholder="Cari ID transaksi atau nama item..."
                        className="w-full outline-none"
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                </div>
                
                {/* Dropdown Group */}
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
                                    Ekspor ke Excel (Semua)
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
                <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg print-hidden">
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            {/* TABEL CONTAINER */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-left text-sm print-table">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3 min-w-[70px]">No.</th>
                            <th className="p-3 min-w-[200px]">Item/Deskripsi</th>
                            <th className="p-3 min-w-[100px]">Jenis</th>
                            <th className="p-3 min-w-[100px]">Metode</th>
                            <th className="p-3 min-w-[120px]">Total</th>
                            <th className="p-3 min-w-[100px]">Tanggal</th>
                            <th className="p-3 print-hidden min-w-20">Status</th>
                            <th className="p-3 print-hidden min-w-20">Aksi</th>
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
                        !isLoading && filtered.map((t, index) => (
                            <tr key={`${t.jenis}-${t.id}`} className="border-b hover:bg-gray-100">
                                {/* Menampilkan Nomor Urut (index + start Index + 1) */}
                                <td className="p-3 font-semibold">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                
                                <td className="p-3">{t.nama_item_utama}</td> 
                                <td className="p-3">{t.jenis}</td>
                                <td className="p-3">{t.payment_method}</td>
                                <td className="p-3 text-[#FF6D1F] font-semibold print:text-black">
                                    Rp {Number(t.total_amount).toLocaleString("id-ID")}
                                </td>
                                <td className="p-3">
                                    {new Date(t.transaction_date).toLocaleDateString("id-ID")}
                                </td>
                                <td className="p-3 print-hidden">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs text-white ${
                                            t.status === "Lunas" ? "bg-green-600" : "bg-yellow-600"
                                        }`}
                                    >
                                        {t.status}
                                    </span>
                                </td>
                                <td className="p-3 print-hidden">
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

            {/* KONTROL PAGINASI */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 print-hidden">
                
                {/* Info Jumlah Item & Pengaturan Limit */}
                <div className="flex items-center gap-3 text-sm text-gray-700">
                    <span>
                        Menampilkan {(currentPage - 1) * itemsPerPage + 1} - 
                        {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} transaksi
                    </span>
                    
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="p-1 border border-gray-300 rounded-md"
                    >
                        <option value={5}>5 / hlm</option>
                        <option value={10}>10 / hlm</option>
                        <option value={20}>20 / hlm</option>
                        <option value={50}>50 / hlm</option>
                    </select>
                </div>

                {/* Tombol Navigasi */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                        className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    <span className="text-sm font-semibold text-gray-700">
                        Halaman {totalPages > 0 ? currentPage : 0} dari {totalPages}
                    </span>
                    
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading || totalPages === 0}
                        className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}