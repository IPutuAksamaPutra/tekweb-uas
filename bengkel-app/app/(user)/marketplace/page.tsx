"use client";

import { useEffect, useState } from "react";
// Import ikon tambahan untuk interaktivitas
import { ShoppingCart, Search, Wrench, Shirt, PlusCircle } from "lucide-react"; 

// ===============================
// TIPE DATA PRODUK
// ===============================
interface Product {
  id: number;
  name: string;
  price: number;
  category: { name: string; slug: string }; // Tambah slug untuk filter yang lebih baik
  image_url: string;
}

// Tambahkan fungsi simulasi addToCart ke localStorage
const addToCart = (product: Product) => {
    // Logika sederhana: Cek jika sudah ada, tambahkan qty, jika belum, tambahkan item baru
    const saved = localStorage.getItem("cart");
    const cartItems: any[] = saved ? JSON.parse(saved) : [];

    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

    let updatedCart;
    if (existingItemIndex > -1) {
        updatedCart = cartItems.map((item, index) => 
            index === existingItemIndex ? { ...item, qty: item.qty + 1 } : item
        );
    } else {
        updatedCart = [...cartItems, { ...product, qty: 1 }];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`${product.name} berhasil ditambahkan ke keranjang!`);
    
    // Refresh hitungan cart (ini akan dilakukan oleh useEffect di komponen utama)
    return updatedCart.length;
};


export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [cartCount, setCartCount] = useState(0);

  // ===============================
  // DUMMY DATA PRODUK (Disesuaikan dengan slug)
  // ===============================
  const dummyData: Product[] = [
    {
      id: 1,
      name: "Oli Mesin Yamalube Power Matic",
      price: 35000,
      category: { name: "Suku Cadang", slug: "suku-cadang" },
      image_url:
        "https://images.tokopedia.net/img/cache/700/VqbcmM/2022/5/26/9b2e0d19-698e-48fd-a1c1-d257a7b82d49.jpg",
    },
    {
      id: 2,
      name: "Kampas Rem Cakram Depan Motor",
      price: 26000,
      category: { name: "Suku Cadang", slug: "suku-cadang" },
      image_url:
        "https://images.tokopedia.net/img/cache/700/VqbcmM/2023/7/3/4f497c6e-c7db-4cd0-b74f-65a97b93cf9f.jpg",
    },
    {
      id: 3,
      name: "Sarung Tangan Full Finger Racing",
      price: 45000,
      category: { name: "Aksesoris", slug: "aksesoris" },
      image_url:
        "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/12/3/260b4b8d-0777-4dec-abc6-1fa5321f9086.jpg",
    },
    {
      id: 4,
      name: "Helm Bogo Retro Classic",
      price: 160000,
      category: { name: "Aksesoris", slug: "aksesoris" },
      image_url:
        "https://images.tokopedia.net/img/cache/700/VqbcmM/2020/6/1/8c1ff99a-913f-44e8-b8d3-8ab616c3e2e6.jpg",
    },
  ];

  // ===============================
  // LOAD DATA DUMMY + CART COUNT
  // ===============================
  useEffect(() => {
    setProducts(dummyData);
    updateCartCount();
  }, []);

  // Fungsi untuk memperbarui hitungan keranjang
  const updateCartCount = () => {
    const saved = localStorage.getItem("cart");
    if (saved) setCartCount(JSON.parse(saved).length);
  };
  
  // Wrapper untuk addToCart
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    updateCartCount(); // Perbarui hitungan setelah menambahkan
  };

  // ===============================
  // FILTER PRODUK
  // ===============================
  const filteredProducts = products.filter((p) => {
    const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());

    const filterMatch =
      filter === "all"
        ? true
        : p.category.slug === filter;

    return searchMatch && filterMatch;
  });

  // Fungsi untuk mendapatkan ikon kategori
  const getCategoryIcon = (slug: string) => {
      switch (slug) {
          case 'suku-cadang':
              return <Wrench size={16} className="inline mr-1 text-gray-500" />;
          case 'aksesoris':
              return <Shirt size={16} className="inline mr-1 text-gray-500" />;
          default:
              return null;
      }
  }


  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-0">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ==================== TITLE + CART ==================== */}
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-4xl font-extrabold text-[#234C6A]">
            Marketplace Produk Bengkel 🛒
          </h1>

          <a href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition">
            <ShoppingCart
              size={32}
              color="#FF6D1F"
              className="cursor-pointer hover:scale-105 transition"
            />

            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </a>
        </div>

        {/* ==================== SEARCH + FILTER ==================== */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full bg-white p-4 rounded-xl shadow-md border border-gray-100">

          {/* SEARCH */}
          <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 w-full sm:w-2/3 shadow-inner">
            <Search
                size={20}
                className="text-[#234C6A] mr-2 flex-shrink-0"
            />

            <input
              type="text"
              placeholder="Cari nama produk: oli, kampas, helm, dll."
              className="grow outline-none text-gray-800 placeholder-gray-500 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* FILTER */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-2 border-gray-300 p-2.5 rounded-full shadow-sm cursor-pointer text-gray-700 font-medium transition w-full sm:w-1/3 appearance-none bg-white"
          >
            <option value="all">Semua Kategori</option>
            <option value="suku-cadang">Suku Cadang</option>
            <option value="aksesoris">Aksesoris</option>
          </select>
        </div>
        
        {/* ==================== GRID PRODUK ==================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">

          {filteredProducts.length === 0 && (
            <div className="text-center col-span-full py-10 bg-white rounded-xl shadow border border-gray-200">
                <p className="text-gray-600 text-lg">Produk tidak ditemukan untuk pencarian ini.</p>
            </div>
          )}

          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-xl shadow-lg border border-gray-200 
                hover:shadow-xl hover:border-[#FF6D1F] transition duration-300 overflow-hidden relative"
            >
                {/* Gambar Produk */}
                <a href={`/marketplace/${p.id}`} className="block">
                    <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-44 object-cover transition duration-300 group-hover:scale-[1.03]"
                        onError={(e) => {
                          e.currentTarget.onerror = null; 
                          e.currentTarget.src = "https://placehold.co/176x176/cccccc/333333?text=Gambar+Produk";
                        }}
                    />
                </a>

                <div className="p-4 flex flex-col justify-between h-36">
                    <div>
                        <h2 className="font-bold text-lg text-[#234C6A] line-clamp-2 leading-snug">
                            {p.name}
                        </h2>

                        <p className="text-xs text-gray-500 capitalize mt-1">
                            {getCategoryIcon(p.category.slug)} 
                            {p.category.name}
                        </p>
                    </div>

                    <div className="flex justify-between items-end pt-2">
                        <p className="text-[#FF6D1F] font-extrabold text-xl">
                            Rp {p.price.toLocaleString("id-ID")}
                        </p>
                        
                        {/* Tombol Add to Cart */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Mencegah navigasi saat klik tombol
                                handleAddToCart(p);
                            }}
                            className="bg-[#234C6A] text-white p-2 rounded-full hover:bg-[#1A374A] transition transform hover:scale-105"
                            title="Tambahkan ke Keranjang"
                        >
                            <PlusCircle size={24} />
                        </button>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}