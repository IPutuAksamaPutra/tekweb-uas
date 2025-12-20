"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ShoppingCart,
  Loader2,
  Tag,
  Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/user/ProductCard";
import ProductCardPromo from "@/components/user/ProductCardPromo";
import { alertSuccess, alertError } from "@/components/Alert";

/* ================= TYPE ================= */
interface Product {
  id: number;
  name: string;
  slug: string;
  price: string; 
  stock: number;
  jenis_barang: string;
  img_urls: string[];
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

  // 🚀 LOGIKA GAMBAR SUPER AMAN
  const getImageUrl = (imgData?: any): string => {
    let img = "";

    // 1. Cek jika data adalah array
    if (Array.isArray(imgData) && imgData.length > 0) {
      img = imgData[0];
    } 
    // 2. Cek jika data adalah string (bisa jadi JSON string)
    else if (typeof imgData === 'string') {
      if (imgData.startsWith('[') && imgData.endsWith(']')) {
        try {
          const parsed = JSON.parse(imgData);
          img = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch {
          img = imgData;
        }
      } else {
        img = imgData;
      }
    }

    if (!img || typeof img !== 'string') return "/no-image.png";
    if (img.startsWith("http")) return img;

    // 3. Bersihkan path dari 'public/' atau 'products/' double
    const clean = img.replace("public/products/", "")
                     .replace("products/", "")
                     .replace("public/", "");

    return `${BASE_URL}/storage/products/${clean}`;
  };

  // FETCH DATA AWAL
  const initMarketplace = useCallback(async () => {
    setLoading(true);
    const headers = { Accept: "application/json" };
    try {
      const [prodRes, promoRes] = await Promise.all([
        fetch(`${API_URL}/products`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/promotions`, { headers, cache: "no-store" })
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

  // FETCH JUMLAH BARANG DI KERANJANG
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
    } catch (err) { console.error("Cart Count Error:", err); }
  }, []);

  useEffect(() => {
    initMarketplace();
    fetchCartCount();
  }, [initMarketplace, fetchCartCount]);

  // 🔥 TAMBAH KE CART
  const handleAddToCart = async (productId: number, finalPrice: number) => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      alertError("Silakan login dulu, Bos!");
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
        alertSuccess("Mantap! Barang masuk keranjang.");
        fetchCartCount();
      } else {
        const error = await res.json();
        throw new Error(error.message || "Gagal masuk keranjang");
      }
    } catch (err: any) { 
      alertError(err.message || "Gagal menambah keranjang"); 
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "Semua" || p.jenis_barang === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <Loader2 className="animate-spin text-orange-400" size={50} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* HEADER */}
      <div className="bg-[#0f172a] text-white p-10 pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">
            Bengkel<span className="text-orange-400">Market</span>
          </h1>
          <button 
            onClick={() => router.push("/cart")} 
            className="group relative bg-white/5 border border-white/10 p-5 rounded-4xl hover:bg-orange-500 transition-all shadow-2xl active:scale-90"
          >
            <ShoppingCart size={28} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-[11px] font-black text-white ring-4 ring-[#0f172a] shadow-lg animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        
        {/* HOT PROMO */}
        {promotions.length > 0 && selectedCategory === "Semua" && !searchQuery && (
          <section className="mb-24">
            <h2 className="text-4xl font-black mb-10 flex items-center gap-4 italic uppercase text-slate-900 tracking-tighter">
              <Flame className="text-orange-500 animate-pulse" size={40} fill="currentColor" /> Hot Deals
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {promotions.map((promo) =>
                promo.products.map((p) => {
                  const originalPrice = Number(p.price);
                  let promoPrice = originalPrice;
                  let discountLabel = 0;

                  if (promo.discount_type === "percentage") {
                    discountLabel = promo.discount_value;
                    promoPrice = originalPrice - (originalPrice * (discountLabel / 100));
                  } else {
                    promoPrice = originalPrice - promo.discount_value;
                    discountLabel = Math.round((promo.discount_value / originalPrice) * 100);
                  }

                  return (
                    <ProductCardPromo
                      key={`${promo.id}-${p.id}`}
                      product={{
                        id: p.id,
                        name: p.name,
                        price: Math.round(promoPrice),
                        original_price: originalPrice,
                        discountPercent: discountLabel,
                        jenis_barang: p.jenis_barang,
                        img_urls: getImageUrl(p.img_urls), // Mengirim string murni
                      }}
                      onClick={() => router.push(`/marketplace/detail-produk-promo/${p.slug}`)}
                      onAdd={() => handleAddToCart(p.id, Math.round(promoPrice))}
                    />
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* KATALOG PRODUK */}
        <section>
          <div className="inline-flex items-center gap-4 mb-12 border-b-8 border-[#0f172a] pb-4 text-[#0f172a]">
            <Tag size={40} className="text-orange-500" />
            <h2 className="text-6xl font-black uppercase tracking-tighter">
              Katalog <span className="text-orange-500">Produk</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{ 
                  ...p, 
                  price: Number(p.price), 
                  img_urls: [getImageUrl(p.img_urls)] // Mengirim array
                }}
                onClick={() => router.push(`/marketplace/detail-produk/${p.slug}`)}
                onAdd={(id) => handleAddToCart(id, Number(p.price))}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-slate-300 font-black italic text-2xl uppercase">
              Produk Tidak Ditemukan...
            </div>
          )}
        </section>
      </div>
    </div>
  );
}