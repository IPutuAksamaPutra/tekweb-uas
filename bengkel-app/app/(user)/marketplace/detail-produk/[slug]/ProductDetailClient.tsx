"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

/* ===============================
   INTERFACE & PROPS
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
  initialProduct: any;
  initialSlug: string;
}

/* ===============================
   HELPER FUNCTIONS
================================ */
function getPriceInfo(product: any) {
  if (!product) return { hasPromo: false, original: 0, final: 0, discount: 0 };
  
  const p = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const op = product.original_price ? (typeof product.original_price === 'string' ? parseFloat(product.original_price) : product.original_price) : null;

  const hasPromo = product.is_promo && op && op > p;

  return {
    hasPromo,
    original: op ?? p,
    final: p,
    discount: hasPromo ? Math.round(((op - p) / op) * 100) : 0,
  };
}

const DetailImageCarousel = ({ urls, alt }: { urls: string[]; alt: string }) => {
  const [index, setIndex] = useState(0);
  const images = urls?.filter(Boolean) || [];

  if (images.length === 0) return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl">Tidak ada gambar</div>;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-white border">
      <div className="flex h-full transition-transform duration-300" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <div key={i} className="w-full h-full shrink-0 flex items-center justify-center p-4">
            <img 
              src={src.startsWith("http") ? src : `http://localhost:8000/images/${src}`} 
              alt={`${alt} ${i + 1}`} 
              className="w-full h-full object-contain" 
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><ChevronLeft size={20}/></button>
          <button onClick={() => setIndex((i) => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><ChevronRight size={20}/></button>
        </>
      )}
    </div>
  );
};

/* ===============================
   MAIN COMPONENT
================================ */
export default function ProductDetailClient({ initialProduct, initialSlug }: Props) {
  const router = useRouter();
  // 🔥 Pastikan state langsung menggunakan data dari server
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);

  // Sync data jika initialProduct berubah
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
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
      .catch(err => console.error("Review fetch error:", err));
  }, [product?.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) return alert("Silakan login terlebih dahulu.");

    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity: 1, price: product.price }),
      });
      if(res.ok) alert("Berhasil ditambah ke keranjang!");
    } catch (err) {
      alert("Gagal menambah ke keranjang");
    }
  };

  if (!product) {
    return <div className="text-center py-20 font-bold">Memuat data produk...</div>;
  }

  const { hasPromo, original, final, discount } = getPriceInfo(product);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 font-bold text-[#234C6A] hover:underline">
          <ArrowLeft size={20} /> Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow-lg">
          <div className="lg:h-[500px] h-[350px]">
            <DetailImageCarousel urls={product.img_urls} alt={product.name} />
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="text-yellow-500 font-bold text-lg">{avgRating} ★</span>
              <span>({totalReviews} Ulasan)</span>
            </div>

            <div className="bg-gray-100 p-5 rounded-xl border">
              {hasPromo && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm line-through text-gray-400 italic">Rp {original.toLocaleString('id-ID')}</span>
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
                </div>
              )}
              <p className="text-4xl font-black text-[#FF6D1F]">Rp {final.toLocaleString('id-ID')}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700"><Zap size={18} className="text-green-500"/><span className="text-sm font-medium">Stok: {product.stock}</span></div>
              <div className="flex items-center gap-3 text-gray-700"><Tag size={18} className="text-blue-500"/><span className="text-sm font-medium">Kategori: {product.jenis_barang}</span></div>
            </div>

            <button onClick={handleAddToCart} className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95" disabled={product.stock === 0}>
              <ShoppingCart size={22}/> {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button>
          </div>
        </div>

        <div className="mt-10 bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold text-[#234C6A] mb-4 border-b pb-2">Deskripsi Produk</h2>
          <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
        </div>
      </div>
    </div>
  );
}