"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Loader2, Flame, Tag, Package, CheckCircle2 } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

export default function ProductDetailPromoClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const BASE_URL = "https://tekweb-uas-production.up.railway.app";
  const API_URL = `${BASE_URL}/api`;

  // 🚀 LOGIKA IMAGE SAMA PERSIS DENGAN MARKETPLACE
  const getImageUrl = (imgData?: string[] | string) => {
    const img = Array.isArray(imgData) ? imgData[0] : imgData;
    if (!img) return "/no-image.png";
    if (img.startsWith("http")) return img;
    const clean = img.replace("public/products/", "").replace("products/", "").replace("public/", "");
    return `${BASE_URL}/storage/products/${clean}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Ambil Detail Produk
      const resP = await fetch(`${API_URL}/products/slug/${slug}`, { cache: "no-store" });
      const jsonP = await resP.json();
      const pData = jsonP.product;

      // 2. Ambil List Promo untuk Mencocokkan Diskon
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
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Kalkulasi Harga Real-time
  const originalPrice = product ? Number(product.price) : 0;
  const discount = promo ? (promo.discount_type === 'percentage' ? originalPrice * (promo.discount_value/100) : promo.discount_value) : 0;
  const finalPrice = originalPrice - discount;

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
    <div className="min-h-screen flex items-center justify-center font-black text-orange-500 animate-pulse italic text-2xl">
      MENYIAPKAN HARGA PROMO...
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50/30 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 mb-10 font-black text-orange-400 uppercase text-[10px] italic tracking-widest hover:text-orange-600 transition-colors"
        >
          <ArrowLeft size={16} /> KEMBALI KE MARKETPLACE
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* IMAGE SECTION */}
          <div className="relative aspect-square bg-white rounded-[3rem] overflow-hidden shadow-2xl border-8 border-orange-500 group">
            <img 
              src={getImageUrl(product.img_urls || product.img_url)} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute top-6 right-6 bg-red-600 text-white p-6 rounded-full rotate-12 flex flex-col items-center shadow-xl border-4 border-white animate-bounce">
              <Flame size={24} fill="currentColor" />
              <span className="font-black text-xs">SALE</span>
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic shadow-lg">
                  {product.jenis_barang}
                </span>
                <span className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic shadow-lg flex items-center gap-1">
                  <Flame size={10} fill="currentColor"/> Hot Deal
                </span>
              </div>
              <h1 className="text-6xl font-black uppercase italic text-orange-600 leading-none tracking-tighter">
                {product.name}
              </h1>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-orange-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Tag size={100} />
              </div>
              <p className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-2 mb-2 italic tracking-widest">
                <Tag size={12} fill="currentColor"/> PENAWARAN TERBATAS
              </p>
              <div className="flex items-baseline gap-4 relative z-10">
                <h2 className="text-6xl font-black text-orange-500 tracking-tighter italic">
                  Rp {Math.round(finalPrice).toLocaleString("id-ID")}
                </h2>
                <span className="text-xl text-slate-300 line-through font-bold italic">
                  Rp {originalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 p-4 rounded-2xl flex items-center gap-3 border border-orange-100 text-orange-600">
                <Package size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Stok: {product.stock}</span>
              </div>
              <div className="bg-white/50 p-4 rounded-2xl flex items-center gap-3 border border-orange-100 text-orange-600">
                <CheckCircle2 size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Original Part</span>
              </div>
            </div>

            <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-orange-200 pl-6">
              "{product.description || "Dapatkan suku cadang berkualitas tinggi ini dengan potongan harga spesial. Stok terbatas, jangan sampai kehabisan!"}"
            </p>

            <button 
              onClick={handleAddToCart}
              disabled={adding || product.stock <= 0}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 rounded-4xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 disabled:bg-slate-200"
            >
              {adding ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={24} /> 
                  {product.stock > 0 ? "AMBIL PROMO SEKARANG" : "PROMO HABIS"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}