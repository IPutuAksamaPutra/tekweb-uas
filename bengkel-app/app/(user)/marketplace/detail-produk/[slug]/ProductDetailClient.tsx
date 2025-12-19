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
  Loader2,
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

/* ===============================
    TYPES (FIXED)
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
  img_urls: string[]; // Gunakan nama yang konsisten dengan API
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
    IMAGE CAROUSEL (FIXED)
================================ */
const DetailImageCarousel = ({
  urls,
  alt,
}: {
  urls: string[];
  alt: string;
}) => {
  const [index, setIndex] = useState(0);
  
  // Memastikan data gambar terfilter dan path-nya benar
  const images = Array.isArray(urls) ? urls.filter(Boolean) : [];

  const getImageUrl = (src: string) => {
    if (!src) return "https://placehold.co/600x600?text=No+Image";
    if (src.startsWith("http")) return src;
    
    // Arahkan ke folder storage/products sesuai struktur Laravel Railway
    const fileName = src.replace("public/products/", "");
    return `${BASE_URL}/storage/products/${fileName}`;
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 rounded-3xl border-2 border-dashed">
        <Info size={40} />
        <p className="mt-2 font-black uppercase text-xs tracking-widest">Tidak ada gambar produk</p>
      </div>
    );
  }

  return (
    <div className="relative group w-full h-full overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-blue-900/5">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="w-full h-full shrink-0 flex items-center justify-center p-8"
          >
            <img
              src={getImageUrl(src)}
              alt={`${alt} ${i + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `${BASE_URL}/images/default_product.png`;
              }}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-[#FF6D1F] hover:text-white transition-all z-10 active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-[#FF6D1F] hover:text-white transition-all z-10 active:scale-90"
          >
            <ChevronRight size={24} />
          </button>
          
          {/* Indicator Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 transition-all rounded-full ${i === index ? 'w-8 bg-[#FF6D1F]' : 'w-2 bg-gray-300'}`}
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  /* FETCH REVIEW & DATA LENGKAP */
  useEffect(() => {
    if (!product?.id) return;

    // Ambil data review
    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.average_rating || "0.0");
        setTotalReviews(data.total_reviews || 0);
      })
      .catch(console.error);
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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
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

  /* BUY NOW */
  const handleBuyNow = () => {
    if (!product) return;
    const buyNowPayload = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock,
      img: product.img_urls?.[0] || null,
    };
    localStorage.setItem("buy_now_product", JSON.stringify(buyNowPayload));
    router.push("/checkout");
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-[#FF6D1F]" size={48} />
    </div>
  );

  const p = parseFloat(product.price);
  const op = product.original_price ? parseFloat(product.original_price) : 0;
  const hasPromo = product.is_promo && op > p;
  const discount = hasPromo ? Math.round(((op - p) / op) * 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 font-black text-[#234C6A] hover:text-[#FF6D1F] transition-colors uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={18} /> Kembali ke Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* IMAGE SECTION */}
          <div className="lg:sticky lg:top-24 h-[450px] md:h-[600px]">
            <DetailImageCarousel
              urls={product.img_urls || []}
              alt={product.name}
            />
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <span className="inline-block bg-[#234C6A] text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/10">
                {product.jenis_barang}
              </span>
              <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                <Star className="fill-yellow-500 text-yellow-500" size={20} />
                <span className="font-black text-slate-900 text-lg">
                  {avgRating}
                </span>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">
                {totalReviews} ulasan pembeli
              </span>
            </div>

            {/* PRICE */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5">
              {hasPromo && (
                <div className="flex items-center gap-3 mb-2">
                  <span className="line-through text-gray-300 font-bold text-lg">
                    Rp {op.toLocaleString("id-ID")}
                  </span>
                  <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">
                    SAVE {discount}%
                  </span>
                </div>
              )}
              <p className="text-6xl font-black text-[#FF6D1F] tracking-tighter">
                Rp {p.toLocaleString("id-ID")}
              </p>
            </div>

            {/* STOCK INFO */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
               <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Status Ketersediaan</p>
                  <p className={`font-black text-xl ${product.stock > 0 ? 'text-[#234C6A]' : 'text-red-500'}`}>
                    {product.stock > 0 ? `${product.stock} Unit Tersedia` : 'Stok Kosong'}
                  </p>
               </div>
               <div className="h-10 w-10 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <Info className="text-gray-300" size={20} />
               </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={loadingCart || product.stock === 0}
                className="bg-[#FF6D1F] text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all disabled:bg-gray-300 active:scale-95 flex items-center justify-center gap-3"
              >
                {loadingCart ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={20} /> Masukkan Keranjang</>}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="bg-[#234C6A] text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-slate-800 transition-all disabled:bg-gray-700 active:scale-95"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-20 bg-white p-10 md:p-14 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5">
          <h2 className="text-3xl font-black mb-8 text-[#234C6A] uppercase tracking-tighter border-b border-gray-50 pb-6">
            Deskripsi Produk
          </h2>
          <div
            className="text-slate-600 leading-relaxed text-lg font-medium"
            dangerouslySetInnerHTML={{
              __html: product.description ? product.description.replace(/\n/g, "<br/>") : "Tidak ada deskripsi.",
            }}
          />
        </div>

        {/* REVIEW SECTION */}
        <div className="mt-24">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-black text-[#234C6A] uppercase tracking-tighter">
              Ulasan Produk
            </h2>
            <div className="bg-[#FF6D1F] text-white px-4 py-1 rounded-full text-sm font-black">
              {totalReviews}
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white py-20 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
              <Star className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Belum ada ulasan untuk produk ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white p-8 rounded-4xl border border-gray-100 shadow-lg shadow-blue-900/5 hover:border-[#FF6D1F]/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="font-black text-[#234C6A] text-xl mb-1 capitalize">
                        {r.user.name}
                      </p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < r.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-200"}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      {new Date(r.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {r.comment && (
                    <div className="bg-gray-50 p-5 rounded-2xl">
                        <p className="text-slate-600 font-bold leading-relaxed italic">
                        "{r.comment}"
                        </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}