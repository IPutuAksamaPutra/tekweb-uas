"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, User, CreditCard, Truck } from "lucide-react";

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

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">

      {/* LEFT — FORM */}
      <div className="flex-1 bg-white p-6 shadow-lg rounded-xl border">

        <h1 className="text-2xl font-bold text-[#234C6A] mb-6">
          Checkout
        </h1>

        {/* FORM PEMBELI */}
        <div className="space-y-5">

          {/* NAMA */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
              <User size={18} /> Nama Penerima
            </label>
            <input
              type="text"
              placeholder="Nama lengkap"
              className="w-full border rounded-xl p-3 bg-gray-50"
            />
          </div>

          {/* NO HP */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
              <Phone size={18} /> Nomor Telepon
            </label>
            <input
              type="text"
              placeholder="08xxxxxxxxxx"
              className="w-full border rounded-xl p-3 bg-gray-50"
            />
          </div>

          {/* ALAMAT */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
              <MapPin size={18} /> Alamat Lengkap
            </label>
            <textarea
              placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan..."
              className="w-full border rounded-xl p-3 bg-gray-50 h-24"
            ></textarea>
          </div>

          {/* PENGIRIMAN */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
              <Truck size={18} /> Metode Pengiriman
            </label>

            <select
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
              className="w-full border rounded-xl p-3 bg-gray-50"
            >
              <option value="reguler">Reguler (Rp 10.000)</option>
              <option value="express">Express (Rp 25.000)</option>
            </select>
          </div>

          {/* PEMBAYARAN */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
              <CreditCard size={18} /> Metode Pembayaran
            </label>

            <select
              className="w-full border rounded-xl p-3 bg-gray-50"
            >
              <option>Transfer Bank</option>
              <option>COD (Bayar di Tempat)</option>
              <option>E-Wallet (Dana, OVO, GOPAY)</option>
            </select>
          </div>
        </div>
      </div>

      {/* RIGHT — SUMMARY */}
      <div className="w-full md:w-80 bg-white p-6 shadow-lg rounded-xl border h-fit">
        
        <h2 className="text-xl font-bold text-[#234C6A] border-b pb-3 mb-4">
          Ringkasan Belanja
        </h2>

        <div className="space-y-3">

          {/* SUBTOTAL */}
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>

          {/* ONGKIR */}
          <div className="flex justify-between text-gray-700">
            <span>Ongkos Kirim</span>
            <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
          </div>

          <hr />

          {/* TOTAL */}
          <div className="flex justify-between font-bold text-lg text-[#FF6D1F]">
            <span>Total</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* BUTTON */}
        <button
          className="w-full mt-5 bg-[#FF6D1F] hover:bg-orange-600 text-white 
          font-semibold py-3 rounded-xl shadow-md transition"
        >
          Bayar Sekarang
        </button>
      </div>
    </div>
  );
}
