"use client";

import { useEffect, useState, useRef } from "react"; 
import { useRouter } from "next/navigation";
import ProductCard from "@/components/user/ProductCard";
import ProductCardPromo from "@/components/user/ProductCardPromo";
import { ShoppingCart } from "lucide-react";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";


interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    jenis_barang: string;
    img_urls?: string[]; // ARRAY url dari backend
    img_url?: string | null; // STRING untuk card
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

    // ================= FETCH PRODUCTS =================
    const fetchProducts = async () => {
        try {
            const req = await fetch("http://localhost:8000/api/products");
            const res = await req.json();

            const normalized = res.products.map((p: any) => ({
                ...p,
                img_urls: Array.isArray(p.img_urls) ? p.img_urls : [],
                img_url: (p.img_urls && p.img_urls.length > 0) ? p.img_urls[0] : null,
            }));

            setProducts(normalized);
            setFiltered(normalized);
        } catch (error) {
            console.error("Gagal mengambil produk:", error);
        }
    };

    // ================= FETCH PROMO =================
    const fetchPromotions = async () => {
        try {
            const req = await fetch("http://localhost:8000/api/promotions");
            const res = await req.json();
            setPromotions(res.promotions ?? []);
        } catch (error) {
            console.error("Gagal mengambil promosi:", error);
        }
    };

    // ================= CART COUNT =================
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

    // ================= FILTER =================
    useEffect(() => {
        let result = [...products];

        if (category !== "all") {
            result = result.filter(
                (p) => p.jenis_barang && p.jenis_barang.toLowerCase() === category.toLowerCase()
            );
        }

        if (search.trim()) {
            result = result.filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFiltered(result);
    }, [search, category, products]);

    // ================= ADD TO CART =================
    const handleAddToCart = async (prod: Product) => {
        const token = document.cookie.match(/token=([^;]+)/)?.[1];
        if (!token) {
           alertLoginRequired().then((result) => {
        if (result.isConfirmed) {
            router.push("/auth/login");
        }
    });
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
                 alertSuccess(prod.is_promo ? "Produk promo berhasil ditambahkan!" : "Produk berhasil ditambahkan ke keranjang!");
            } else {  
            }
        } catch (error) {
            console.error("Error saat menambahkan ke keranjang:", error);
            alertError("Terjadi kesalahan jaringan.");
        }
    };
    
    // ================= DETAIL PAGE HANDLER =================
    const handleDetailClick = (p: Product) => {
        // Simpan data lengkap produk ke localStorage untuk halaman detail
        localStorage.setItem(
            "selectedProduct",
            JSON.stringify({
                ...p,
                img_url: p.img_urls ?? [], 
            })
        );
        router.push("/marketplace/detailProduk");
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#234C6A]">
                    Marketplace Produk
                </h1>

                <a href="/cart" className="relative">
                    <ShoppingCart size={32} className="text-[#FF6D1F]" />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2">
                            {cartCount}
                        </span>
                    )}
                </a>
            </div>

            {/* SEARCH & FILTER */}
            <div className="flex gap-3 mb-8 flex-col sm:flex-row font-bold text-[#234C6A]">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari produk..."
                    className="border p-3 rounded-xl w-full"
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border p-3 rounded-xl w-full sm:w-52"
                >
                    <option value="all">Semua Produk</option>
                    <option value="sparepart">Sparepart</option>
                    <option value="aksesoris">Aksesoris</option>
                </select>
            </div>

            {/* ================= PROMO SECTION ================= */}
            {promotions.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-[#234C6A] mb-4">
                        🔥 Promo Tersedia
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {promotions.map((promo) =>
                            promo.products.map((p) => {
                                const finalPrice =
                                    promo.discount_type === "percentage"
                                        ? p.price - p.price * (promo.discount_value / 100)
                                        : p.price - promo.discount_value;

                                const promoProduct: Product = {
                                    ...p,
                                    img_urls: p.img_urls ?? [],
                                    img_url: ((p.img_urls && p.img_urls.length > 0) 
                                        ? p.img_urls[0] 
                                        : null) as (string | null), // FIX GARIS MERAH
                                    original_price: p.price,
                                    price: finalPrice,
                                    is_promo: true,
                                };

                                return (
                                    <ProductCardPromo
                                        key={`promo-${p.id}`}
                                        product={promoProduct}
                                        onAdd={() => handleAddToCart({ ...promoProduct })}
                                        onClick={() => handleDetailClick(promoProduct)}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ================= ALL PRODUCTS ================= */}
            <h2 className="text-xl font-bold text-[#234C6A] mb-4">Semua Produk</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map((p) => (
                    <ProductCard
                        key={p.id}
                        product={{
                            ...p,
                            // FIX GARIS MERAH dengan Type Assertion
                            img_url: ((p.img_urls && p.img_urls.length > 0) 
                                ? p.img_urls[0] 
                                : null) as (string),
                        }}
                        onAdd={() => handleAddToCart(p)}
                        onClick={() => handleDetailClick(p)}
                    />
                ))}
            </div>
        </div>
    );
}