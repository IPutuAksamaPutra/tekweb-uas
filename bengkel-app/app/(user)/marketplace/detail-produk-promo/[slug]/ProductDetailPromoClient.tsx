"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  ArrowLeft, 
  Loader2, 
  Flame, 
  Tag, 
  Package, 
  CheckCircle2, 
  ShieldCheck, 
  Star,
  Wrench,
  Clock,
  ChevronRight
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

export default function ProductDetailPromoClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const BASE_URL = "https://tekweb-uas-production.up.railway.app";
  const API_URL = `${BASE_URL}/api`;

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
      const resP = await fetch(`${API_URL}/products/slug/${slug}`, { cache: "no-store" });
      const jsonP = await resP.json();
      const pData = jsonP.product || jsonP.data;

      const resPr = await fetch(`${API_URL}/promotions`, { cache: "no-store" });
      const jsonPr = await resPr.json();
      const promos = jsonPr.promotions || jsonPr.data || [];
      
      const activeP = promos.find((item: any) => 
        item.is_active && item.products.some((prod: any) => prod.slug === slug)
      );

      setProduct(pData);
      setPromo(activeP);
    } catch (err) { 
      alertError("Gagal memuat data promosi"); 
    } finally { 
      setLoading(false); 
    }
  }, [slug, API_URL]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const originalPrice = product ? Number(product.price) : 0;
  const discount = promo ? (promo.discount_type === 'percentage' ? originalPrice * (promo.discount_value/100) : promo.discount_value) : 0;
  const finalPrice = originalPrice - discount;
  const discountPercent = promo?.discount_type === 'percentage' ? promo.discount_value : Math.round((discount / originalPrice) * 100);

  const handleAddToCart = async () => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      alertError("Login diperlukan untuk berbelanja");
      return router.push("/auth/login");
    }
    
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
          product_id: product?.id, 
          quantity: 1, 
          price: Math.round(finalPrice) 
        }),
      });
      if (res.ok) {
        alertSuccess(`Berhasil! ${product.name} masuk keranjang promo.`);
      } else {
        throw new Error("Gagal menambahkan ke keranjang");
      }
    } catch (err) { 
      alertError("Terjadi kesalahan teknis"); 
    } finally { 
      setAdding(false); 
    }
  };

  if (loading || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-orange-500 font-bold uppercase tracking-widest animate-pulse">
      <Loader2 className="animate-spin mr-3" /> LOADING PROMO...
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-slate-900">
      
      {/* 🧭 NAVIGATION */}
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> KEMBALI
        </button>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">
          Marketplace <ChevronRight size={10} /> {product.jenis_barang} <ChevronRight size={10} /> Promo
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        
        {/* 📸 IMAGE SECTION (Border Hitam Khusus Disini) */}
        <section className="relative">
          <div className="aspect-square bg-white rounded-[2.5rem] overflow-hidden relative border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group">
            <img 
              src={getImageUrl(product.img_urls || product.img_url)} 
              alt={product.name} 
              className="w-full h-full object-contain p-8 md:p-12 group-hover:scale-110 transition-transform duration-700 ease-in-out" 
            />
            
            {/* Promo Label melayang */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="bg-red-600 text-white px-5 py-2 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                <Flame size={16} fill="currentColor" />
                <span className="font-black text-[10px] uppercase tracking-tighter">HEMAT {discountPercent}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* 📝 INFO SECTION */}
        <section className="flex flex-col gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.3em] italic">{product.jenis_barang}</span>
              <span className="w-1.5 h-1.5 bg-orange-100 rounded-full"></span>
              <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] italic">Hot Promo</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[0.95] uppercase italic">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <span className="text-slate-300 font-bold text-[10px] uppercase tracking-widest italic">(PROMO AKTIF)</span>
            </div>
          </div>

          {/* Harga Area */}
          <div className="bg-slate-50/80 p-8 rounded-4xl flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="text-red-500" size={14} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Flash Sale Price</p>
            </div>
            <div className="flex flex-wrap items-baseline gap-5">
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic">
                Rp {Math.round(finalPrice).toLocaleString("id-ID")}
              </h2>
              <span className="text-xl md:text-2xl text-slate-300 line-through font-black italic opacity-50 decoration-red-500">
                Rp {originalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="p-3 bg-orange-50 rounded-xl text-orange-500"><Package size={20} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock</p>
                <p className="text-lg font-black">{product.stock} UNIT</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><ShieldCheck size={20} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-lg font-black uppercase text-blue-600">ORIGINAL</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-1 bg-orange-500 rounded-full"></div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Technical Specs</h3>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed italic text-base md:text-lg">
              "{product.description || "Dapatkan suku cadang berkualitas tinggi ini dengan potongan harga spesial. Stok terbatas, jangan sampai kehabisan!"}"
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-6">
            <button 
              onClick={handleAddToCart}
              disabled={adding || product.stock <= 0}
              className="w-full bg-[#234C6A] hover:bg-orange-600 text-white py-6 md:py-8 rounded-4xl font-black uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 group"
            >
              {adding ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform" /> 
                  {product.stock > 0 ? "AMBIL PROMO" : "HABIS TERJUAL"}
                </>
              )}
            </button>
          </div>

          {/* Badges Bawah */}
          <div className="flex items-center justify-center gap-8 py-6">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">
                <CheckCircle2 size={16} className="text-teal-500" /> Fast Shipping
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">
                <Clock size={16} /> 24h Support
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}