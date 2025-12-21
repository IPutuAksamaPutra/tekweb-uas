"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ShoppingCart,
  Loader2,
  Flame,
  Wrench,
  Search,
  Package,
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

/* ================= CONFIG ================= */
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

  /* 🚀 LOGIKA IMAGE - SAKTI (Hanya ambil Nama File) */
  const getImageUrl = (imgData?: any) => {
    if (!imgData) return "/no-image.png";

    let imgName = "";

    // 1. Bongkar jika data berupa Array atau String JSON
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

    // 2. LOGIKA PEMBERSIHAN: Ambil nama file-nya saja (misal: AEqtAya...png)
    // split('/') akan memecah path, .pop() akan mengambil bagian paling terakhir
    const fileName = imgName.split('/').pop(); 

    // 3. Gabungkan dengan folder storage yang sudah terbukti jalan
    return `${BASE_URL}/storage/products/${fileName}`;
  };

  /* ================= FETCH DATA ================= */
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
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= CART COUNT ================= */
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
    } catch (err) { console.error("Cart Count:", err); }
  }, []);

  useEffect(() => {
    initMarketplace();
    fetchCartCount();
  }, [initMarketplace, fetchCartCount]);

  /* ================= ADD TO CART ================= */
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
        alertSuccess("Barang masuk keranjang!");
        fetchCartCount();
      } else { throw new Error("Gagal menambah keranjang"); }
    } catch (err: any) { alertError(err.message); }
  };

  /* ================= FILTER ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "Semua" || p.jenis_barang === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a]">
      <Loader2 className="animate-spin text-orange-400 mb-4" size={50} />
      <span className="text-white font-black italic animate-pulse">LOADING SPAREPARTS...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-[#0f172a]">
      {/* HEADER */}
      <div className="bg-[#0f172a] text-white p-10 pb-28 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">
              Bengkel<span className="text-orange-500">Market</span>
            </h1>
            <p className="text-slate-400 font-bold italic uppercase tracking-[0.3em] text-[10px] mt-2">Genuine Parts Only</p>
          </div>
          <button onClick={() => router.push("/cart")} className="relative bg-white/10 hover:bg-orange-500 p-5 rounded-3xl transition-all border border-white/10 group">
            <ShoppingCart size={28} className="group-hover:scale-110 transition-transform" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 h-7 w-7 flex items-center justify-center rounded-full bg-red-600 text-[11px] font-black border-2 border-[#0f172a] animate-bounce">{cartCount}</span>}
          </button>
        </div>
        <Wrench className="absolute -right-20 -bottom-20 text-white/5 w-80 h-80 rotate-12" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12">
        {/* SEARCH & FILTER */}
        <div className="bg-white p-4 rounded-3xl shadow-2xl border flex flex-col md:flex-row gap-4 mb-16">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none font-bold text-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["Semua", "Oli", "Ban", "Suku Cadang", "Aksesoris"].map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-4 rounded-2xl font-black uppercase italic text-[10px] transition-all ${selectedCategory === cat ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400'}`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* ================= SECTION 1: HOT PROMO ================= */}
        {promotions.length > 0 && selectedCategory === "Semua" && !searchQuery && (
          <section className="mb-24">
            <h2 className="text-4xl font-black flex items-center gap-4 italic uppercase text-orange-600 mb-10">
              <Flame className="animate-pulse" size={40} fill="currentColor" /> Hot Deals
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {promotions.map((promo) =>
                promo.products.map((p) => {
                  const originalPrice = Number(p.price);
                  const discount = promo.discount_type === "percentage" ? originalPrice * (promo.discount_value / 100) : promo.discount_value;
                  const promoPrice = originalPrice - discount;
                  const discLabel = promo.discount_type === "percentage" ? promo.discount_value : Math.round((promo.discount_value / originalPrice) * 100);

                  return (
                    <ProductCardPromo
                      key={`${promo.id}-${p.id}`}
                      product={{
                        ...p,
                        id: p.id,
                        price: Math.round(promoPrice),
                        original_price: originalPrice,
                        discountPercent: discLabel,
                        // 🔥 KIRIM ARRAY GAMBAR
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

        {/* ================= SECTION 2: KATALOG ================= */}
        <section>
          <h2 className="text-4xl font-black flex items-center gap-4 italic uppercase text-[#0f172a] mb-10">
            <Package className="text-blue-600" size={40} /> Katalog Produk
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  ...p,
                  price: Number(p.price),
                  // 🔥 KIRIM ARRAY GAMBAR
                  img_urls: [getImageUrl(p.img_urls)],
                }}
                onClick={() => router.push(`/marketplace/detail-produk/${p.slug}`)}
                onAdd={(id) => handleAddToCart(id, Number(p.price))}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}