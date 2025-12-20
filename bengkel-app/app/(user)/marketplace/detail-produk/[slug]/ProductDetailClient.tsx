"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Loader2, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

export default function ProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMount, setIsMount] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  // 1. Hydration Guard: Memastikan render sinkron antara server dan browser
  useEffect(() => {
    setIsMount(true);
  }, []);

  // 2. Fetch Detail Produk berdasarkan Slug
  useEffect(() => {
    if (!slug || !isMount) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/slug/${slug}`);
        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();
        
        // Normalisasi data: Menangani berbagai kemungkinan struktur response Laravel
        const result = data.product || data.data || data;
        setProduct(result);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug, isMount]);

  // 3. Fetch Review (Hanya jika ID produk sudah tersedia)
  useEffect(() => {
    if (!product?.id) return;

    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
      })
      .catch(console.error);
  }, [product?.id]);

  /* ================= HELPERS ================= */
  const getImageUrl = (index: number) => {
    const urls = product?.img_urls || product?.image_urls || [];
    const img = urls[index];
    if (!img) return "https://placehold.co/600x600?text=No+Image";
    if (img.startsWith("http")) return img;
    
    // Pembersihan path untuk symbolic link Railway
    const fileName = img.replace("public/products/", "").replace("products/", "");
    return `${BASE_URL}/storage/products/${fileName}`;
  };

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
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          price: product.price,
        }),
      });
      if (res.ok) alertSuccess("Berhasil masuk keranjang");
      else throw new Error();
    } catch {
      alertError("Gagal menambahkan ke keranjang");
    } finally {
      setLoadingCart(false);
    }
  };

  if (!isMount) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={40} />
        <p className="font-black text-[#234C6A] uppercase text-xs tracking-widest">Sinkronisasi Data Produk...</p>
      </div>
    );
  }

  if (!product) return <div className="p-20 text-center font-black uppercase text-gray-400">Produk tidak ditemukan</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 font-black text-[#234C6A] hover:text-[#FF6D1F] transition-colors uppercase text-xs tracking-widest">
          <ArrowLeft size={18} /> Kembali ke Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* IMAGE SECTION */}
          <div className="relative bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden h-[500px] flex items-center justify-center shadow-blue-900/5">
            <img 
              src={getImageUrl(currentImgIndex)} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain p-8" 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = `${BASE_URL}/storage/products/default.png`; }}
            />
            
            {(product.img_urls?.length > 1 || product.image_urls?.length > 1) && (
              <>
                <button 
                  onClick={() => setCurrentImgIndex((i) => (i - 1 + (product.img_urls?.length || 1)) % (product.img_urls?.length || 1))} 
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-[#FF6D1F] hover:text-white transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCurrentImgIndex((i) => (i + 1) % (product.img_urls?.length || 1))} 
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-[#FF6D1F] hover:text-white transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="space-y-8">
            <div className="space-y-4">
               <span className="inline-block bg-[#234C6A] text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  {product.jenis_barang}
               </span>
               <h1 className="text-5xl font-black leading-[1.1] text-slate-900 tracking-tighter">{product.name}</h1>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5">
              <p className="text-6xl font-black text-[#FF6D1F] tracking-tighter">
                Rp {Number(product.price).toLocaleString("id-ID")}
              </p>
              <div className="mt-4 flex items-center gap-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest border-t border-gray-50 pt-4">
                <span>Stok: {product.stock} Unit</span>
                <div className="w-1 h-1 bg-gray-200 rounded-full" />
                <span>ID: #{product.id}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100">
               <h3 className="font-black mb-3 uppercase text-[10px] text-gray-400 tracking-widest">Deskripsi Detail</h3>
               <p className="text-gray-600 leading-relaxed font-medium">{product.description || "Tidak ada deskripsi."}</p>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={loadingCart || product.stock === 0}
              className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white py-6 rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
            >
              {loadingCart ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={20} /> Masukkan Keranjang</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}