"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/user/ProductCard";
import ProductCardPromo from "@/components/user/ProductCardPromo";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  jenis_barang: string;
  img_url: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const fetchProducts = async () => {
    const req = await fetch("http://localhost:8000/api/products");
    const res = await req.json();
    setProducts(res.products);
    setFiltered(res.products);
  };

  const fetchPromotions = async () => {
    const req = await fetch("http://localhost:8000/api/promotions");
    const res = await req.json();
    setPromotions(res.promotions ?? []);
  };

  const updateCartCount = async () => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) return;

    const req = await fetch("http://localhost:8000/api/cart", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const res = await req.json();
    setCartCount(res.cart_items?.length || 0);
  };

  useEffect(() => {
    fetchProducts();
    fetchPromotions();
    updateCartCount();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (category !== "all")
      result = result.filter((p) => p.jenis_barang.toLowerCase() === category.toLowerCase());

    if (search.trim())
      result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

    setFiltered(result);
  }, [search, category, products]);

  /* =========== FIX ADD TO CART — harga promo ikut terkirim =========== */
  const handleAddToCart = async (prod: Product) => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) return alert("Silahkan login dulu");

    await fetch("http://localhost:8000/api/cart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product_id: prod.id,
        price: prod.price,          // <–– ini yang membuat promo ikut
        quantity: 1
      })
    });

    updateCartCount();
    alert(prod.is_promo ? "Produk promo ditambahkan (harga promo)!" : "Produk ditambahkan!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#234C6A]">Marketplace Produk</h1>

        <a href="/cart" className="relative">
          <ShoppingCart size={32} className="text-[#FF6D1F]" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2">
              {cartCount}
            </span>
          )}
        </a>
      </div>

      {/* Search Filter */}
      <div className="flex gap-3 mb-8 flex-col sm:flex-row font-bold text-[#234C6A]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="border p-3 rounded-xl w-full"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="border p-3 rounded-xl w-full sm:w-52">
          <option value="all">Semua Produk</option>
          <option value="sparepart">Sparepart</option>
          <option value="aksesoris">Aksesoris</option>
        </select>
      </div>

      {/* 🔥 Promo Section */}
      {promotions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#234C6A] mb-4">🔥 Promo Tersedia</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {promotions.map((promo) =>
              promo.products.map((p) => {
                const finalPrice =
                  promo.discount_type === "percentage"
                    ? p.price - p.price * (promo.discount_value / 100)
                    : p.price - promo.discount_value;

                return (
                  <ProductCardPromo
                    key={`promo-${p.id}`}
                    product={{
                      ...p,
                      original_price: p.price,
                      price: finalPrice,
                      is_promo: true,
                      discountPercent: promo.discount_value,
                    }}
                    onAdd={() =>
                      handleAddToCart({ ...p, price: finalPrice, is_promo: true })
                    }
                    onClick={() => {
                      localStorage.setItem(
                        "selectedProduct",
                        JSON.stringify({ ...p, price: finalPrice, original_price: p.price })
                      );
                      window.location.href = "/marketplace/detailProduk";
                    }}
                  />
                );
              })
            )}

          </div>
        </div>
      )}

      {/* Semua Produk (non promo) */}
      <h2 className="text-xl font-bold text-[#234C6A] mb-4">Semua Produk</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAdd={() => handleAddToCart(p)}
            onClick={() => {
              localStorage.setItem("selectedProduct", JSON.stringify(p));
              window.location.href = "/marketplace/detailProduk";
            }}
          />
        ))}
      </div>
    </div>
  );
}
