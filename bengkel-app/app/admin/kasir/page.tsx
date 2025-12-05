"use client";
import Link from "next/link";

export default function KasirPage() {
  return (
    <div className="p-10 space-y-6">

      <h1 className="text-3xl font-bold text-[#234C6A]">💳 Sistem Kasir Bengkel</h1>
      <p className="text-gray-600">Pilih jenis transaksi untuk diproses:</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Produk */}
        <Link 
          href="/admin/kasir/produk"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg hover:border-[#FF6D1F] border transition block"
        >
          <h2 className="font-bold text-xl text-[#FF6D1F]">🛍 Pembelian Produk</h2>
          <p className="text-gray-600 text-sm mt-1">Digunakan saat customer membeli sparepart / item marketplace.</p>
        </Link>

        {/* Booking */}
        <Link 
          href="/admin/kasir/booking"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg hover:border-[#234C6A] border transition block"
        >
          <h2 className="font-bold text-xl text-[#234C6A]">🔧 Pembayaran Booking Service</h2>
          <p className="text-gray-600 text-sm mt-1">Untuk pembayaran jasa servis kendaraan.</p>
        </Link>

        {/* Riwayat Optional */}
        <Link 
          href="/admin/kasir/transaksi"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg border transition block"
        >
          <h2 className="font-bold text-xl text-gray-800">📄 Riwayat Transaksi</h2>
          <p className="text-gray-600 text-sm mt-1">Melihat history pembayaran.</p>
        </Link>

      </div>
    </div>
  );
}
