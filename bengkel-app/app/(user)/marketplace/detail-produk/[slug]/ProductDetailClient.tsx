"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Tag,
  Zap,
  ChevronLeft,
  ChevronRight,
  Star,
  Info,
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* ===============================
   TYPES & INTERFACES
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
   SUB-COMPONENT: IMAGE CAROUSEL
================================ */
const DetailImageCarousel = ({ urls, alt }: { urls: string[]; alt: string }) => {
  const [index, setIndex] = useState(0);
  const images = urls?.filter(Boolean) || [];

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
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="w-full h-full shrink-0 flex items-center justify-center p-6">
            <img
              src={src.startsWith("http") ? src : `http://localhost:8000/images/${src}`}
              alt={`${alt} ${i + 1}`}
              className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-[#234C6A] p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-[#234C6A] p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronRight size={24} />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-[#FF6D1F]' : 'w-2 bg-gray-300'}`} 
              />
            ))}
          </div>
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
  const [isMount, setIsMount] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  useEffect(() => {
    setIsMount(true);
    if (initialProduct) setProduct(initialProduct);
  }, [initialProduct]);

  useEffect(() => {
    if (!product?.id) return;
    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.average_rating || "0.0");
        setTotalReviews(data.total_reviews || 0);
      })
      .catch((err) => console.error("Review error:", err));
  }, [product?.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    
    if (!token) {
      alertError("Silakan login terlebih dahulu untuk belanja.");
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

      if (res.ok) {
        alertSuccess("Produk berhasil masuk keranjang!");
      } else {
        throw new Error();
      }
    } catch (err) {
      alertError("Gagal menambah ke keranjang.");
    } finally {
      setLoadingCart(false);
    }
  };

  if (!isMount) return null;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6D1F] border-t-transparent"></div>
      </div>
    );
  }

  // Price Calculation Logic
  const p = parseFloat(product.price);
  const op = product.original_price ? parseFloat(product.original_price) : 0;
  const hasPromo = product.is_promo && op > p;
  const discount = hasPromo ? Math.round(((op - p) / op) * 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Navigation */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 mb-8 font-bold text-[#234C6A] transition-colors hover:text-[#FF6D1F]"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left: Images */}
          <div className="lg:sticky lg:top-24 h-[400px] md:h-[550px]">
            <DetailImageCarousel urls={product.img_urls} alt={product.name} />
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <span className="bg-blue-100 text-[#234C6A] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {product.jenis_barang}
              </span>
              <h1 className="text-4xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">
                  <Star size={18} className="fill-yellow-500 text-yellow-500" />
                  <span className="font-bold text-yellow-700 text-lg">{avgRating}</span>
                </div>
                <span className="text-gray-400 font-medium">|</span>
                <span className="text-gray-500 font-medium underline underline-offset-4">
                  {totalReviews} Ulasan Pembeli
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FF6D1F]/10 px-4 py-1 rounded-bl-2xl">
                <Zap size={14} className="text-[#FF6D1F] inline mr-1" />
                <span className="text-[10px] font-bold text-[#FF6D1F] uppercase">Harga Terbaik</span>
              </div>

              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Harga</p>
              
              <div className="flex flex-col">
                {hasPromo && (
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg line-through text-gray-300 font-medium">
                      Rp {op.toLocaleString("id-ID")}
                    </span>
                    <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded-md">
                      -{discount}%
                    </span>
                  </div>
                )}
                <p className="text-5xl font-black text-[#FF6D1F] tracking-tighter">
                  Rp {p.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Product Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border flex items-center gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Stok Produk</p>
                  <p className="font-bold text-slate-800">{product.stock} Unit</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Tag size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Kategori</p>
                  <p className="font-bold text-slate-800">{product.jenis_barang}</p>
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || loadingCart}
              className="w-full bg-[#FF6D1F] hover:bg-orange-600 disabled:bg-gray-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-4 text-xl transform active:scale-[0.98]"
            >
              {loadingCart ? (
                <div className="h-6 w-6 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
              ) : (
                <>
                  <ShoppingCart size={24} />
                  {product.stock === 0 ? "Stok Sedang Habis" : "Masukkan Keranjang"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-[#234C6A]">Deskripsi Produk</h2>
            <div className="h-1 flex-1 bg-gray-100 rounded-full"></div>
          </div>
          
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div 
              className="text-gray-600 leading-relaxed text-lg space-y-4"
              dangerouslySetInnerHTML={{ 
                __html: product.description.replace(/\n/g, '<br/>') 
              }} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}