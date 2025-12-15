"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Loader2, AlertTriangle, ChevronDown, FileText, Printer } from "lucide-react"; 
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { alertSuccess, alertError, alertLoginRequired, alertConfirmDelete, alertValidation, alertValidate } from "@/components/Alert";

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

// --- Interfaces yang Dibutuhkan ---
interface ProductData {
    id: number;
    name: string;
}

interface BookingData {
    id: number;
    customer_name?: string; 
}

interface Transaksi {
    id: number;
    product_id: number | null;
    booking_id: number | null;
    payment_method: string;
    total: string;
    transaction_date: string;
    
    product: ProductData | null;
    booking: BookingData | null;

    jenis: "Booking" | "Produk" | "Campuran";
    nama_item: string;
    status: "Lunas" | "Pending";
}

export default function TransaksiPage() {
    const [search, setSearch] = useState("");
    const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State untuk dropdown

    // ==================== LOAD DATA ====================
    useEffect(() => {
        const loadTransactions = async () => {
            try {
                setError(null);
                const token = getCookie("token");

                if (!token) {
                    setError("Token tidak ditemukan. Silakan login ulang.");
                    setIsLoading(false);
                    return;
                }

                const res = await fetch(`${API_URL}/cashier`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.status === 401 || res.status === 403) {
                    setError("Akses ditolak: Token tidak valid atau expired.");
                    setIsLoading(false);
                    return;
                }

                if (!res.ok) {
                    throw new Error("Gagal mengambil transaksi. Status: " + res.status);
                }

                const data = await res.json();
                
                let rawData: any[];

                if (data.data && Array.isArray(data.data)) {
                    rawData = data.data;
                } else if (Array.isArray(data.transactions)) {
                    rawData = data.transactions;
                } else if (Array.isArray(data)) {
                    rawData = data;
                } else {
                    rawData = [];
                }
                
                // --- Pemrosesan Data ---
                const processed: Transaksi[] = rawData.map((t: any) => {
                    const isProduct = t.product_id !== null;
                    const isBooking = t.booking_id !== null;
                    
                    let itemDescription = '';

                    if (isProduct) {
                        itemDescription = t.product?.name || `Produk ID ${t.product_id}`;
                    } else if (isBooking) {
                        itemDescription = t.booking?.customer_name || `Booking ID ${t.booking_id}`; 
                    } else {
                        itemDescription = 'Transaksi Service/Campuran'; 
                    }

                    return {
                        ...t,
                        jenis: isProduct ? "Produk" : (isBooking ? "Booking" : "Campuran"),
                        nama_item: itemDescription,
                        status:
                            (t.payment_method === "Cash" || t.is_paid === 1 || t.status === 'Lunas')
                                ? "Lunas"
                                : "Pending",
                    };
                });

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

    // Filter berdasarkan input pencarian
    const filtered = transaksiList.filter((t) =>
        t.nama_item.toLowerCase().includes(search.toLowerCase()) || 
        t.id.toString().includes(search.toLowerCase())
    );

    // ==================== FUNGSI EKSPOR ====================

    const exportToExcel = () => {
        if (transaksiList.length === 0) {
            alert("Tidak ada data transaksi untuk diekspor.");
            return;
        }

        setIsDropdownOpen(false); 

        const dataForExport = transaksiList.map((t) => ({
            ID: t.id,
            "Tanggal Transaksi": new Date(t.transaction_date).toLocaleDateString("id-ID"),
            "Item/Deskripsi": t.nama_item,
            "Jenis Transaksi": t.jenis,
            "Metode Pembayaran": t.payment_method,
            "Total (Rp)": Number(t.total), 
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
        setIsDropdownOpen(false); 
        window.print();
    };


    // ==================== UI ====================
    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-[#234C6A]">📄 Riwayat Transaksi Kasir</h1>

            <div className="flex justify-between items-center">
                {/* Search Bar */}
                <div className="flex items-center bg-white p-3 rounded-xl shadow gap-3 w-full max-w-lg print:hidden">
                    <Search size={20} className="text-gray-500" />
                    <input
                        placeholder="Cari ID transaksi atau nama item..."
                        className="w-full outline-none"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Dropdown Cetak/Ekspor */}
                <div className="relative print:hidden">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    >
                        Cetak / Ekspor
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    
                    {/* Konten Dropdown */}
                    {isDropdownOpen && (
                        <div 
                            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                            onBlur={() => setIsDropdownOpen(false)}
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


            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
                <table className="min-w-full border-collapse text-left print:table">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3">ID</th>
                            <th className="p-3">Item/Deskripsi</th>
                            <th className="p-3">Jenis</th>
                            <th className="p-3">Metode</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Tanggal</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 print:hidden">Aksi</th>
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

                        {/* PERBAIKAN HYDRATION ERROR: TR dan TD diletakkan pada baris yang sama */
                        !isLoading && filtered.map((t) => (
                            <tr key={t.id} className="border-b hover:bg-gray-100">
                                <td className="p-3 font-semibold">#{t.id}</td>
                                <td className="p-3">{t.nama_item}</td>
                                <td className="p-3">{t.jenis}</td>
                                <td className="p-3">{t.payment_method}</td>
                                <td className="p-3 text-[#FF6D1F] font-semibold">
                                    Rp {Number(t.total).toLocaleString("id-ID")}
                                </td>
                                <td className="p-3">
                                    {new Date(t.transaction_date).toLocaleDateString("id-ID")}
                                </td>
                                <td className="p-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm text-white ${
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