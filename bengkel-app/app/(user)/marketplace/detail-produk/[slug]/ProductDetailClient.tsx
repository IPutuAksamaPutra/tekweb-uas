"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  Info,
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

// Pastikan prefix /api ada di URL
const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

/* ===============================
    TYPES
================================ */
interface Product {
  id: number;
  name: string;
  slug: string;
  price: any;
  original_price?: any;
  is_promo?: boolean;
  stock: number;
  jenis_barang: string;
  description: string;
  img_urls: string[];
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: { name: string };
}

interface Props {
  initialProduct: Product | null;
  initialSlug: string;
}

/* ===============================
    IMAGE CAROUSEL
================================ */
const DetailImageCarousel = ({ urls, alt }: { urls: string[]; alt: string }) => {
  const [index, setIndex] = useState(0);
  const images = Array.isArray(urls) ? urls.filter(Boolean) : [];

  const getImageUrl = (src: string) => {
    if (!src) return "https://placehold.co/600x600?text=No+Image";
    if (src.startsWith("http")) return src;
    const fileName = src.replace("public/products/", "").replace("products/", "");
    return `${BASE_URL}/storage/products/${fileName}`;
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 rounded-2xl border-2 border-dashed">
        <Info size={40} />
        <p className="mt-2 font-medium">Tidak ada gambar produk</p>
      </div>
    );
  }

  return (
    <div className="relative group w-full h-full overflow-hidden rounded-2xl bg-white border shadow-inner">
      <div
        className="flex h-full transition-transform duration-500"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="w-full h-full shrink-0 flex items-center justify-center p-6">
            <img
              src={getImageUrl(src)}
              alt={`${alt} ${i + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `${BASE_URL}/images/default_product.png`;
              }}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow hover:bg-white z-10">
            <ChevronLeft />
          </button>
          <button onClick={() => setIndex((i) => (i + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow hover:bg-white z-10">
            <ChevronRight />
          </button>
        </>
      )}
    </div>
  );
};

/* ===============================
    MAIN COMPONENT
================================ */
export default function ProductDetailClient({ initialProduct }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  /* FETCH REVIEW */
  useEffect(() => {
    if (!product?.id) return;

    // Perbaikan: Tambahkan prefix /api jika sebelumnya lupa
    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Review not found");
        return res.json();
      })
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.average_rating || "0.0");
        setTotalReviews(data.total_reviews || 0);
      })
      .catch((err) => console.warn("Review API Error:", err.message));
  }, [product?.id]);

  /* ADD TO CART */
  const handleAddToCart = async () => {
    if (!product) return;
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      alertError("Silakan login terlebih dahulu");
      return router.push("/auth/login");
    }
    setLoadingCart(true);
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity: 1, price: product.price }),
      });
      if (!res.ok) throw new Error();
      alertSuccess("Berhasil masuk keranjang");
    } catch {
      alertError("Gagal menambahkan ke keranjang");
    } finally {
      setLoadingCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    const buyNowPayload = { product_id: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock, img: product.img_urls?.[0] || null };
    localStorage.setItem("buy_now_product", JSON.stringify(buyNowPayload));
    router.push("/checkout");
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-bold">Produk tidak ditemukan atau gagal dimuat.</p>
      </div>
    );
  }

  const p = parseFloat(product.price || 0);
  const op = parseFloat(product.original_price || 0);
  const hasPromo = product.is_promo && op > p;
  const discount = hasPromo ? Math.round(((op - p) / op) * 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 font-bold text-[#234C6A] hover:underline">
          <ArrowLeft size={20} /> Kembali ke Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="lg:sticky lg:top-24 h-[400px] md:h-[550px]">
            <DetailImageCarousel urls={product.img_urls} alt={product.name} />
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <span className="inline-block bg-blue-100 text-[#234C6A] px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4">
                {product.jenis_barang}
              </span>
              <h1 className="text-4xl font-black text-slate-900 leading-tight">{product.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="fill-yellow-500 text-yellow-500" size={20} />
                <span className="font-bold text-slate-900 text-lg">{avgRating}</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-slate-600 font-medium">{totalReviews} ulasan</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border shadow-sm">
              {hasPromo && (
                <div className="flex items-center gap-3 mb-1">
                  <span className="line-through text-gray-400 font-medium">Rp {op.toLocaleString("id-ID")}</span>
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
                </div>
              )}
              <p className="text-5xl font-black text-[#FF6D1F]">Rp {p.toLocaleString("id-ID")}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Stok Produk</p>
                <p className="font-black text-slate-900 text-lg">{product.stock} Unit</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Kategori</p>
                <p className="font-black text-slate-900 text-lg">{product.jenis_barang}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={handleAddToCart} disabled={loadingCart || product.stock === 0} className="bg-[#FF6D1F] text-white py-5 rounded-2xl font-black shadow-lg hover:bg-orange-600 disabled:bg-gray-300">
                {product.stock === 0 ? "Stok Habis" : "Masukkan Keranjang"}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0} className="bg-slate-900 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-slate-800 disabled:bg-gray-700">
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black mb-6 text-slate-900 border-b pb-4">Deskripsi Produk</h2>
          <div className="text-slate-700 leading-loose text-lg" dangerouslySetInnerHTML={{ __html: product.description ? product.description.replace(/\n/g, "<br/>") : "Tidak ada deskripsi" }} />
        </div>

        <div className="mt-20">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-black text-[#234C6A]">Ulasan Pembeli</h2>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{totalReviews}</span>
          </div>
          {reviews.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center text-gray-500 font-medium">
              Belum ada ulasan untuk produk ini
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-slate-900 text-lg">{r.user.name}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < r.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{new Date(r.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                  {r.comment && <p className="text-slate-700 italic border-l-4 border-gray-100 pl-4">"{r.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}