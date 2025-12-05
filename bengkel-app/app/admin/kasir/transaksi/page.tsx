"use client";

import { useState } from "react";
import { Search, Eye } from "lucide-react";

interface Transaksi {
  id: number;
  customer: string;
  jenis: "Booking" | "Produk";
  total: number;
  date: string;
  status: "Lunas" | "Pending";
}

const dummyTransaksi: Transaksi[] = [
  { id: 1, customer: "Rangga", jenis: "Booking", total: 75000, date: "2025-01-12", status: "Lunas" },
  { id: 2, customer: "Doni", jenis: "Produk", total: 120000, date: "2025-01-12", status: "Lunas" },
  { id: 3, customer: "Rehan", jenis: "Booking", total: 50000, date: "2025-01-13", status: "Pending" },
];

export default function TransaksiPage() {

  const [search, setSearch] = useState("");
  const filtered = dummyTransaksi.filter(t =>
    t.customer.toLowerCase().includes(search.toLowerCase()) ||
    t.jenis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">

      <h1 className="text-3xl font-bold text-[#234C6A]">📄 Riwayat Transaksi</h1>
      <p className="text-gray-600">Semua transaksi yang telah dilakukan oleh kasir.</p>


      {/* Search bar */}
      <div className="flex items-center bg-white p-3 rounded-xl shadow gap-3 w-full max-w-md">
        <Search className="text-gray-500" size={20}/>
        <input
          type="text"
          placeholder="Cari nama / jenis transaksi..."
          className="outline-none w-full"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
      </div>


      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-700">
              <th className="p-3">ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Jenis</th>
              <th className="p-3">Total</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-100">
                <td className="p-3 font-semibold">#{t.id}</td>
                <td className="p-3">{t.customer}</td>
                <td className="p-3">{t.jenis}</td>
                <td className="p-3 text-[#FF6D1F] font-semibold">
                  Rp {t.total.toLocaleString()}
                </td>
                <td className="p-3">{t.date}</td>

                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-sm text-white ${
                    t.status === "Lunas" ? "bg-green-600" : "bg-yellow-500"
                  }`}>
                    {t.status}
                  </span>
                </td>

                <td className="p-3">
                  <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Eye size={18}/> Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center py-5 text-gray-500">Tidak ada hasil ditemukan...</p>
        )}
      </div>

    </div>
  );
}
