"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/user/ProductCard";
import ProductCardPromo from "@/components/user/ProductCardPromo";
import { ShoppingCart, ClipboardList, Search, Filter } from "lucide-react";
import {
  alertSuccess,
  alertError,
  alertLoginRequired,
} from "@/components/Alert";

/* ===============================
   INTERFACE
================================ */
interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  stock: number;
  jenis_barang: string;
  img_urls: string[];
  img_url: string;
  original_price?: number;
  is_promo?: boolean;
  rating?: number;
  total_reviews?: number;
}

interface Promotion {
  id: number;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  products: Product[];
}

export default function MarketplacePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isMount, setIsMount] = useState(false); // Untuk cegah hydration error

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(async () => {
    try {
      const [prodReq, promoReq] = await Promise.all([
        fetch("https://tekweb-uas-production.up.railway.app/api/products"),
        fetch("https://tekweb-uas-production.up.railway.app/api/promotions")
      ]);

      const prodRes = await prodReq.json();
      const promoRes = await promoReq.json();

      // Normalize Products
      const normalizedProds: Product[] = (prodRes.products || []).map((p: any) => ({
        ...p,
        img_url: p.img_urls?.[0] || "/no-image.png",
      }));

      // Normalize Promotions
      const normalizedPromos: Promotion[] = (promoRes.promotions ?? []).map((promo: any) => ({
        ...promo,
        products: (promo.products || []).map((p: any) => ({
          ...p,
          img_url: p.img_urls?.[0] || "/no-image.png",
        })),
      }));

      setProducts(normalizedProds);
      setPromotions(normalizedPromos);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  const updateCartCount = useCallback(async () => {
    const token = getCookie("token");
    if (!token) return;

    try {
      const req = await fetch("https://tekweb-uas-production.up.railway.app/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await req.json();
      setCartCount(res.cart_items?.length || 0);
    } catch (error) {
      console.error("Cart count error:", error);
    }
  }, []);

  useEffect(() => {
    setIsMount(true);
    fetchData();
    updateCartCount();
  }, [fetchData, updateCartCount]);

  /* ================= FILTER LOGIC ================= */
  useEffect(() => {
    let result = products.filter(p => {
      const matchesCategory = category === "all" || p.jenis_barang?.toLowerCase() === category.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setFiltered(result);
  }, [search, category, products]);

  /* ================= ACTIONS ================= */
  const handleAddToCart = async (prod: Product) => {
    const token = getCookie("token");
    if (!token) {
      const r = await alertLoginRequired();
      if (r.isConfirmed) router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch("https://tekweb-uas-production.up.railway.app/api/cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: prod.id, price: prod.price, quantity: 1 }),
      });

      if (res.ok) {
        updateCartCount();
        alertSuccess("Berhasil masuk keranjang!");
      }
    } catch (error) {
      alertError("Gagal menambah produk.");
    }
  };

  if (!isMount) return null;

  return (
    <div className="max-w-8xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#234C6A] tracking-tight">Marketplace</h1>
          <p className="text-gray-500 font-medium">Temukan suku cadang & aksesoris terbaik</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border">
          <button
            onClick={() => router.push("/marketplace/pesanan")}
            className="flex items-center gap-2 px-4 py-2 font-bold text-[#234C6A] hover:bg-gray-50 rounded-xl transition-all"
          >
            <ClipboardList size={22} />
            <span className="hidden sm:inline">Pesanan</span>
          </button>

          <div className="h-8 w-px bg-gray-200"></div>

          <button 
            onClick={() => router.push("/cart")} 
            className="relative p-2 bg-orange-50 rounded-xl text-[#FF6D1F] hover:bg-orange-100 transition-all"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex gap-4 mb-10 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari sparepart atau aksesoris..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] transition-all shadow-sm"
          />
        </div>

        <div className="relative sm:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none appearance-none cursor-pointer focus:border-[#FF6D1F] shadow-sm font-medium text-gray-700"
          >
            <option value="all">Semua Kategori</option>
            <option value="sparepart">⚙️ Sparepart</option>
            <option value="aksesoris">🕶️ Aksesoris</option>
          </select>
        </div>
      </div>

      {/* PROMO SECTION */}
      {promotions.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">HOT DEAL</span>
            <h2 className="text-2xl font-black text-[#234C6A]">Penawaran Terbatas</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {promotions.map((promo) =>
              promo.products.map((p) => {
                const discountedPrice = promo.discount_type === "percentage"
                  ? p.price - (p.price * promo.discount_value / 100)
                  : p.price - promo.discount_value;

                return (
                  <ProductCardPromo
                    key={`promo-${promo.id}-${p.id}`}
                    product={{ ...p, original_price: p.price, price: discountedPrice, is_promo: true }}
                    promo={promo}
                    onAdd={() => handleAddToCart(p)}
                    onClick={() => router.push(`/marketplace/detail-produk/${p.slug}`)}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ALL PRODUCTS SECTION */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-[#234C6A]">Semua Produk</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={() => handleAddToCart(p)}
                onClick={() => router.push(`/marketplace/detail-produk/${p.slug}`)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed">
              <p className="text-gray-400 font-medium">Produk tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}