"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Package, CheckCircle, Truck, Star, ArrowLeft, CreditCard, MapPin, Loader2 } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";
import ReviewForm from "@/components/review/ReviewForm"; 

/* ======================= TYPES ======================= */
interface Item {
  product_id: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  items: Item[];
  total: number;
  status: string;
  address?: string;
  payment?: string;
  created_at?: string;
}

interface ProductDetailMap {
  [key: number]: {
    name: string;
    image: string | null;
  };
}

const BASE_URL = "https://tekweb-uas-production.up.railway.app";

export default function DetailPesanan() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetailMap>({});
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [isMount, setIsMount] = useState(false);

  const getToken = useCallback(() => 
    typeof document !== "undefined" ? document.cookie.match(/token=([^;]+)/)?.[1] : null, 
    [] 
  );

  // Ambil data produk untuk menampilkan Nama & Gambar asli
  const fetchProductDetails = async (items: Item[]) => {
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      const productList = data.products || data.data || [];
      
      const map: ProductDetailMap = {};
      productList.forEach((p: any) => {
        if (items.some(item => item.product_id === p.id)) {
          let finalImg = null;
          const rawImg = Array.isArray(p.img_url) && p.img_url.length > 0
            ? p.img_url[0]
            : (p.img_urls && p.img_urls.length > 0 ? p.img_urls[0] : (p.img_url || null));
          
          if (rawImg) {
            const fileName = rawImg.split('/').pop();
            finalImg = `${BASE_URL}/storage/products/${fileName}`;
          }
          map[p.id] = { name: p.name, image: finalImg };
        }
      });
      setProductDetails(map);
    } catch (err) {
      console.error("Gagal memuat detail produk", err);
    }
  };

  useEffect(() => {
    setIsMount(true);
    const fetchDetail = async () => {
      const token = getToken();
      if (!token) return router.push("/auth/login");

      try {
        const res = await fetch(`${BASE_URL}/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Gagal memuat detail");

        const rawOrder = data.order || data.data;
        const parsedOrder: Order = {
          ...rawOrder,
          items: typeof rawOrder.items === 'string' ? JSON.parse(rawOrder.items) : (rawOrder.items || []),
        };

        setOrder(parsedOrder);
        await fetchProductDetails(parsedOrder.items);
      } catch (err: any) {
        alertError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, getToken, router]);

  if (!isMount) return null;

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 font-sans">
      <Loader2 className="animate-spin h-12 w-12 text-orange-500" />
      <p className="mt-4 text-[#234C6A] font-black uppercase text-xs tracking-widest italic">Syncing Invoice...</p>
    </div>
  );

  if (!order) return <p className="text-center mt-20 font-black text-gray-400 uppercase tracking-widest italic">Invoice Not Found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans text-[#0f172a]">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] text-[#234C6A] font-black uppercase tracking-widest hover:text-orange-500 transition-all w-fit italic"
        >
          <ArrowLeft size={16} /> Back to History
        </button>

        {/* --- CARD INVOICE --- */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
          <div className="px-10 py-10 border-b border-gray-50 bg-white flex flex-wrap justify-between items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-[#234C6A] tracking-tighter uppercase italic leading-none">Invoice #{order.id}</h1>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic mt-2">
                Date: {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest italic border ${order.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>
              {order.status === "completed" ? "Selesai" : "Processing"}
            </div>
          </div>

          <div className="px-10 py-8 space-y-6">
            <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] italic mb-4 flex items-center gap-2"><Package size={14}/> Item Details</h3>
            {/* PROTEKSI: Gunakan order?.items?.map agar tidak error undefined */}
            {order?.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-6 p-6 rounded-4xl border border-gray-50 hover:bg-gray-50 transition-all group">
                <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden border-2 border-gray-50 flex items-center justify-center p-2 group-hover:border-orange-500 shrink-0 shadow-inner">
                  {productDetails[item.product_id]?.image ? (
                    <img src={productDetails[item.product_id].image!} alt="Produk" className="max-w-full max-h-full object-contain" />
                  ) : <Package size={28} className="text-gray-200" />}
                </div>
                <div className="flex-1">
                  <p className="font-black text-[#234C6A] text-lg uppercase italic tracking-tight leading-tight">
                    {productDetails[item.product_id]?.name || `Sparepart #${item.product_id}`}
                  </p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Quantity: <span className="text-orange-500">{item.quantity} Unit</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 font-black uppercase italic tracking-widest">Subtotal</p>
                  <p className="font-black text-[#234C6A] text-xl italic tracking-tighter">Rp {(Number(item.subtotal) || 0).toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-10 py-12 bg-[#234C6A] flex justify-between items-center text-white">
            <span className="font-black uppercase tracking-[0.3em] text-[10px] text-white/40 italic">Amount Paid</span>
            <span className="text-5xl font-black text-orange-500 tracking-tighter italic">Rp {(Number(order.total) || 0).toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* --- SECTION ULASAN --- */}
        {order.status === "completed" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {!showReview ? (
              <button 
                onClick={() => setShowReview(true)} 
                className="w-full bg-white border-4 border-dashed border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white px-10 py-8 rounded-4xl font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
              >
                <Star size={24} className="fill-current" /> Rate Your Experience
              </button>
            ) : (
              <div className="bg-white rounded-[2.5rem] border-2 border-orange-500/10 shadow-2xl p-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-[#234C6A] uppercase italic">Review Parts</h3>
                  <button onClick={() => setShowReview(false)} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase italic transition-all border-b-2 border-transparent hover:border-red-500">Cancel</button>
                </div>

                {/* 🔥 PANGGIL COMPONENT REVIEW FORM DENGAN PROTEKSI DATA */}
                <ReviewForm 
                  orderId={order.id} 
                  items={order.items || []} 
                  onSuccess={() => {
                    setShowReview(false);
                    alertSuccess("Ulasan terkirim!");
                  }} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}