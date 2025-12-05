"use client";

import { useEffect, useState } from "react";
import { CreditCard, Wallet, QrCode, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Ambil cart dari localStorage
export default function PembayaranPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [bayar, setBayar] = useState("");
  const [metode, setMetode] = useState("tunai");

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const kembalian = Number(bayar) - total;

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const handleBayar = () => {
    if (bayar === "" || Number(bayar) < total) return alert("Uang bayar kurang!");

    alert(`
    Pembayaran Berhasil!
    Total: Rp ${total.toLocaleString()}
    Bayar: Rp ${Number(bayar).toLocaleString()}
    Kembali: Rp ${kembalian.toLocaleString()}
    Metode: ${metode}
    `);

    localStorage.removeItem("cart"); // clear keranjang
  };

  return (
    <div className="p-10 space-y-6 max-w-3xl mx-auto">
      
      <Link href="/admin/kasir" className="flex items-center gap-2 text-[#234C6A] hover:underline">
        <ArrowLeft size={18}/> Kembali
      </Link>

      <h1 className="text-3xl font-bold text-[#234C6A]">💳 Pembayaran</h1>


      {/* ==================== LIST PRODUK ==================== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-bold text-lg mb-3">Detail Transaksi</h2>

        {cart.length === 0 && (
          <p className="text-gray-500">Belum ada item di keranjang.</p>
        )}

        {cart.map((item, i) => (
          <div key={i} className="flex justify-between border-b py-2 text-gray-700">
            <span>{item.name} x {item.qty}</span>
            <span>Rp {(item.qty * item.price).toLocaleString()}</span>
          </div>
        ))}

        <div className="flex justify-between mt-4 font-bold text-xl">
          <span>Total Bayar:</span>
          <span className="text-[#FF6D1F]">Rp {total.toLocaleString()}</span>
        </div>
      </div>


      {/* ==================== METODE PEMBAYARAN ==================== */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-bold text-lg">Metode Pembayaran</h2>

        <div className="grid grid-cols-3 gap-4">

          <button
            className={`p-3 border rounded-xl flex flex-col items-center gap-2 hover:shadow
            ${metode === "tunai" ? "border-[#FF6D1F] bg-orange-50" : "border-gray-300"}`}
            onClick={() => setMetode("tunai")}
          >
            <Wallet size={24}/>
            Tunai
          </button>

          <button
            className={`p-3 border rounded-xl flex flex-col items-center gap-2 hover:shadow
            ${metode === "transfer" ? "border-[#234C6A] bg-blue-50" : "border-gray-300"}`}
            onClick={() => setMetode("transfer")}
          >
            <CreditCard size={24}/>
            Transfer
          </button>

          <button
            className={`p-3 border rounded-xl flex flex-col items-center gap-2 hover:shadow
            ${metode === "qris" ? "border-green-600 bg-green-50" : "border-gray-300"}`}
            onClick={() => setMetode("qris")}
          >
            <QrCode size={24}/>
            QRIS
          </button>

        </div>
      </div>


      {/* ==================== INPUT PEMBAYARAN ==================== */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-bold text-lg">Masukkan Nominal Pembayaran</h2>
        
        <input
          type="number"
          placeholder="Masukkan nominal..."
          className="border p-3 rounded-xl w-full text-lg"
          value={bayar}
          onChange={(e)=>setBayar(e.target.value)}
        />

        {bayar && (
          <p className={`font-bold text-lg ${
            kembalian < 0 ? "text-red-600" : "text-green-600"
          }`}>
            Kembalian: Rp {kembalian.toLocaleString()}
          </p>
        )}

        <button
          onClick={handleBayar}
          disabled={bayar === "" || Number(bayar) < total}
          className="w-full bg-[#FF6D1F] disabled:bg-gray-400 text-white py-3 rounded-xl text-lg font-semibold hover:bg-orange-600 transition"
        >
          Bayar Sekarang
        </button>
      </div>

    </div>
  );
}
