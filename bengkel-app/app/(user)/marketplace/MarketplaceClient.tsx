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
  img_urls?: string[]; // 🔥 optional biar aman
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
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const json = await res.json();
        const items = json.cart || json.data || [];
        setCartCount(items.length);
      }
    } catch (err) {
      console.error("Cart Count Error:", err);
    }
  }, []);

  useEffect(() => {
    initMarketplace();
    fetchCartCount();
  }, [initMarketplace, fetchCartCount]);

  /* ================= ADD TO CART ================= */
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

  /* ================= FILTER ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === "Semua" ||
        p.jenis_barang === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="animate-spin text-orange-400" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* HEADER */}
      <div className="bg-[#0f172a] text-white p-10 pb-24">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-5xl font-black italic uppercase">
            Bengkel<span className="text-orange-400">Market</span>
          </h1>

          <button
            onClick={() => router.push("/cart")}
            className="relative bg-white/5 p-5 rounded-4xl"
          >
            <ShoppingCart size={28} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-7 w-7 flex items-center justify-center rounded-full bg-red-600 text-[11px] font-black text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12">
        {/* HOT PROMO */}
        {promotions.length > 0 &&
          selectedCategory === "Semua" &&
          !searchQuery && (
            <section className="mb-24">
              <h2 className="text-4xl font-black mb-10 flex items-center gap-4 italic uppercase">
                <Flame className="text-orange-500" size={40} /> Hot Deals
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {promotions.map((promo) =>
                  promo.products.map((p) => {
                    const originalPrice = Number(p.price);
                    let promoPrice = originalPrice;
                    let discountLabel = 0;

                    if (promo.discount_type === "percentage") {
                      discountLabel = promo.discount_value;
                      promoPrice =
                        originalPrice -
                        originalPrice * (discountLabel / 100);
                    } else {
                      promoPrice = originalPrice - promo.discount_value;
                      discountLabel = Math.round(
                        (promo.discount_value / originalPrice) * 100
                      );
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
                          img_urls: p.img_urls?.[0] || "/no-image.png",
                        }}
                        onClick={() =>
                          router.push(
                            `/marketplace/detail-produk-promo/${p.slug}`
                          )
                        }
                        onAdd={() =>
                          handleAddToCart(p.id, Math.round(promoPrice))
                        }
                      />
                    );
                  })
                )}
              </div>
            </section>
          )}

        {/* KATALOG */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  ...p,
                  price: Number(p.price),
                  img_urls: p.img_urls || ["/no-image.png"],
                }}
                onClick={() =>
                  router.push(`/marketplace/detail-produk/${p.slug}`)
                }
                onAdd={(id) =>
                  handleAddToCart(id, Number(p.price))
                }
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
