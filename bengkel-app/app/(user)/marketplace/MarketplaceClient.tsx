"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ShoppingCart,
  Loader2,
  Flame,
  Wrench,
  Search,
  Package,
  ClipboardList,
  Sparkles,
  Home,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/user/ProductCard";
import ProductCardPromo from "@/components/user/ProductCardPromo";
import { alertSuccess, alertError } from "@/components/Alert";

/* ================= TYPES ================= */
interface Product {
  id: number;
  name: string;
  slug: string;
  price: any;
  stock: number;
  jenis_barang: string;
  img_urls?: any;
}

interface PromoData {
  id: number;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  is_active: boolean;
  products: Product[];
}

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

export default function MarketplaceClient() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<PromoData[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  /* 🚀 IMAGE LOGIC */
  const getImageUrl = (imgData?: any) => {
    if (!imgData) return "/no-image.png";
    let imgName = "";
    if (Array.isArray(imgData) && imgData.length > 0) {
      imgName = imgData[0];
    } else if (typeof imgData === 'string') {
      if (imgData.startsWith('[')) {
        try {
          const parsed = JSON.parse(imgData);
          imgName = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch { imgName = imgData; }
      } else {
        imgName = imgData;
      }
    }
    if (!imgName || typeof imgName !== 'string') return "/no-image.png";
    if (imgName.startsWith("http")) return imgName;
    const fileName = imgName.split('/').pop(); 
    return `${BASE_URL}/storage/products/${fileName}`;
  };

  /* ================= FETCH DATA ================= */
  // 🛒 FIX: Ambil data keranjang dengan mapping yang benar
  const fetchCartCount = useCallback(async () => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.cart || json.data || [];
        setCartCount(items.length);
      }
    } catch (err) { console.error("Cart Count Fetch Error:", err); }
  }, []);

  const initMarketplace = useCallback(async () => {
    setLoading(true);
    const headers = { Accept: "application/json" };
    try {
      const [prodRes, promoRes] = await Promise.all([
        fetch(`${API_URL}/products`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/promotions`, { headers, cache: "no-store" }),
      ]);
      const prodJson = await prodRes.json();
      const promoJson = await promoRes.json();
      setProducts(prodJson.products || prodJson.data || []);
      const rawPromos = promoJson.promotions || promoJson.data || [];
      setPromotions(rawPromos.filter((p: PromoData) => p.is_active));
      
      // Sinkronkan angka keranjang saat load awal
      await fetchCartCount();
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchCartCount]);

  useEffect(() => {
    initMarketplace();
  }, [initMarketplace]);

  const handleProtectedAction = (path: string) => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      alertError("Login dulu, Bos!");
      router.push("/auth/login");
      return;
    }
    router.push(path);
  };

  const handleAddToCart = async (productId: number, finalPrice: number) => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      alertError("Login dulu, Bos!");
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
          price: Math.round(finalPrice),
        }),
      });
      
      if (res.ok) {
        alertSuccess("Masuk keranjang!");
        await fetchCartCount(); // 🔥 Refresh angka keranjang otomatis
      } else { 
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menambah keranjang"); 
      }
    } catch (err: any) { 
      alertError(err.message); 
    }
  };

  /* ================= FILTER LOGIC (FIXED) ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      // Handled Suku Cadang vs Sparepart (normalisasi)
      const matchCategory = selectedCategory === "Semua" || 
        p.jenis_barang === selectedCategory ||
        (selectedCategory === "Suku Cadang" && p.jenis_barang === "Sparepart");
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#234C6A]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-32 font-sans text-slate-900">
      {/* 📱 TOP BAR */}
      <nav className="sticky top-0 z-60 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-[#234C6A] p-2 rounded-xl shadow-lg shadow-blue-900/20">
              <Wrench size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">
              Bengkel<span className="text-[#234C6A]">Market</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <button onClick={() => handleProtectedAction("/marketplace/pesanan")} className="text-slate-500 font-bold text-sm hover:text-[#234C6A]">Pesanan</button>
             <button onClick={() => handleProtectedAction("/cart")} className="bg-[#234C6A] text-white px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-blue-900/20 hover:bg-[#1a3a52] transition-all">
               <ShoppingCart size={16} /> 
               <span>Keranjang</span>
               <span className="bg-white text-[#234C6A] px-2 rounded-lg ml-1 min-w-5 text-center">{cartCount}</span>
             </button>
          </div>
          <Menu className="md:hidden text-slate-400" size={24} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto md:px-6">
        {/* 🎬 HERO BANNER */}
        <div className="p-4 md:pt-10">
          <div className="bg-linear-to-br from-[#234C6A] to-[#3a78a6] rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-xl shadow-blue-900/10 min-h-[220px] flex flex-col justify-center">
            <div className="relative z-10 text-white">
              <h2 className="text-3xl md:text-6xl font-black mb-2 tracking-tight leading-tight">
                SPAREPART <br className="md:hidden"/> <span className="text-white/20 italic text-4xl md:text-7xl uppercase">Bengkel.</span>
              </h2>
              <p className="text-white/80 text-xs md:text-lg font-medium mb-6 md:mb-8 max-w-[200px] md:max-w-md uppercase tracking-widest">Premium Quality Spareparts</p>
              <button className="bg-white text-[#234C6A] font-extrabold py-3 px-8 rounded-2xl text-xs md:text-sm shadow-lg hover:scale-105 transition-all">
                LIHAT KATALOG
              </button>
            </div>
            <Wrench className="absolute -right-10 -bottom-10 text-white/10 w-48 h-48 md:w-[350px] md:h-[350px] -rotate-12" />
          </div>
        </div>

        {/* 🔍 SEARCH & FILTER */}
        <div className="px-4 sticky top-[72px] z-50 bg-[#FAFAFC]/60 backdrop-blur-md py-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Cari suku cadang..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-3xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-[#234C6A]/5 transition-all outline-none font-medium text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {["Semua", "Suku Cadang", "Aksesoris"].map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-3.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${
                    selectedCategory === cat 
                    ? 'bg-[#234C6A] text-white border-[#234C6A] shadow-blue-900/20 shadow-lg' 
                    : 'bg-white text-slate-400 border-slate-50 hover:text-[#234C6A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🔥 HOT DEALS */}
        {promotions.length > 0 && selectedCategory === "Semua" && !searchQuery && (
          <section className="px-4 mt-8 mb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-2xl font-black tracking-tight flex items-center gap-2 text-[#234C6A]">
                <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={24} /> HOT PROMO
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
              {promotions.map((promo) =>
                promo.products.map((p) => {
                  const originalPrice = Number(p.price);
                  const discount = promo.discount_type === "percentage" ? originalPrice * (promo.discount_value / 100) : promo.discount_value;
                  const promoPrice = originalPrice - discount;
                  return (
                    <ProductCardPromo
                      key={`${promo.id}-${p.id}`}
                      product={{
                        ...p,
                        price: Math.round(promoPrice),
                        original_price: originalPrice,
                        discountPercent: promo.discount_type === "percentage" ? promo.discount_value : Math.round((promo.discount_value / originalPrice) * 100),
                        img_urls: [getImageUrl(p.img_urls || (p as any).img_url)], 
                      }}
                      onClick={() => router.push(`/marketplace/detail-produk-promo/${p.slug}`)}
                      onAdd={() => handleAddToCart(p.id, promoPrice)}
                    />
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* 📦 CATALOG */}
        <section className="px-4 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg md:text-2xl font-black tracking-tight uppercase italic text-[#234C6A]">Katalog Produk</h3>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    ...p,
                    price: Number(p.price),
                    img_urls: [getImageUrl(p.img_urls)],
                  }}
                  onClick={() => router.push(`/marketplace/detail-produk/${p.slug}`)}
                  onAdd={(id) => handleAddToCart(id, Number(p.price))}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[2.5rem] py-20 text-center border-2 border-dashed border-slate-200">
               <Sparkles className="mx-auto text-slate-200 mb-4" size={50} />
               <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Produk tidak ditemukan</p>
            </div>
          )}
        </section>
      </main>

      {/* 📱 BOTTOM NAVIGATION (Mobile) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-70">
        <div className="bg-[#234C6A]/90 backdrop-blur-2xl rounded-4xl p-2 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5">
          <button onClick={() => router.refresh()} className="p-4 text-white hover:bg-white/10 rounded-full">
            <Home size={22} />
          </button>
          <button onClick={() => handleProtectedAction("/marketplace/pesanan")} className="p-4 text-white/50 hover:bg-white/10 rounded-full">
            <ClipboardList size={22} />
          </button>
          <button onClick={() => handleProtectedAction("/cart")} className="p-4 bg-orange-500 text-white rounded-3xl shadow-lg shadow-orange-500/40 relative active:scale-90 transition-transform">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}