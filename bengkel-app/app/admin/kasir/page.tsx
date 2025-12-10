"use client"

import { useEffect, useState, useRef } from "react";
import DropdownSearch from "@/components/admin/DropdownSearch";
import StrukPembayaran from "@/components/admin/StrukPembayaran"; 

// --- INTERFACES ---

interface ProductData {
    id: number; name: string; price: number; stock?: number;
}

interface BookingData {
    id: number; user: string; service: string;
}

interface CashierPayload {
    product_id: number | null; booking_id: number | null; payment_method: string;
    total: number; transaction_date: string; is_valid: boolean;
}

interface LastTransactionData extends CashierPayload {
    item_name: string; item_price: number; qty: number;
    extra_name: string | null; extra_price: number;
    bayar: number; kembali: number;
    id?: number; 
    user?: { name: string };
}

// Ambil token dari cookie
const getToken = (): string => document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

export default function KasirPage() {

    const [jenis, setJenis] = useState<"produk" | "booking">("produk");
    const [form, setForm] = useState({
        product_id: null as number | null, booking_id: null as number | null,
        nama: "", harga: "" as string | number, qty: 1, service: "",
        extraName: "", extraPrice: "" as string | number, payment: "Cash",
        bayar: "" as string | number
    });

    const [produk, setProduk] = useState<ProductData[]>([]);
    const [booking, setBooking] = useState<BookingData[]>([]);
    const [lastTransaction, setLastTransaction] = useState<LastTransactionData | null>(null);
    const token = getToken();


    // ===================== GET DATA =====================
    useEffect(() => {
        // Fetch Produk
        fetch("http://localhost:8000/api/products")
            .then(r => r.json())
            .then(res => {
                const list: any[] = res.products || res.data || [];
                setProduk(list.map((p: any) => ({ id: p.id, name: p.name, price: Number(p.price) })));
            });

        // Fetch Booking
        fetch("http://localhost:8000/api/bookings", {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            credentials: "include"
        })
            .then(r => r.json())
            .then(res => {
                const list: any[] = res.bookings || res.data || [];
                setBooking(list.map((b: any) => ({
                    id: b.id, user: b.user?.name || `User-${b.user_id}`, service: b.jenis_service
                })));
            });
    }, [token]);


    // ===================== PERHITUNGAN =====================
    const hargaNum = Number(form.harga || 0);
    const extraPriceNum = Number(form.extraPrice || 0);
    const bayarNum = Number(form.bayar || 0);
    
    const subtotal = hargaNum * (jenis === "produk" ? form.qty : 1);
    const total = subtotal + extraPriceNum;
    const kembali = bayarNum - total;


    // ===================== SIMPAN TRANSAKSI =====================
    const prosesBayar = async () => {
        if (!form.nama || !form.harga || kembali < 0) {
            alert("Lengkapi semua input dan pastikan nominal bayar mencukupi!");
            return;
        }

        const payload: CashierPayload = {
            product_id: jenis === "produk" ? form.product_id : null,
            booking_id: jenis === "booking" ? form.booking_id : null,
            payment_method: form.payment,
            total,
            transaction_date: new Date().toISOString().slice(0, 19).replace("T", " "),
            is_valid: true
        };

        const res = await fetch("http://localhost:8000/api/cashier", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Transaksi berhasil disimpan ✔");
            
            // Simpan data untuk dicetak (memenuhi interface LastTransactionData)
            const transactionData: LastTransactionData = {
                ...payload,
                // Data dari response backend
                id: data.cashier?.id || Math.floor(Math.random() * 10000), 
                // Detail yang diinput kasir
                item_name: form.nama,
                item_price: hargaNum, 
                qty: jenis === "produk" ? form.qty : 1,
                extra_name: form.extraName,
                extra_price: extraPriceNum,
                bayar: bayarNum,
                kembali: kembali
            };

            setLastTransaction(transactionData);
            
            // Reset Form
            setForm({ product_id: null, booking_id: null, nama: "", harga: "", qty: 1, service: "",
              extraName: "", extraPrice: "", payment: "Cash", bayar: "" });
        } else {
            alert("Gagal menyimpan transaksi ❌");
            console.error("API Error:", data);
        }
    };


    // ===================== FUNGSI CETAK (FINAL FIX INJEKSI CSS) =====================
    const handlePrint = () => {
        if (!lastTransaction) {
            alert("Harap simpan transaksi terlebih dahulu sebelum mencetak struk.");
            return;
        }

        // --- 1. CSS Injection untuk Menyembunyikan Admin Panel ---
        const style = document.createElement('style');
        style.id = 'print-style-override';
        style.innerHTML = `
            @media print {
                /* Sembunyikan SEMUA elemen di body secara default */
                body > * {
                    visibility: hidden !important;
                }
                
                /* TARGETING LAYOUT ADMIN: Ganti selector ini jika Anda tahu class/ID spesifik */
                /* Coba sembunyikan semua elemen navigasi utama dan wrapper */
                #root, 
                .admin-layout-wrapper, 
                .sidebar, 
                aside, 
                nav, 
                header,
                .admin-header,
                /* Tambahkan ID/Class spesifik yang terpotong di gambar Anda */
                div[style*="width"], 
                div[style*="position: fixed"] {
                    display: none !important;
                    visibility: hidden !important;
                }

                /* Tampilkan hanya area struk */
                .print-area, .print-area * {
                    visibility: visible !important;
                    position: absolute !important;
                    /* Pindahkan struk ke posisi 0, 0 agar tidak tergeser oleh sidebar */
                    left: 0 !important;
                    top: 0 !important;
                    
                    width: 100% !important;
                    background: white !important;
                    color: black !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    /* Pastikan struk berada di tengah halaman cetak */
                    display: flex;
                    justify-content: center;
                }
                
                /* Atasi masalah margin atau padding yang tersisa di body atau root */
                body, html, #__next {
                    margin: 0 !important;
                    padding: 0 !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // --- 2. Panggil Print ---
        window.print(); 

        // --- 3. Hapus CSS setelah mencetak (dijalankan setelah dialog ditutup) ---
        setTimeout(() => {
            const injectedStyle = document.getElementById('print-style-override');
            if (injectedStyle) {
                document.head.removeChild(injectedStyle);
            }
        }, 100); 
    };


    // ===================== UI =====================
    return (
        <div className="min-h-screen flex justify-center items-center p-6 
          bg-linear-to-br from-sky-50 via-white to-slate-100">

            <div className="w-full max-w-[700px] bg-white rounded-3xl shadow-2xl p-10 border
                            space-y-8 transition-all print:hidden">

                {/* TITLE */}
                <div className="text-center mb-3">
                    <h1 className="text-4xl font-bold text-[#234C6A] drop-shadow-sm">
                        💳 Kasir Bengkel
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Transaksie Pembelian Produk & Service Booking
                    </p>
                </div>


                {/* ================= FORM ================= */}
                <div className="space-y-6">

                    {/* Jenis Transaksi */}
                    <div>
                        <label className="font-semibold block mb-1">Jenis Transaksi</label>
                        <select value={jenis}
                            onChange={e => {
                                setJenis(e.target.value as "produk" | "booking");
                                setForm({ ...form, nama: "", harga: "", product_id: null, booking_id: null, service: "" });
                            }}
                            className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-teal-400">
                            <option value="produk">🛍 Produk</option>
                            <option value="booking">🔧 Booking</option>
                        </select>
                    </div>

                    {/* PRODUK DROPDOWN */}
                    {jenis === "produk" && (
                        <DropdownSearch
                            data={produk}
                            label="Cari Produk"
                            display={(x) => `${x.name} — Rp${x.price.toLocaleString()}`}
                            onSelect={(x) => setForm({ ...form, nama: x.name, harga: x.price, product_id: x.id, booking_id: null, service: "" })}
                        />
                    )}

                    {/* BOOKING DROPDOWN */}
                    {jenis === "booking" && (
                        <DropdownSearch
                            data={booking}
                            label="Pilih Booking / User"
                            display={(x) => `${x.user} — ${x.service}`}
                            onSelect={(x) => setForm({ ...form, nama: x.user, service: x.service, product_id: null, booking_id: x.id, harga: "" })}
                        />
                    )}

                    {/* SERVICE (INFORMASI) */}
                    {jenis === "booking" && form.service && (
                        <input readOnly value={form.service}
                            className="border p-3 rounded-xl w-full bg-gray-100 font-medium" />
                    )}


                    {/* HARGA */}
                    <div>
                        <label className="font-semibold block mb-1">Harga</label>
                        <input type="number" placeholder="Harga"
                            className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-teal-400"
                            value={form.harga}
                            onChange={e => setForm({ ...form, harga: e.target.value })} />
                    </div>

                    {/* QTY HANYA PRODUK */}
                    {jenis === "produk" && (
                        <div>
                            <label className="font-semibold block mb-1">Quantity</label>
                            <input type="number" min={1}
                                className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-teal-400"
                                value={form.qty}
                                onChange={e => setForm({ ...form, qty: Number(e.target.value) })} />
                        </div>
                    )}

                    {/* BIAYA TAMBAHAN */}
                    <div className="grid grid-cols-2 gap-3">
                        <input placeholder="Biaya Tambahan"
                            className="border p-3 rounded-xl"
                            value={form.extraName}
                            onChange={e => setForm({ ...form, extraName: e.target.value })} />
                        <input type="number" placeholder="Rp"
                            className="border p-3 rounded-xl"
                            value={form.extraPrice}
                            onChange={e => setForm({ ...form, extraPrice: e.target.value })} />
                    </div>

                    {/* METODE BAYAR */}
                    <div>
                        <label className="font-semibold block mb-1">Metode Pembayaran</label>
                        <select value={form.payment}
                            onChange={e => setForm({ ...form, payment: e.target.value })}
                            className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-teal-400">
                            <option>Cash</option>
                            <option>Debit Card</option>
                            <option>Credit Card</option>
                            <option>E-Wallet</option>
                        </select>
                    </div>


                    {/* TOTAL */}
                    <div className="text-center font-bold text-2xl p-4 rounded-2xl bg-gray-50 border">
                        Total : <span className="text-orange-600">Rp {total.toLocaleString()}</span>
                    </div>

                    {/* BAYAR */}
                    <input type="number" placeholder="Nominal Bayar"
                        className="border p-3 rounded-xl w-full text-lg focus:ring-2 focus:ring-teal-400"
                        value={form.bayar}
                        onChange={e => setForm({ ...form, bayar: e.target.value })} />

                    {/* KEMBALIAN */}
                    <p className="text-center font-bold text-xl">
                        Kembalian:
                        <span className={`${kembali < 0 ? "text-red-500" : "text-green-600"} ml-1`}>
                            Rp {kembali.toLocaleString()}
                        </span>
                    </p>

                    {/* SIMPAN & CETAK BUTTONS */}
                    <div className="flex gap-4">
                        <button onClick={prosesBayar}
                            className="bg-[#234C6A] hover:bg-[#16364a] active:scale-95 text-white 
                            font-bold w-full p-4 rounded-xl shadow-lg text-lg transition">
                            Simpan Transaksi
                        </button>
                        
                        {/* TOMBOL CETAK */}
                        <button onClick={handlePrint}
                            disabled={!lastTransaction}
                            className={`font-bold w-full p-4 rounded-xl shadow-lg text-lg transition 
                                ${lastTransaction ? 'bg-[#FF6D1F] hover:bg-orange-700 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}>
                            Cetak Struk
                        </button>
                    </div>

                </div>
            </div>

            {/* ================= AREA STRUK CETAK ================= */}
            {lastTransaction && (
                <div className="print-area hidden print:block absolute top-0 left-0 w-full h-full p-4">
                    <StrukPembayaran data={lastTransaction} />
                </div>
            )}
        </div>
    );
}