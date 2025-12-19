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

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

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
    IMAGE CAROUSEL (ULTRA FALLBACK)
================================ */
const DetailImageCarousel = ({ urls, alt }: { urls: string[]; alt: string }) => {
  const [index, setIndex] = useState(0);
  const images = Array.isArray(urls) ? urls.filter(Boolean) : [];

  const getImageUrl = (src: string) => {
    if (!src) return "https://placehold.co/600x600?text=No+Image";
    if (src.startsWith("http")) return src;
    
    // Kita hapus semua prefix folder, ambil nama file-nya saja
    const fileName = src.split('/').pop();
    
    // Kita arahkan langsung ke /storage/ tanpa subfolder 'products' 
    // karena banyak kasus upload Railway langsung ke root storage
    return `${BASE_URL}/storage/${fileName}`;
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
                const target = e.currentTarget as HTMLImageElement;
                // Jika gagal di /storage/ , coba ke /storage/products/
                if (!target.src.includes('/products/')) {
                    const fileName = src.split('/').pop();
                    target.src = `${BASE_URL}/storage/products/${fileName}`;
                } else {
                    // Jika semua gagal, kasih placeholder
                    target.src = `${BASE_URL}/images/default_product.png`;
                }
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

export default function ProductDetailClient({ initialProduct }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
            setReviews(data.reviews || []);
            setAvgRating(data.average_rating || "0.0");
            setTotalReviews(data.total_reviews || 0);
        }
      })
      .catch(() => {});
  }, [product?.id]);

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
      if (res.ok) alertSuccess("Produk berhasil masuk keranjang");
      else throw new Error();
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

  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold">Produk tidak ditemukan</div>;

  const p = parseFloat(product.price || 0);
  const op = parseFloat(product.original_price || 0);
  const hasPromo = product.is_promo && op > p;
  const discount = hasPromo ? Math.round(((op - p) / op) * 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 font-bold text-[#234C6A] hover:underline uppercase text-sm">
          <ArrowLeft size={20} /> Kembali
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
              <h1 className="text-4xl font-black text-slate-900">{product.name}</h1>
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
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Stok Produk</p>
                <p className="font-black text-slate-900 text-lg">{product.stock} Unit</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Kategori</p>
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
          <h2 className="text-2xl font-black mb-6 text-slate-900 border-b pb-4 uppercase">Deskripsi Produk</h2>
          <div className="text-slate-700 leading-loose text-lg" dangerouslySetInnerHTML={{ __html: product.description ? product.description.replace(/\n/g, "<br/>") : "Tidak ada deskripsi" }} />
        </div>
      </div>
    </div>
  );
}