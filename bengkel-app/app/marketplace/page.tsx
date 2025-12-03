"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

export default function MarketplacePage() {
  const API_URL = "http://localhost:8000/api";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [cartCount, setCartCount] = useState(0);

  async function loadProducts() {
    try {
      const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.log("Fetch error:", e);
    }
  }

  useEffect(() => {
    loadProducts();
    const saved = localStorage.getItem("cart");
    if (saved) {
      const arr = JSON.parse(saved);
      setCartCount(arr.length);
    }
  }, []);

  const filteredProducts = products.filter((p: any) => {
    const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());

    const filterMatch =
      filter === "all"
        ? true
        : filter === "suku-cadang"
        ? p.category?.name?.toLowerCase() === "suku cadang"
        : filter === "aksesoris"
        ? p.category?.name?.toLowerCase() === "aksesoris"
        : true;

    return searchMatch && filterMatch;
  });

  return (
    <div className="space-y-10">

      {/* TITLE + CART */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#234C6A]">
          Marketplace Produk
        </h1>

        {/* CART ICON */}
        <a href="/cart" className="relative">
          <ShoppingCart
            size={28}
            color="#FF6D1F"
            className="cursor-pointer hover:scale-110 transition"
          />

          {/* BADGE */}
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-px">
              {cartCount}
            </span>
          )}
        </a>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex items-center gap-3 w-full">

        {/* SEARCH */}
        <div className="flex items-center bg-white border shadow-sm rounded-full px-4 py-2 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#234C6A"
            className="w-5 h-5 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>

          <input
            type="text"
            placeholder="Cari produk…"
            className="grow outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* FILTER DROPDOWN */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2.5 rounded-lg shadow-sm cursor-pointer text-sm w-36"
        >
          <option value="all">Semua</option>
          <option value="suku-cadang">Suku Cadang</option>
          <option value="aksesoris">Aksesoris</option>
        </select>
      </div>

      {/* LIST PRODUK */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length === 0 && (
          <p className="text-gray-500 col-span-full">Produk tidak ditemukan.</p>
        )}

        {filteredProducts.map((p: any) => (
          <a
            key={p.id}
            href={`/marketplace/${p.id}`}
            className="bg-white rounded-xl shadow hover:shadow-lg transition border overflow-hidden"
          >
            <img
              src={p.image_url || "/no-image.jpg"}
              alt={p.name}
              className="w-full h-40 object-cover"
            />

            <div className="p-4">
              <h2 className="font-semibold text-[#234C6A] truncate">
                {p.name}
              </h2>

              <p className="text-sm text-gray-500 capitalize">
                {p.category?.name}
              </p>

              <p className="text-[#FF6D1F] font-bold mt-2">
                Rp {Number(p.price).toLocaleString("id-ID")}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
