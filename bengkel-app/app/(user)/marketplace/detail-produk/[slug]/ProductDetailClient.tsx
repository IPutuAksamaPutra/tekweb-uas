"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2,
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

/* ================= INTERFACE ================= */

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

export default function ProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true); // State loading yang jelas
  const [error, setError] = useState(false);
  const [isMount, setIsMount] = useState(false); // Guard untuk Hydration

  /* ================= HYDRATION GUARD ================= */
  useEffect(() => {
    setIsMount(true);
  }, []);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    if (!slug) return;

    setLoadingPage(true);
    fetch(`${API_URL}/products/slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data");
        return res.json();
      })
      .then((data) => {
        // Penyesuaian: Pastikan mengambil object produk yang benar dari response API
        const fetchedProduct = data.product || data.data || data;
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          throw new Error("Produk kosong");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoadingPage(false));
  }, [slug]);

  /* ================= FETCH REVIEW ================= */
  useEffect(() => {
    if (!product?.id) return;

    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.average_rating || "0.0");
        setTotalReviews(data.total_reviews || 0);
      })
      .catch(() => {});
  }, [product?.id]);

  /* ================= IMAGE HELPER ================= */
  const getImageUrl = (index: number) => {
    const urls = product?.img_urls || [];
    const img = urls[index];
    if (!img) return `${BASE_URL}/storage/products/default.png`;
    if (img.startsWith("http")) return img;
    
    // Perbaikan path storage railway
    const fileName = img.replace("public/products/", "").replace("products/", "");
    return `${BASE_URL}/storage/products/${fileName}`;
  };

  /* ================= CART HANDLER ================= */
  const handleAddToCart = async () => {
    if (!product) return;

    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      alertError("Silakan login terlebih dahulu");
      router.push("/auth/login");
      return;
    }

    setLoadingCart(true);
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          price: product.price,
        }),
      });

      if (!res.ok) throw new Error();
      alertSuccess("Berhasil masuk keranjang");
    } catch {
      alertError("Gagal menambahkan ke keranjang");
    } finally {
      setLoadingCart(false);
    }
  };

  /* ================= RENDERING ================= */
  
  if (!isMount) return null;

  if (loadingPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={40} />
        <p className="font-bold text-gray-500">Memuat Detail Produk...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-gray-400">Produk tidak ditemukan</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-500 underline">
          Kembali
        </button>
      </div>
    );
  }

  const p = parseFloat(product.price);
  const op = product.original_price ? parseFloat(product.original_price) : 0;
  const hasPromo = product.is_promo && op > p;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 font-bold text-[#234C6A] hover:underline"
        >
          <ArrowLeft size={20} /> Kembali ke Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* IMAGE SECTION */}
          <div className="relative bg-white rounded-3xl border shadow-sm overflow-hidden h-[500px] flex items-center justify-center">
            <img
              src={getImageUrl(currentImgIndex)}
              alt={product.name}
              className="max-w-full max-h-full object-contain p-4"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "https://placehold.co/600x600?text=No+Image";
              }}
            />

            {product.img_urls && product.img_urls.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImgIndex((i) => (i - 1 + product.img_urls.length) % product.img_urls.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-md hover:bg-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setCurrentImgIndex((i) => (i + 1) % product.img_urls.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-md hover:bg-white"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="space-y-6">
            <div>
               <span className="bg-blue-100 text-[#234C6A] text-xs font-black px-3 py-1 rounded-full uppercase">
                  {product.jenis_barang}
               </span>
               <h1 className="text-5xl font-black mt-4 leading-tight">{product.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <b className="text-xl">{avgRating}</b>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-gray-500 font-medium">
                {totalReviews} ulasan pembeli
              </span>
            </div>

            <div className="bg-white p-8 rounded-4xl border shadow-sm">
              {hasPromo && (
                <p className="line-through text-gray-400 font-bold text-lg mb-1">
                  Rp {op.toLocaleString("id-ID")}
                </p>
              )}
              <p className="text-6xl font-black text-[#FF6D1F]">
                Rp {p.toLocaleString("id-ID")}
              </p>
              <p className="mt-4 text-gray-500 font-bold uppercase text-xs tracking-widest">
                Tersedia: {product.stock} Unit
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border">
               <h3 className="font-black mb-2 uppercase text-xs text-gray-400">Deskripsi Produk</h3>
               <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || "Tidak ada deskripsi."}
               </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={loadingCart || product.stock === 0}
              className="w-full bg-[#FF6D1F] hover:bg-orange-600 transition-all text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-orange-100 disabled:bg-gray-300 disabled:shadow-none"
            >
              {loadingCart ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                product.stock === 0 ? "Stok Habis" : "Masukkan Keranjang"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}