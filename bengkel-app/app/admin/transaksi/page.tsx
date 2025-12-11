"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Loader2, AlertTriangle } from "lucide-react";

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
    // Asumsi: customer_name didapatkan dari relasi user di BookingController
    customer_name?: string; 
}

interface Transaksi {
    id: number;
    product_id: number | null;
    booking_id: number | null;
    payment_method: string;
    total: string;
    transaction_date: string;
    
    // Relasi dari Eager Loading CashierController@index
    product: ProductData | null;
    booking: BookingData | null;

    // Data yang diproses
    jenis: "Booking" | "Produk" | "Campuran";
    nama_item: string;
    status: "Lunas" | "Pending";
}

export default function TransaksiPage() {
    const [search, setSearch] = useState("");
    const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

                // 🔥 Panggil API ke endpoint Cashier Index
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
                
                // FIX: Penanganan respons Laravel Pagination (data.data)
                let rawData: any[];

                if (data.data && Array.isArray(data.data)) {
                    // Kasus 1: Menggunakan Laravel Pagination ({ data: [...] })
                    rawData = data.data;
                } else if (Array.isArray(data.transactions)) {
                    // Kasus 2: Key custom 'transactions'
                    rawData = data.transactions;
                } else if (Array.isArray(data)) {
                    // Kasus 3: Respons root adalah array
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
                        // Membaca relasi produk yang dimuat oleh CashierController@index
                        itemDescription = t.product?.name || `Produk ID ${t.product_id}`;
                    } else if (isBooking) {
                        // Membaca relasi booking yang dimuat oleh CashierController@index
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

    // ==================== UI ====================
    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-[#234C6A]">📄 Riwayat Transaksi Kasir</h1>

            <div className="flex items-center bg-white p-3 rounded-xl shadow gap-3 w-full max-w-lg">
                <Search size={20} className="text-gray-500" />
                <input
                    placeholder="Cari ID transaksi atau nama item..."
                    className="w-full outline-none"
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3">ID</th>
                            <th className="p-3">Item/Deskripsi</th>
                            <th className="p-3">Jenis</th>
                            <th className="p-3">Metode</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Tanggal</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Aksi</th>
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

                        {!isLoading &&
                            filtered.map((t) => (
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
                                                t.status === "Lunas"
                                                    ? "bg-green-600"
                                                    : "bg-yellow-600"
                                            }`}
                                        >
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
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