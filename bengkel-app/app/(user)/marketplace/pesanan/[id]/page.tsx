"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Package, 
  CheckCircle, 
  Star, 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  Tag, 
  ReceiptText,
  Clock,
  ChevronRight
} from "lucide-react";
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin h-10 w-10 text-[#234C6A]" />
      <p className="mt-4 text-[#234C6A] font-bold text-sm tracking-widest uppercase italic">Syncing Invoice...</p>
    </div>
  );

  if (!order) return <p className="text-center mt-20 font-bold text-gray-400 uppercase italic">Invoice Not Found.</p>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      
      {/* --- SIMPLE TOP NAV --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#234C6A] transition-colors font-bold uppercase tracking-tighter"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
          <div className="flex items-center gap-2 text-slate-300">
             <ReceiptText size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest italic">Order Details</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        
        {/* --- CLEAN INVOICE CARD --- */}
        <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Status & ID */}
          <div className="p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1 italic">Transaction ID</p>
              <h1 className="text-3xl font-serif font-bold text-[#234C6A]">#{order.id}</h1>
              <p className="text-xs text-slate-400 mt-1 font-medium italic">
                Dipesan pada {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic border
              ${order.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
              {order.status === "completed" ? "Selesai" : "Diproses"}
            </div>
          </div>

          {/* Items List */}
          <div className="px-8 sm:px-10 py-6 border-t border-slate-50 space-y-6">
            {order?.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center p-3 shrink-0 border border-slate-100">
                  {productDetails[item.product_id]?.image ? (
                    <img src={productDetails[item.product_id].image!} alt="item" className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105" />
                  ) : <Package size={24} className="text-slate-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#234C6A] text-base leading-tight uppercase italic truncate">
                    {productDetails[item.product_id]?.name || `Sparepart #${item.product_id}`}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest italic">
                    {item.quantity} Unit <span className="mx-2 text-slate-200">|</span> Genuine Part
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-300 font-bold uppercase mb-1">Subtotal</p>
                  <p className="font-bold text-[#234C6A] text-lg italic tracking-tighter">
                    Rp {(Number(item.subtotal) || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total Section (Dark Style from image_5098f3.png) */}
          <div className="bg-[#0f172a] p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-center gap-4 border-t-4 border-orange-500">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic block mb-1">Amount Paid</span>
              <p className="text-slate-500 text-[9px] uppercase tracking-widest italic">Pajak & Biaya layanan termasuk</p>
            </div>
            <div className="text-center sm:text-right">
               <span className="text-4xl sm:text-6xl font-black text-[#FF6D1F] tracking-tighter italic">
                 Rp {(Number(order.total) || 0).toLocaleString("id-ID")}
               </span>
            </div>
          </div>
        </div>

        {/* --- REVIEW ACTION --- */}
        {order.status === "completed" && (
          <div className="pb-20">
            {!showReview ? (
              <button 
                onClick={() => setShowReview(true)} 
                className="w-full bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-500 px-8 py-6 rounded-2xl font-black text-xs uppercase italic tracking-widest transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
              >
                <Star size={18} fill="currentColor" /> Beri ulasan untuk produk ini
              </button>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-[#234C6A] uppercase italic">Ulasan Anda</h3>
                  <button onClick={() => setShowReview(false)} className="text-xs font-bold text-slate-300 hover:text-red-500">BATAL</button>
                </div>
                <ReviewForm 
                  orderId={order.id} 
                  items={order.items || []} 
                  onSuccess={() => { setShowReview(false); alertSuccess("Ulasan terkirim!"); }} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}