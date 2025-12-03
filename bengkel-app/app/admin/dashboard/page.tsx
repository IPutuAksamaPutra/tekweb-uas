"use client";

import { useState } from "react";
import { Menu, Search } from "lucide-react";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const dummyData = [
    { id: 1, name: "Produk A", price: 10000, status: "Aktif" },
    { id: 2, name: "Produk B", price: 15000, status: "Nonaktif" },
    { id: 3, name: "Produk C", price: 20000, status: "Aktif" }
  ];

  const filtered = dummyData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-white shadow-lg transition-all duration-300 p-4`}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded hover:bg-gray-200"
        >
          <Menu />
        </button>

        {sidebarOpen && (
          <ul className="mt-6 space-y-3 text-gray-700">
            <li className="font-semibold hover:text-blue-600 cursor-pointer">
              Dashboard
            </li>
            <li className="hover:text-blue-600 cursor-pointer">Manajemen Produk</li>
            <li className="hover:text-blue-600 cursor-pointer">Transaksi</li>
            <li className="hover:text-blue-600 cursor-pointer">Pengaturan</li>
          </ul>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>

        {/* Search Bar */}
        <div className="flex items-center bg-white p-3 rounded-xl shadow w-full max-w-lg">
          <Search className="text-gray-500" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-3 w-full outline-none"
          />
        </div>

        {/* Table */}
        <div className="mt-6 bg-white rounded-xl shadow p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3">ID</th>
                <th className="p-3">Nama Produk</th>
                <th className="p-3">Harga</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{item.id}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">Rp {item.price.toLocaleString()}</td>
                  <td className="p-3">{item.status}</td>
                  <td className="p-3 space-x-2">
                    <button className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">
                      Edit
                    </button>
                    <button className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}