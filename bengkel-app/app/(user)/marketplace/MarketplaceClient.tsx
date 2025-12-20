"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  Loader2,
  Tag,
  Flame,
  X,
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

/* ================= CONFIG ================= */
const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

export default function MarketplaceClient() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  /* ================= IMAGE HELPER (FIX IMAGE NOT SHOW) ================= */
  const getImageUrl = (imgData?: string[] | string) => {
    const img = Array.isArray(imgData) ? imgData[0] : imgData;
    if (!img) return "/no-image.png";
    if (img.startsWith("http")) return img;

    const clean = img
      .replace("public/products/", "")
      .replace("products/", "");

    return `${BASE_URL}/storage/products/${clean}`;
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const json = await res.json();
      const list = json.products || json.data || json || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= FETCH CART COUNT ================= */
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
        const items = json.cart || json.data || json || [];
        setCartCount(Array.isArray(items) ? items.length : 0);
      }
    } catch (err) {
      console.error("FETCH CART COUNT ERROR:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, [fetchProducts, fetchCartCount]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async (productId: number) => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      alertError("Silakan login dulu");
      router.push("/auth/login");
      return;
    }

    const p = products.find((x) => x.id === productId);
    if (!p) return;

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
          price: Number(p.price),
        }),
      });

      if (res.ok) {
        alertSuccess(`${p.name} masuk keranjang`);
        fetchCartCount();
      } else {
        alertError("Gagal menambahkan ke keranjang");
      }
    } catch {
      alertError("Server bermasalah");
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

  /* ================= PROMO PRODUCTS ================= */
  const promoProducts = useMemo(() => {
    return products.filter(
      (p) => p.jenis_barang?.toLowerCase() === "promo"
    );
  }, [products]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="animate-spin text-orange-400" size={48} />
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ================= HEADER ================= */}
      <div className="bg-slate-900 text-white p-10 pb-24 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black italic">
              Bengkel<span className="text-orange-400">Market</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-400 mt-2">
              Sparepart Motor Terlengkap
            </p>
          </div>

          {/* CART */}
          <button
            onClick={() => router.push("/cart")}
            className="relative bg-white/10 p-4 rounded-2xl hover:bg-orange-500 transition"
          >
            <ShoppingCart size={26} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* SEARCH */}
        <div className="max-w-3xl mx-auto mt-12 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full p-6 pl-14 rounded-2xl font-bold"
            placeholder="Cari sparepart motor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-6 top-1/2 -translate-y-1/2"
            >
              <X />
            </button>
          )}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        {/* CATEGORY */}
        <div className="flex gap-4 mb-12 overflow-x-auto">
          {["Semua", "Sparepart", "Aksesoris", "Oli", "Promo"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest
                ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-400"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PROMO */}
        {promoProducts.length > 0 &&
          selectedCategory === "Semua" &&
          !searchQuery && (
            <section className="mb-20">
              <h2 className="text-4xl font-black mb-8 flex items-center gap-3">
                <Flame className="text-orange-500" /> Promo Spesial
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {promoProducts.map((p) => {
                  const price = Number(p.price);
                  const originalPrice = price + 30000;
                  const discountPercent = Math.round(
                    ((originalPrice - price) / originalPrice) * 100
                  );

                  return (
                    <ProductCardPromo
                      key={p.id}
                      product={{
                        id: p.id,
                        name: p.name,
                        price,
                        original_price: originalPrice,
                        discountPercent,
                        jenis_barang: p.jenis_barang,
                        img_url: getImageUrl(p.img_urls),
                      }}
                      onClick={() =>
                        router.push(
                          `/marketplace/detail-produk/${p.slug}`
                        )
                      }
                      onAdd={() => handleAddToCart(p.id)}
                    />
                  );
                })}
              </div>
            </section>
          )}

        {/* KATALOG */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <Tag className="text-orange-500" size={40} />
            <h2 className="text-5xl font-black text-slate-900">
              KATALOG <span className="text-orange-500">PRODUK</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  stock: p.stock,
                  jenis_barang: p.jenis_barang,
                  price: Number(p.price),
                  img_urls: [getImageUrl(p.img_urls)],
                }}
                onClick={() =>
                  router.push(
                    `/marketplace/detail-produk/${p.slug}`
                  )
                }
                onAdd={(id) => handleAddToCart(id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
