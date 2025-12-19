"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  Info,
  Loader2,
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

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
  initialSlug?: string; 
}

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

export default function ProductDetailClient({ initialProduct }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  // Guard untuk mencegah infinite loading & hydration mismatch
  const [isMount, setIsMount] = useState(false);

  const getStorageImageUrl = useCallback((p: any, index: number = 0) => {
    const urls = p?.image_urls || p?.img_urls || [];
    const targetImg = urls[index];
    if (!targetImg) return `${BASE_URL}/storage/products/default.png`;
    if (targetImg.startsWith("http")) return targetImg;
    
    const fileName = targetImg.replace("public/products/", "").replace("products/", "");
    return `${BASE_URL}/storage/products/${fileName}`;
  }, []);

  useEffect(() => {
    setIsMount(true); // Komponen sudah siap di browser

    if (product?.id) {
        fetch(`${API_URL}/reviews?product_id=${product.id}`)
          .then((res) => res.json())
          .then((data) => {
            setReviews(data.reviews || []);
            setAvgRating(data.average_rating || "0.0");
            setTotalReviews(data.total_reviews || 0);
          })
          .catch(err => console.error("Gagal ambil review:", err));
    }
  }, [product?.id]); // Hanya berjalan jika ID produk berubah, bukan objek produk

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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          price: product.price,
        }),
      });
      if (res.ok) alertSuccess("Berhasil masuk keranjang");
      else throw new Error();
    } catch {
      alertError("Gagal menambahkan ke keranjang");
    } finally {
      setLoadingCart(false);
    }
  };

  if (!isMount) return null; //

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#FF6D1F]" size={40} />
        <p className="font-bold text-[#234C6A]">Sedang memuat detail produk...</p>
      </div>
    );
  }

  const p = parseFloat(product.price || 0);
  const op = product.original_price ? parseFloat(product.original_price) : 0;
  const hasPromo = product.is_promo && op > p;
  const discount = hasPromo ? Math.round(((op - p) / op) * 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 font-bold text-[#234C6A] hover:underline">
          <ArrowLeft size={20} /> Kembali ke Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* IMAGE SECTION */}
          <div className="lg:sticky lg:top-24 h-[400px] md:h-[550px] relative group overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-inner">
            <div className="flex h-full transition-transform duration-500" style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}>
              {(product.img_urls && product.img_urls.length > 0 ? product.img_urls : [null]).map((_, i) => (
                <div key={i} className="w-full h-full shrink-0 flex items-center justify-center p-6">
                  <img
                    src={getStorageImageUrl(product, i)}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = `${BASE_URL}/storage/products/default.png`; }}
                  />
                </div>
              ))}
            </div>
            {product.img_urls && product.img_urls.length > 1 && (
              <>
                <button onClick={() => setCurrentImgIndex((i) => (i - 1 + product.img_urls.length) % product.img_urls.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow z-10 hover:bg-white"><ChevronLeft /></button>
                <button onClick={() => setCurrentImgIndex((i) => (i + 1) % product.img_urls.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow z-10 hover:bg-white"><ChevronRight /></button>
              </>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col gap-8">
            <div>
              <span className="inline-block bg-blue-100 text-[#234C6A] px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4">{product.jenis_barang}</span>
              <h1 className="text-4xl font-black text-slate-900 leading-tight">{product.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Star className="fill-yellow-500 text-yellow-500" size={20} /><span className="font-bold text-slate-900 text-lg">{avgRating}</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-slate-600 font-medium">{totalReviews} ulasan</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              {hasPromo && <div className="flex items-center gap-3 mb-1"><span className="line-through text-gray-400">Rp {op.toLocaleString("id-ID")}</span><span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span></div>}
              <p className="text-5xl font-black text-[#FF6D1F]">Rp {p.toLocaleString("id-ID")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={handleAddToCart} disabled={loadingCart || product.stock === 0} className="bg-[#FF6D1F] text-white py-5 rounded-2xl font-black shadow-lg hover:bg-orange-600 disabled:bg-gray-300">
                {loadingCart ? <Loader2 className="animate-spin mx-auto" /> : (product.stock === 0 ? "Stok Habis" : "Masukkan Keranjang")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}