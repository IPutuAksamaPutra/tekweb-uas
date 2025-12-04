"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, User, CreditCard, Truck, ShoppingBag, Send } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image_url?: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState("reguler");
  const [paymentMethod, setPaymentMethod] = useState("transfer");

  // === DATA DUMMY UNTUK SIMULASI KERANJANG ===
  const dummyCart: CartItem[] = [
    { id: 101, name: "Oli Mesin Matic Premium", price: 65000, qty: 2 },
    { id: 102, name: "Filter Udara Kualitas Tinggi", price: 85000, qty: 1 },
  ];
  // ==========================================

  // Load cart from localStorage / Set dummy data if cart is empty
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    let initialCart = [];
    try {
        initialCart = saved ? JSON.parse(saved) : dummyCart;
    } catch {
        initialCart = dummyCart;
    }

    if (initialCart.length === 0) {
        initialCart = dummyCart;
    }
    
    setCart(initialCart);
    localStorage.setItem("cart", JSON.stringify(initialCart)); // Save dummy data if storage was empty
  }, []);

  // Hitung total barang
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // Ongkir dummy
  const shippingCost =
    shipping === "express" ? 25000 : 10000;

  const total = subtotal + shippingCost;

  // Kelas dasar untuk input
  const BASE_INPUT_CLASSES = "w-full border-2 rounded-xl p-3 outline-none transition duration-200 text-gray-800 placeholder-gray-500 focus:border-[#FF6D1F] focus:bg-white";


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">

        {/* ================= LEFT — FORM DATA PENGIRIMAN ================= */}
        <div className="flex-1">
            <div className="bg-white p-8 shadow-2xl rounded-2xl border-t-8 border-[#234C6A]">
            
                <h1 className="text-3xl font-bold text-[#234C6A] mb-8 flex items-center gap-3">
                    <ShoppingBag size={30} className="text-[#FF6D1F]" /> Konfirmasi Checkout
                </h1>

                {/* FORM PEMBELI */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-700 border-b pb-2">Detail Penerima</h2>
                    
                    {/* NAMA */}
                    <div>
                        <label className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
                            <User size={18} className="text-[#FF6D1F]" /> Nama Penerima
                        </label>
                        <input
                            type="text"
                            placeholder="Nama lengkap"
                            required
                            className={BASE_INPUT_CLASSES}
                        />
                    </div>

                    {/* NO HP */}
                    <div>
                        <label className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
                            <Phone size={18} className="text-[#FF6D1F]" /> Nomor Telepon
                        </label>
                        <input
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            required
                            className={BASE_INPUT_CLASSES}
                        />
                    </div>

                    {/* ALAMAT */}
                    <div>
                        <label className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
                            <MapPin size={18} className="text-[#FF6D1F]" /> Alamat Lengkap
                        </label>
                        <textarea
                            placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan..."
                            required
                            className={`${BASE_INPUT_CLASSES} h-24`}
                        ></textarea>
                    </div>

                    {/* PENGIRIMAN */}
                    <div className="pt-4">
                        <h2 className="text-xl font-bold text-gray-700 border-b pb-2 mb-3">Metode Pengiriman</h2>
                        
                        <label className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
                            <Truck size={18} className="text-[#234C6A]" /> Pilihan Kurir
                        </label>

                        <select
                            value={shipping}
                            onChange={(e) => setShipping(e.target.value)}
                            className={BASE_INPUT_CLASSES}
                        >
                            <option value="reguler">Reguler (3-5 hari kerja) - Rp {10000..toLocaleString("id-ID")}</option>
                            <option value="express">Express (1-2 hari kerja) - Rp {25000..toLocaleString("id-ID")}</option>
                        </select>
                    </div>

                    {/* PEMBAYARAN */}
                    <div className="pt-4">
                        <h2 className="text-xl font-bold text-gray-700 border-b pb-2 mb-3">Metode Pembayaran</h2>

                        <label className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
                            <CreditCard size={18} className="text-[#234C6A]" /> Opsi Pembayaran
                        </label>

                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className={BASE_INPUT_CLASSES}
                        >
                            <option value="transfer">Transfer Bank (BCA/Mandiri)</option>
                            <option value="cod">COD (Bayar di Tempat)</option>
                            <option value="ewallet">E-Wallet (Dana, OVO, GOPAY)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* ================= RIGHT — SUMMARY ================= */}
        <div className="w-full md:w-96">
          <div className="bg-white p-6 shadow-2xl rounded-2xl border-t-8 border-[#FF6D1F] md:sticky md:top-6">
            
            <h2 className="text-2xl font-bold text-[#234C6A] border-b pb-3 mb-5">
              Ringkasan Order
            </h2>

            {/* DETAIL ITEMS */}
            <div className="space-y-3 text-sm mb-4 max-h-48 overflow-y-auto pr-2">
                <h3 className="text-gray-600 font-semibold mb-2">Item ({cart.length})</h3>
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-gray-700 border-b border-dashed pb-2">
                        <span className="truncate pr-2">{item.name} ({item.qty}x)</span>
                        <span>Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                    </div>
                ))}
            </div>
            
            <hr className="my-4" />

            {/* DETAIL HARGA */}
            <div className="space-y-3">
              {/* SUBTOTAL */}
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Harga Produk</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>

              {/* ONGKIR */}
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Ongkos Kirim ({shipping === 'express' ? 'Express' : 'Reguler'})</span>
                <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
              </div>

              {/* TOTAL */}
              <div className="flex justify-between font-bold text-xl pt-3 border-t-2 border-dashed border-gray-300">
                <span className="text-[#234C6A]">TOTAL BAYAR</span>
                <span className="text-[#FF6D1F]">Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* BUTTON */}
            <button
              className="w-full mt-6 flex items-center justify-center gap-2 bg-[#FF6D1F] hover:bg-[#E05B1B] text-white 
              font-bold py-3 rounded-full shadow-lg shadow-[#FF6D1F]/40 transition transform hover:scale-[1.01]"
            >
              <Send size={20} /> Bayar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}