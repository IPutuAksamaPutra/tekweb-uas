"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, User, Send, ShoppingBag } from "lucide-react";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

// ======================= CART ITEM TYPE =======================
interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    product: {
        name: string;
        price: number;        // sudah mendukung harga promo
        original_price?: number;
        img_url?: string;
    };
}

// Token helper
const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
};

export default function CheckoutPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [shipping, setShipping] = useState("reguler");
    const [paymentMethod, setPaymentMethod] = useState("transfer");

    const [bank, setBank] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // ======================== FETCH CART ========================
    const fetchCart = async () => {
        const token = getCookie("token");
        if (!token) return alert("Login dulu!");

        const res = await fetch("http://localhost:8000/api/cart", {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setCart(data.cart_items ?? []);
    };

    useEffect(() => { fetchCart(); }, []);

    // ======================= PERHITUNGAN =======================
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingCost = shipping === "express" ? 25000 : 10000;
    const total = subtotal + shippingCost;

    // ======================= HANDLE CHECKOUT =======================
    const handleCheckout = async () => {
        if (!recipientName || !phone || !address)
            return alertError("Lengkapi data penerima dulu!");

        if (paymentMethod === "transfer" && bank === "")
            return alertError("Pilih bank untuk pembayaran transfer!");

        const token = getCookie("token");
        if (!token) return alert("Login dulu!");

        const payload = {
            items: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                subtotal: item.product.price * item.quantity
            })),
            name: recipientName,
            no_tlp: phone,
            address,
            delivery: "kurir",          // bebas, kamu sudah pakai ini
            payment: paymentMethod,
            bank: bank || null,
            total
        };

        const res = await fetch("http://localhost:8000/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
            console.log(data);
            return alert("Checkout gagal, cek console!");
        }

        alertSuccess("Pesanan berhasil dibuat!");
        window.location.href = "/marketplace/pesanan";
    };

    const inputBase = "w-full border-2 rounded-xl p-3 outline-none text-gray-900 focus:border-[#FF6D1F]";

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">

                {/* ================= FORM ================= */}
                <div className="flex-1">
                    <div className="bg-white p-8 shadow-xl rounded-2xl border-t-8 border-[#234C6A]">
                        <h1 className="text-3xl font-bold text-[#234C6A] flex items-center gap-3 mb-8">
                            <ShoppingBag className="text-[#FF6D1F]" /> Checkout Pesanan
                        </h1>

                        <div className="space-y-6">

                            <div>
                                <label className="font-bold text-[#234C6A] flex items-center gap-2 ">
                                    <User size={18} className="text-[#FF6D1F]" /> Nama Penerima
                                </label>
                                <input className={inputBase} value={recipientName} onChange={e => setRecipientName(e.target.value)} />
                            </div>

                            <div>
                                <label className="font-bold text-[#234C6A] flex items-center gap-2">
                                    <Phone size={18} className="text-[#FF6D1F]" /> Nomor Telepon
                                </label>
                                <input className={inputBase} value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>

                            <div>
                                <label className="font-bold text-[#234C6A] flex items-center gap-2">
                                    <MapPin size={18} className="text-[#FF6D1F]" /> Alamat Lengkap
                                </label>
                                <textarea className={`${inputBase} h-24`} value={address} onChange={e => setAddress(e.target.value)} />
                            </div>

                            {/* PENGIRIMAN */}
                            <div>
                                <label className="font-bold text-[#234C6A]">Metode Pengiriman</label>
                                <select className={inputBase} value={shipping} onChange={e => setShipping(e.target.value)}>
                                    <option value="reguler">Reguler (Rp 10.000)</option>
                                    <option value="express">Express (Rp 25.000)</option>
                                </select>
                            </div>

                            {/* PEMBAYARAN + BANK */}
                            <div className="space-y-3">
                                <label className="font-bold text-[#234C6A]">Metode Pembayaran</label>
                                <select className={inputBase} value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
                                    <option value="transfer">Transfer Bank</option>
                                    <option value="tunai">Tunai (COD)</option>
                                </select>

                                {paymentMethod === "transfer" && (
                                    <div className="mt-2 space-y-3 bg-gray-50 p-4 rounded-xl border">
                                        <label className="font-semibold text-gray-700">Pilih Bank</label>
                                        <select className={inputBase} value={bank} onChange={(e)=>setBank(e.target.value)}>
                                            <option value="">-- Pilih Bank --</option>
                                            <option value="BCA">BCA</option>
                                            <option value="BRI">BRI</option>
                                            <option value="BNI">BNI</option>
                                            <option value="MANDIRI">Mandiri</option>
                                        </select>

                                        {bank && (
                                            <div className="mt-2 text-gray-800 text-sm bg-white p-3 rounded-lg border">
                                                <p><b>Bank:</b> {bank}</p>
                                                <p><b>No Rekening:</b> 123 456 7890</p>
                                                <p><b>A/N:</b> Bengkel Motor Jaya</p>
                                                <p className="text-red-500 mt-2"><b>* Upload bukti bayar setelah transfer!</b></p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= RINGKASAN ================= */}
                <div className="w-full md:w-96">
                    <div className="bg-white p-6 shadow-xl rounded-2xl border-t-8 border-[#FF6D1F] md:sticky top-10">

                        <h2 className="text-2xl font-bold text-[#234C6A] border-b pb-3 mb-4">Ringkasan Pesanan</h2>

                        <div className="space-y-1 text-black">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between border-b py-1">
                                    <span>{item.product.name} x{item.quantity}</span>
                                    <span>Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 space-y-2 text-black">
                            <div className="flex justify-between"><span>Subtotal</span><span>Rp {subtotal.toLocaleString("id-ID")}</span></div>
                            <div className="flex justify-between"><span>Ongkir</span><span>Rp {shippingCost.toLocaleString("id-ID")}</span></div>
                            <div className="flex justify-between font-bold text-xl border-t pt-3">
                                <span>Total</span>
                                <span className="text-[#FF6D1F]">Rp {total.toLocaleString("id-ID")}</span>
                            </div>
                        </div>

                        <button onClick={handleCheckout}
                            className="mt-6 w-full bg-[#FF6D1F] hover:bg-[#E05B1B] text-white py-3 rounded-full flex items-center justify-center gap-2 font-bold">
                            <Send size={18}/> Buat Pesanan
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
