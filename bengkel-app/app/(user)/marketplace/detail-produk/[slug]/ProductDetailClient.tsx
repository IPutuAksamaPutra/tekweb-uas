"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2,
  ShoppingCart,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

/* ================= TYPE ================= */

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
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

/* ================= COMPONENT ================= */

export default function ProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  /* ================= FETCH PRODUCT (ANTI LOOP) ================= */

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/slug/${slug}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Fetch gagal");

        const json = await res.json();
        const raw = json.product;

        // 🔥 NORMALISASI FIELD BACKEND (TETAP SAMA)
        const normalized: Product = {
          id: raw.id,
          name: raw.name,
          slug: raw.slug,
          price: raw.price,
          stock: raw.stock,
          jenis_barang: raw.jenis_barang,
          description: raw.description,
          img_urls: raw.img_url ?? [], 
        };

        setProduct(normalized);
      } catch (err) {
        console.error("FETCH PRODUCT ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  /* ================= FETCH REVIEW ================= */

  useEffect(() => {
    if (!product?.id) return;

    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => {});
  }, [product?.id]);

  /* ================= LOGIC HELPER ================= */

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const getImageUrl = (index: number) => {
    const img = product?.img_urls?.[index];
    if (!img) return "https://placehold.co/600x600?text=No+Image";
    return `${BASE_URL}/storage/products/${img}`;
  };

  /* ================= CART ================= */

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

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={48} />
        <p className="font-black text-[#234C6A] uppercase text-xs tracking-[0.2em] animate-pulse">
          Menyinkronkan Data Railway...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-20 text-center font-black uppercase text-gray-400">
        Produk tidak ditemukan
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tombol Kembali */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 font-black text-[#234C6A] hover:text-[#FF6D1F] transition-all uppercase text-xs tracking-widest group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* IMAGE SECTION */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 h-[400px] md:h-[550px] flex items-center justify-center overflow-hidden group">
              <img
                src={getImageUrl(currentImgIndex)}
                alt={product.name}
                className="max-h-full max-w-full object-contain p-12 transition-transform duration-500 group-hover:scale-105"
              />

              {product.img_urls.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setCurrentImgIndex((i) => (i - 1 + product.img_urls.length) % product.img_urls.length)}
                    className="bg-white/90 p-3 rounded-full shadow-lg hover:bg-[#FF6D1F] hover:text-white transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setCurrentImgIndex((i) => (i + 1) % product.img_urls.length)}
                    className="bg-white/90 p-3 rounded-full shadow-lg hover:bg-[#FF6D1F] hover:text-white transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Thumbnail */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.img_urls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImgIndex(idx)}
                  className={`w-20 h-20 rounded-2xl border-2 shrink-0 overflow-hidden transition-all ${
                    currentImgIndex === idx ? "border-[#FF6D1F] scale-95 shadow-lg" : "border-transparent opacity-60"
                  }`}
                >
                  <img src={getImageUrl(idx)} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-[#234C6A] text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">
                  {product.jenis_barang}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="bg-red-100 text-red-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Stok Terbatas!
                  </span>
                )}
              </div>

              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                  <Star className="fill-yellow-500 text-yellow-500" size={18} />
                  <span className="font-black text-slate-800 text-sm">{averageRating}</span>
                </div>
                <div className="h-1 w-1 bg-gray-300 rounded-full" />
                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                  {reviews.length} Ulasan Pembeli
                </span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Harga Spesial Railway</p>
              <p className="text-6xl font-black text-[#FF6D1F] tracking-tighter">
                Rp {Number(product.price).toLocaleString("id-ID")}
              </p>
              <div className="mt-6 flex items-center gap-2 text-slate-500 font-bold text-xs border-t border-gray-50 pt-4">
                <Package size={16} className="text-[#FF6D1F]" />
                Tersedia: {product.stock} Unit di Gudang
              </div>
            </div>

            {/* Benefit Mini */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-3xl border border-gray-100">
                <ShieldCheck className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">Original<br/>Guaranteed</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-3xl border border-gray-100">
                <Truck className="text-blue-500" />
                <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">Express<br/>Delivery</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest ml-2">Detail Deskripsi</h3>
              <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                <p className="text-slate-600 leading-relaxed font-medium">
                  {product.description || "BengkelApp menyediakan sparepart dan aksesoris berkualitas tinggi untuk kebutuhan otomotif Anda."}
                </p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={loadingCart || product.stock === 0}
              className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white py-6 rounded-4xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-orange-100 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
            >
              {loadingCart ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <ShoppingCart size={24} /> {product.stock === 0 ? "Habis Terjual" : "Masukkan Keranjang"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* REVIEW SECTION */}
        <div className="mt-20 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <h2 className="text-3xl font-black text-[#234C6A] tracking-tighter uppercase">Ulasan Pelanggan</h2>
            <div className="text-right">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total</p>
              <p className="text-2xl font-black text-[#FF6D1F]">{reviews.length} Review</p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white p-16 rounded-[3rem] text-center border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm italic">Belum ada ulasan untuk produk ini</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center font-black text-[#234C6A]">
                        {rev.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase">{rev.user.name}</p>
                        <p className="text-[10px] font-bold text-gray-400">Terverifikasi</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium italic leading-relaxed">"{rev.comment || "Produk sangat memuaskan dan berkualitas!"}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}