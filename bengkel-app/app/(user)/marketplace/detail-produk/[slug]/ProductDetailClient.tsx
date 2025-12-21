"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  ArrowLeft, 
  Loader2, 
  Package, 
  ShieldCheck, 
  Star,
  Wrench,
  MessageSquare,
  User
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
  img_urls: string[]; // Pastikan ini array string
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

  /* 🚀 LOGIKA IMAGE ARRAY - MENGAMBIL INDEKS PERTAMA */
  const getImageUrl = (imgData?: any) => {
    if (!imgData) return "/no-image.png";
    let imgName = "";

    // 1. Bongkar jika data berupa Array
    if (Array.isArray(imgData) && imgData.length > 0) {
      imgName = imgData[0];
    } 
    // 2. Bongkar jika data berupa String JSON (misal: '["foto.jpg"]')
    else if (typeof imgData === 'string') {
      try {
        const parsed = JSON.parse(imgData);
        imgName = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch { 
        imgName = imgData; 
      }
    }

    if (!imgName || typeof imgName !== 'string') return "/no-image.png";
    if (imgName.startsWith("http")) return imgName;

    // 3. Ambil nama filenya saja untuk storage Railway
    const fileName = imgName.split('/').pop(); 
    return `${BASE_URL}/storage/products/${fileName}`;
  };

  /* ================= FETCH DATA ================= */
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

      // Proteksi parsing img_urls agar tetap jadi Array
      let finalImages: string[] = [];
      const sourceImages = rawData.img_urls || rawData.img_url || [];
      
      if (typeof sourceImages === 'string') {
        try {
          finalImages = JSON.parse(sourceImages);
        } catch {
          finalImages = [sourceImages];
        }
      } else {
        finalImages = Array.isArray(sourceImages) ? sourceImages : [sourceImages];
      }

      setProduct({
        ...rawData,
        price: Number(rawData.price),
        img_urls: finalImages
      });

      // Fetch Review dari tabel reviews berdasarkan product_id
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
    if (!token) { alertError("Login dulu, Bos!"); router.push("/auth/login"); return; }
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

      if (res.ok) alertSuccess(`${product.name} masuk keranjang!`);
      else throw new Error("Gagal menambah ke keranjang");
    } catch (err: any) { alertError(err.message); }
    finally { setAdding(false); }
  };

  if (loading || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
      <span className="font-black italic text-[#0f172a] uppercase tracking-widest text-xl animate-pulse text-center">
        PREPARING COMPONENTS...
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-[#0f172a]">
      <div className="h-2 bg-orange-500 w-full" />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {/* Tombol Kembali */}
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-10 font-black uppercase text-[10px] text-slate-400 hover:text-orange-500 transition-all italic tracking-widest group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          KEMBALI KE MARKETPLACE
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* BAGIAN GAMBAR */}
          <div className="sticky top-10 space-y-6">
            <div className="aspect-square bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border-12 border-white relative group">
              <img 
                src={getImageUrl(product.img_urls)} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              />
              <div className="absolute top-6 left-6 bg-[#0f172a] text-white p-4 rounded-3xl shadow-xl border border-white/10">
                 <Wrench size={24} className="animate-pulse text-orange-500" />
              </div>
            </div>
          </div>

          {/* BAGIAN INFO PRODUK */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-orange-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-orange-100">
                  {product.jenis_barang}
                </span>
                <span className="bg-[#0f172a] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic border border-white/10">
                  GENUINE PARTS
                </span>
              </div>
              <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none text-[#0f172a]">
                {product.name}
              </h1>
            </div>
            
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-b-12 border-orange-500 relative overflow-hidden group hover:bg-[#0f172a] transition-all duration-500">
              <p className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-[0.3em] italic group-hover:text-orange-500">Official Workshop Price</p>
              <h2 className="text-7xl font-black text-[#0f172a] tracking-tighter italic leading-none group-hover:text-white transition-colors">
                Rp {product.price.toLocaleString("id-ID")}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-7 rounded-4xl flex items-center gap-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 shadow-inner"><Package size={28} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase italic">Availability</span>
                  <span className="text-2xl font-black">{product.stock} UNIT</span>
                </div>
              </div>
              <div className="bg-white p-7 rounded-4xl flex items-center gap-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 shadow-inner"><ShieldCheck size={28} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase italic">Authenticity</span>
                  <span className="text-2xl font-black uppercase tracking-tighter">VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-black italic uppercase text-xl flex items-center gap-4">
                <div className="w-12 h-1.5 bg-orange-500 rounded-full" /> Technical Specs
              </h3>
              <p className="text-slate-500 font-bold leading-relaxed italic text-lg bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 shadow-inner relative overflow-hidden">
                {product.description || "Komponen cadangan motor berkualitas tinggi. Didesain khusus untuk performa maksimal dan durabilitas jangka panjang. Pastikan kode part sesuai dengan kendaraan Anda sebelum melakukan pemesanan."}
              </p>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={adding || product.stock <= 0}
              className="w-full bg-[#0f172a] hover:bg-orange-600 text-white py-10 rounded-[3rem] font-black uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-5 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 group overflow-hidden relative"
            >
              {adding ? <Loader2 className="animate-spin" /> : (
                <>{product.stock > 0 ? (
                  <><ShoppingCart size={28} className="group-hover:rotate-12 transition-transform" /> MASUKKAN KE KERANJANG</>
                ) : "STOCK UNAVAILABLE"}</>
              )}
            </button>
          </div>
        </div>

        {/* SECTION REVIEW - TABEL REVIEWS */}
        <div className="mt-40 space-y-16">
          <div className="flex flex-col items-center gap-6 text-center">
             <div className="bg-[#0f172a] p-6 rounded-4xl text-orange-500 shadow-2xl border-4 border-white"><MessageSquare size={40} /></div>
             <div>
                <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Riders <span className="text-orange-500">Feedback</span></h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 italic">Real experience from the track</p>
             </div>
             <div className="h-2 w-32 bg-orange-500 rounded-full" />
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 relative group overflow-hidden hover:border-orange-500 transition-all duration-300">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                       <div className="bg-slate-100 p-4 rounded-2xl text-slate-400 group-hover:bg-[#0f172a] group-hover:text-orange-500 transition-colors"><User size={24} /></div>
                       <div>
                          <p className="font-black uppercase text-sm italic tracking-tight">{rev.user?.name || "Anonymous Rider"}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(rev.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</p>
                       </div>
                    </div>
                    <div className="flex gap-1 bg-slate-50 px-3 py-1.5 rounded-xl">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < rev.rating ? "text-orange-500 fill-orange-500" : "text-slate-200"} />
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="text-6xl text-orange-500/10 font-black absolute -top-8 -left-4">"</span>
                    <p className="text-slate-600 font-black italic leading-relaxed text-base relative z-10">{rev.comment}</p>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-24 rounded-[4rem] text-center border-4 border-dashed border-slate-100 flex flex-col items-center gap-6">
                <Package size={60} className="text-slate-100" />
                <p className="text-slate-300 font-black uppercase italic tracking-[0.3em] text-xl">Part ini belum memiliki ulasan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}