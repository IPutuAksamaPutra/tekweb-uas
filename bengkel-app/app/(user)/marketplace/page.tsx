"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/user/ProductCard";
import ProductCardPromo from "@/components/user/ProductCardPromo";
import { ShoppingCart, ClipboardList } from "lucide-react";
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
  img_url: string; // ✅ PASTI STRING
  original_price?: number;
  is_promo?: boolean;
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

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const req = await fetch("http://localhost:8000/api/products");
      const res = await req.json();

      const normalized: Product[] = res.products.map((p: any) => {
        const imgs = Array.isArray(p.img_urls) ? p.img_urls : [];

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          stock: p.stock,
          jenis_barang: p.jenis_barang,
          img_urls: imgs,
          img_url: imgs.length > 0 ? imgs[0] : "/no-image.png", // ✅ FIX
        };
      });

      setProducts(normalized);
      setFiltered(normalized);
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
    }
  };

  /* ================= FETCH PROMO ================= */
  const fetchPromotions = async () => {
    try {
      const req = await fetch("http://localhost:8000/api/promotions");
      const res = await req.json();

      const normalized: Promotion[] = (res.promotions ?? []).map(
        (promo: any) => ({
          ...promo,
          products: promo.products.map((p: any) => {
            const imgs = Array.isArray(p.img_urls) ? p.img_urls : [];

            return {
              ...p,
              img_urls: imgs,
              img_url: imgs.length > 0 ? imgs[0] : "/no-image.png", // ✅ FIX
            };
          }),
        })
      );

      setPromotions(normalized);
    } catch (error) {
      console.error("Gagal mengambil promosi:", error);
    }
  };

  /* ================= CART COUNT ================= */
  const updateCartCount = async () => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) return;

    try {
      const req = await fetch("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await req.json();
      setCartCount(res.cart_items?.length || 0);
    } catch (error) {
      console.error("Gagal menghitung keranjang:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPromotions();
    updateCartCount();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let result = [...products];

    if (category !== "all") {
      result = result.filter(
        (p) => p.jenis_barang?.toLowerCase() === category.toLowerCase()
      );
    }

    if (search.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [search, category, products]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async (prod: Product) => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      alertLoginRequired().then((r) => {
        if (r.isConfirmed) router.push("/auth/login");
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: prod.id,
          price: prod.price,
          quantity: 1,
        }),
      });

      if (res.ok) {
        updateCartCount();
        alertSuccess("Produk berhasil ditambahkan ke keranjang!");
      }
    } catch (error) {
      console.error(error);
      alertError("Terjadi kesalahan jaringan.");
    }
  };

  /* ================= DETAIL PAGE ================= */
  const handleDetailClick = (p: Product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(p));
    router.push(`/marketplace/detail-produk/${p.slug}`);
  };

  /* ================= JSX ================= */
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#234C6A]">
          Marketplace Produk
        </h1>

        <div className="flex items-center gap-5">
          <button
            onClick={() => router.push("/marketplace/pesanan")}
            className="flex items-center gap-1 font-bold text-[#234C6A]"
          >
            <ClipboardList size={28} />
            <span className="hidden sm:inline">Pesanan</span>
          </button>

          <a href="/cart" className="relative">
            <ShoppingCart size={32} className="text-[#FF6D1F]" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
                {cartCount}
              </span>
            )}
          </a>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3 mb-8 flex-col sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="border p-3 rounded-xl w-full"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-3 rounded-xl sm:w-52"
        >
          <option value="all">Semua Produk</option>
          <option value="sparepart">Sparepart</option>
          <option value="aksesoris">Aksesoris</option>
        </select>
      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p} // ✅ TIDAK ADA ERROR TS
            onAdd={() => handleAddToCart(p)}
            onClick={() => handleDetailClick(p)}
          />
        ))}
      </div>
    </div>
  );
}
