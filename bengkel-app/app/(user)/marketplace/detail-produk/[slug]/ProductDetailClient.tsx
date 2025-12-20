"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  ArrowLeft, 
  Loader2, 
  Package, 
  ShieldCheck, 
  CheckCircle,
  Wrench
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* ================= TYPES ================= */
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

/* ================= CONFIG ================= */
const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

export default function ProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  /* 🚀 LOGIKA IMAGE SUPER AMAN (KEBAL DARI TYPEERROR) */
  const getImageUrl = (imgData?: any) => {
    let img = "";

    // 1. Ambil data pertama jika array, atau gunakan string jika bukan array
    if (Array.isArray(imgData) && imgData.length > 0) {
      img = imgData[0];
    } else if (typeof imgData === 'string') {
      img = imgData;
    }

    // 2. Jaga-jaga jika isinya masih berupa objek JSON yang belum terurai
    if (typeof img === 'object' && img !== null) {
      img = (img as any).url || ""; 
    }

    // 3. Validasi akhir: Jika bukan string atau kosong, return default
    if (!img || typeof img !== 'string') return "/no-image.png";

    // 4. Jika link sudah berupa URL utuh (http)
    if (img.startsWith("http")) return img;
    
    // 5. Pembersihan path storage Laravel (hapus public, hapus products double)
    const clean = img
      .replace("public/products/", "")
      .replace("products/", "")
      .replace("public/", "");

    return `${BASE_URL}/storage/products/${clean}`;
  };

  /* ================= FETCH DATA DENGAN MAPPING KETAT ================= */
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products/slug/${slug}`, { 
        headers: { "Accept": "application/json" },
        cache: "no-store" 
      });
      
      if (!res.ok) throw new Error("Produk tidak ditemukan");
      
      const json = await res.json();
      const rawData = json.product || json.data;

      // 🛠️ LOGIKA PARSING GAMBAR (MENGATASI STRING JSON DARI LARAVEL)
      let finalImages: string[] = [];
      const sourceImages = rawData.img_urls || rawData.img_url || [];

      if (typeof sourceImages === 'string') {
        try {
          // Jika data di DB tersimpan sebagai string JSON: '["foto.jpg"]'
          finalImages = JSON.parse(sourceImages);
        } catch {
          finalImages = [sourceImages];
        }
      } else {
        finalImages = Array.isArray(sourceImages) ? sourceImages : [sourceImages];
      }

      // 🚀 MAPPING KE STATE
      const mappedProduct: Product = {
        id: rawData.id,
        name: rawData.name,
        slug: rawData.slug,
        price: Number(rawData.price),
        stock: rawData.stock,
        jenis_barang: rawData.jenis_barang,
        description: rawData.description,
        img_urls: finalImages
      };

      setProduct(mappedProduct);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      alertError(err.message);
      router.push("/marketplace");
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => { 
    if (slug) fetchProduct(); 
  }, [slug, fetchProduct]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    
    if (!token) {
      alertError("Login dulu, Bos!");
      router.push("/auth/login");
      return;
    }

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
        body: JSON.stringify({ 
          product_id: product.id, 
          quantity: 1, 
          price: product.price 
        }),
      });

      if (res.ok) {
        alertSuccess(`${product.name} masuk keranjang!`);
      } else {
        throw new Error("Gagal menambah ke keranjang");
      }
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setAdding(false);
    }
  };

  /* ================= RENDER UI ================= */
  if (loading || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#0f172a] mb-4" size={40} />
      <span className="font-black italic text-slate-300 uppercase tracking-widest text-xl">
        Syncing Bengkel Data...
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-[#0f172a]">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* BACK BUTTON */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 mb-10 font-black uppercase text-[10px] text-slate-400 hover:text-orange-500 transition-all italic tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          KEMBALI KE MARKETPLACE
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* IMAGE SECTION */}
          <div className="aspect-square bg-white rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group relative">
            <img 
              src={getImageUrl(product.img_urls)} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/no-image.png";
              }}
            />
            <div className="absolute top-6 left-6 bg-[#0f172a] text-white p-4 rounded-2xl shadow-lg border border-white/20">
               <Wrench size={20} className="animate-pulse" />
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic shadow-lg">
                {product.jenis_barang}
              </span>
              <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
                {product.name}
              </h1>
            </div>
            
            {/* PRICE CARD */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 group hover:border-orange-500 transition-all duration-300">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Harga Resmi Sparepart</p>
              <h2 className="text-6xl font-black text-[#0f172a] tracking-tighter italic">
                Rp {product.price.toLocaleString("id-ID")}
              </h2>
            </div>

            {/* SPECS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-sm">
                <Package className="text-orange-500" size={24} />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Stok</span>
                  <span className="text-sm font-black uppercase">{product.stock} Unit</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-sm">
                <ShieldCheck className="text-blue-500" size={24} />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Status</span>
                  <span className="text-sm font-black uppercase">Genuine</span>
                </div>
              </div>
            </div>

            <p className="text-slate-500 font-medium leading-relaxed italic border-l-4 border-orange-500 pl-6 text-sm">
              {product.description || "Suku cadang original dengan standar kualitas tinggi. Pastikan kecocokan part sebelum membeli."}
            </p>

            {/* ACTION BUTTON */}
            <button 
              onClick={handleAddToCart}
              disabled={adding || product.stock <= 0}
              className="w-full bg-[#0f172a] hover:bg-orange-600 text-white py-8 rounded-4xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
            >
              {adding ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={24} /> 
                  {product.stock > 0 ? "MASUKKAN KERANJANG" : "STOK HABIS"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}