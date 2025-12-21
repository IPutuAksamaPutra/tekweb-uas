"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  Star,
  CheckCircle2,
  Heart,
  Package,
  MessageSquare,
  Wrench,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* ================= TYPES ================= */
interface Review {
  id: number;
  rating: number;
  comment: string;
  user?: { name: string };
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  jenis_barang: string;
  img_urls: string[];
  description?: string;
}

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

export default function ProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  
  // STATE BARU: Untuk mengontrol gambar yang sedang aktif
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const getImageUrl = (imgData?: any) => {
    if (!imgData) return "/no-image.png";
    let imgName = "";
    if (Array.isArray(imgData) && imgData.length > 0) {
      imgName = imgData[0];
    } else if (typeof imgData === 'string') {
      try {
        const parsed = JSON.parse(imgData);
        imgName = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch { imgName = imgData; }
    }
    if (!imgName || typeof imgName !== 'string') return "/no-image.png";
    if (imgName.startsWith("http")) return imgName;
    const fileName = imgName.split('/').pop(); 
    return `${BASE_URL}/storage/products/${fileName}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products/slug/${slug}`, { 
        headers: { "Accept": "application/json" },
        cache: "no-store" 
      });
      if (!res.ok) throw new Error("Produk tidak ditemukan");
      const json = await res.json();
      const rawData = json.product || json.data;

      let finalImages: string[] = [];
      const sourceImages = rawData.img_urls || rawData.img_url || [];
      
      // LOGIKA PARSING ARRAY GAMBAR
      if (typeof sourceImages === 'string') {
        try { 
            const parsed = JSON.parse(sourceImages);
            finalImages = Array.isArray(parsed) ? parsed : [parsed];
        } catch { 
            finalImages = sourceImages.split(',').map(s => s.trim()); 
        }
      } else {
        finalImages = Array.isArray(sourceImages) ? sourceImages : [sourceImages];
      }

      setProduct({ ...rawData, price: Number(rawData.price), img_urls: finalImages });

      const reviewRes = await fetch(`${API_URL}/reviews?product_id=${rawData.id}`, {
        headers: { "Accept": "application/json" },
      });
      if (reviewRes.ok) {
        const revJson = await reviewRes.json();
        setReviews(revJson.reviews || revJson.data || []);
      }
    } catch (err: any) {
      alertError(err.message);
      router.push("/marketplace");
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => { if (slug) fetchData(); }, [slug, fetchData]);

  const handleAddToCart = async () => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) { alertError("Silakan login terlebih dahulu"); router.push("/auth/login"); return; }
    if (!product) return;

    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ product_id: product.id, quantity: 1, price: product.price }),
      });
      if (res.ok) alertSuccess("Produk berhasil ditambahkan!");
      else throw new Error("Gagal menambah ke keranjang");
    } catch (err: any) { alertError(err.message); }
    finally { setAdding(false); }
  };

  if (loading || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-teal-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 font-sans text-gray-800">
      <nav className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> KEMBALI
        </button>
        <div className="hidden sm:flex gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-black italic">
          Marketplace / {product.jenis_barang} / Details
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-8 md:gap-12 items-start pt-6">
        
        {/* GALLERY SECTION (DIPERBARUI) */}
        <section className="space-y-4 md:space-y-6">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative group">
            {/* Gambar Utama */}
            <img 
              src={getImageUrl(product.img_urls[activeImgIndex])} 
              alt={product.name} 
              className="w-full h-full object-contain p-6 md:p-10 transition-transform duration-500"
            />
            
            <div className="absolute top-4 left-4 md:top-6 md:left-6">
              {product.stock > 0 ? (
                <span className="bg-white text-black px-3 md:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Ready Stock</span>
              ) : (
                <span className="bg-red-50 text-red-600 px-3 md:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border-2 border-red-200">Out of Stock</span>
              )}
            </div>

            {/* Tombol Navigasi Panah (Hanya jika gambar > 1) */}
            {product.img_urls.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <button 
                        onClick={() => setActiveImgIndex((prev) => (prev === 0 ? product.img_urls.length - 1 : prev - 1))}
                        className="p-2 bg-white border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] pointer-events-auto hover:bg-gray-50 active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={() => setActiveImgIndex((prev) => (prev === product.img_urls.length - 1 ? 0 : prev + 1))}
                        className="p-2 bg-white border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] pointer-events-auto hover:bg-gray-50 active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
          </div>
          
          {/* List Thumbnail (Mapping Gambar) */}
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {product.img_urls.map((img, index) => (
                <div 
                    key={index}
                    onClick={() => setActiveImgIndex(index)}
                    className={`min-w-20 md:min-w-24 w-20 md:w-24 h-20 md:h-24 rounded-2xl border-2 cursor-pointer transition-all bg-white overflow-hidden p-1 ${
                        activeImgIndex === index 
                        ? "border-teal-600 shadow-[4px_4px_0px_0px_rgba(13,148,136,1)] scale-95" 
                        : "border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105"
                    }`}
                >
                    <img 
                        src={getImageUrl(img)} 
                        className="w-full h-full object-cover rounded-xl" 
                        alt={`thumb-${index}`} 
                    />
                </div>
            ))}
          </div>
        </section>

        {/* INFO SECTION */}
        <section className="flex flex-col gap-6 md:gap-8">
          <div className="space-y-2 md:space-y-3">
            <p className="text-teal-600 font-black text-xs tracking-[0.2em] uppercase italic">{product.jenis_barang}</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-tight uppercase italic">{product.name}</h1>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <span className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">({reviews.length} Verified Reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4 md:gap-6">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic">Rp {product.price.toLocaleString("id-ID")}</h2>
            
          </div>

          <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-600 leading-relaxed font-medium italic text-sm md:text-base">
              {product.description || "Suku cadang original dengan daya tahan tinggi. Didesain khusus untuk performa maksimal kendaraan Anda."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={handleAddToCart}
              disabled={adding || product.stock <= 0}
              className="flex-2 bg-black hover:bg-teal-800 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-teal-100 flex items-center justify-center gap-3 active:scale-95 disabled:bg-gray-200"
            >
              {adding ? <Loader2 className="animate-spin" size={24} /> : <><ShoppingCart size={24} /> ADD TO CART</>}
            </button>
            <button className="flex-1 bg-white border border-gray-200 text-gray-400 p-4 md:p-5 rounded-xl md:rounded-2xl transition-all hover:bg-gray-50 active:scale-95 flex items-center justify-center">
              <Heart size={28} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 md:pt-8">
             <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-black uppercase tracking-tighter text-gray-500">
                <ShieldCheck className="text-teal-600 w-5 h-5 md:w-6 md:h-6" /> Genuine Parts
             </div>
             <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-black uppercase tracking-tighter text-gray-500">
                <CheckCircle2 className="text-teal-600 w-5 h-5 md:w-6 md:h-6" /> Easy Install
             </div>
          </div>
        </section>
      </main>

      {/* TABS SECTION */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-16 md:mt-24">
        <div className="flex border-b border-gray-100 gap-6 md:gap-10 overflow-x-auto scrollbar-hide">
          {[
            { id: "description", label: "Description", icon: <Package size={14} /> },
            { id: "reviews", label: "Reviews", icon: <MessageSquare size={14} /> }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 md:pb-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? "text-teal-600" : "text-gray-300 hover:text-gray-500"
              }`}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 md:h-1.5 bg-teal-600 rounded-full" />}
            </button>
          ))}
        </div>

        <div className="py-8 md:py-12 min-h-[250px] md:min-h-[300px]">
          {activeTab === "description" && (
            <div className="max-w-4xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row items-start gap-4">
                 <div className="bg-gray-50 p-3 md:p-4 rounded-xl text-teal-600">
                   <Wrench size={24} />
                 </div>
                 <div className="space-y-3 md:space-y-4">
                    <h4 className="text-base md:text-lg font-black uppercase italic tracking-tight text-gray-900">Spesifikasi Teknis</h4>
                    <p className="text-gray-500 leading-relaxed text-base md:text-lg font-medium italic">
                      {product.description || "Setiap komponen yang kami jual telah melewati inspeksi teknis yang ketat untuk memastikan kompatibilitas dan keamanan berkendara."}
                    </p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {reviews.length > 0 ? reviews.map((rev) => (
                <div key={rev.id} className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100 transition-all">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="space-y-1">
                       <span className="font-black text-[10px] md:text-xs uppercase tracking-tighter text-gray-900">{rev.user?.name || "Verified Rider"}</span>
                       <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(rev.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} className="text-yellow-400" />)}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 font-medium italic leading-relaxed">"{rev.comment}"</p>
                </div>
              )) : (
                <div className="col-span-full py-16 text-center text-gray-300 font-black uppercase italic tracking-widest">No reviews found for this component</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}