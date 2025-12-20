"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Package, CheckCircle, Truck, Star, ArrowLeft, CreditCard, MapPin, Loader2 } from "lucide-react";
import ReviewForm from "@/components/review/ReviewForm";
import { alertSuccess, alertError } from "@/components/Alert";

/* ======================= TYPES ======================= */
interface Item {
  product_id: number;
  quantity: number;
  subtotal: number;
  product_name?: string; 
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

interface ProductImageMap {
  [key: number]: string | null;
}

const BASE_URL = "https://tekweb-uas-production.up.railway.app";

export default function DetailPesanan() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [productImages, setProductImages] = useState<ProductImageMap>({});
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMount, setIsMount] = useState(false);

  const getToken = useCallback(() => 
    typeof document !== "undefined" ? document.cookie.match(/token=([^;]+)/)?.[1] : null, 
  []);

  // ================= FETCH PRODUCT IMAGES (OPTIMIZED) =================
  const fetchProductImages = async (items: Item[]) => {
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      
      const map: ProductImageMap = {};
      const productList = data.products || data.data || [];
      
      productList.forEach((p: any) => {
        if (items.some(item => item.product_id === p.id)) {
          // Menyesuaikan field gambar sesuai data backend kamu (img_url atau img_urls)
          const rawImg = Array.isArray(p.img_url) && p.img_url.length > 0
            ? p.img_url[0]
            : (p.img_urls && p.img_urls.length > 0 ? p.img_urls[0] : (p.img_url || null));
          
          if (rawImg) {
            if (rawImg.startsWith('http')) {
              map[p.id] = rawImg;
            } else {
              // Bersihkan path untuk Railway Storage agar tidak 404
              const fileName = rawImg.replace('public/products/', '').replace('products/', '');
              map[p.id] = `${BASE_URL}/storage/products/${fileName}`;
            }
          } else {
            map[p.id] = null;
          }
        }
      });
      setProductImages(map);
    } catch (err) {
      console.error("Gagal memuat gambar produk", err);
    }
  };

  // ================= FETCH DETAIL ORDER =================
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

        const parsedOrder: Order = {
          ...data.order,
          items: typeof data.order.items === 'string' ? JSON.parse(data.order.items) : data.order.items,
        };

        setOrder(parsedOrder);
        await fetchProductImages(parsedOrder.items);
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <Loader2 className="animate-spin h-12 w-12 text-[#FF6D1F]" />
      <p className="mt-4 text-[#234C6A] font-black uppercase text-xs tracking-widest">Memuat Invoice...</p>
    </div>
  );

  if (!order) return <p className="mt-20 text-center font-black text-gray-400 uppercase">Pesanan tidak ditemukan.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] text-[#234C6A] font-black uppercase tracking-widest hover:text-[#FF6D1F] transition-all w-fit"
        >
          <ArrowLeft size={16} /> Kembali ke Riwayat
        </button>

        {/* MAIN CARD */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="px-10 py-8 border-b border-gray-50 bg-white flex flex-wrap justify-between items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#234C6A] tracking-tighter uppercase">Invoice #{order.id}</h1>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                Dipesan: {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </p>
            </div>

            <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border
              ${order.status === "completed" ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-[#FF6D1F] border-orange-100"}
            `}>
              {order.status === "completed" ? <CheckCircle size={16} /> : <Truck size={16} className="animate-bounce" />}
              {order.status === "completed" ? "Selesai" : "Diproses"}
            </div>
          </div>

          {/* PRODUCT ITEMS */}
          <div className="px-10 py-8 space-y-6">
            <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Rincian Produk
            </h3>
            
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-6 p-5 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-all group">
                {/* PRODUCT IMAGE */}
                <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden border-2 border-gray-50 shadow-inner shrink-0 flex items-center justify-center p-2 group-hover:border-[#FF6D1F] transition-colors">
                  {productImages[item.product_id] ? (
                    <img
                      src={productImages[item.product_id]!}
                      alt="Produk"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/200x200?text=Error"; }}
                    />
                  ) : (
                    <Package size={28} className="text-gray-200" />
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1">
                  <p className="font-black text-[#234C6A] text-lg uppercase tracking-tight">
                    {item.product_name || `Produk ID: #${item.product_id}`}
                  </p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    Kuantitas: <span className="text-[#FF6D1F]">{item.quantity} Unit</span>
                  </p>
                </div>

                {/* PRICE */}
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Subtotal</p>
                  <p className="font-black text-[#234C6A] text-lg">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* PAYMENT & ADDRESS INFO */}
          <div className="grid md:grid-cols-2 border-t border-gray-50 bg-gray-50/30">
            <div className="p-10 border-b md:border-b-0 md:border-r border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={14} className="text-[#FF6D1F]"/> Lokasi Pengiriman
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-bold uppercase tracking-tight">
                {order.address || "Alamat tidak tersedia"}
              </p>
            </div>
            <div className="p-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard size={14} className="text-[#FF6D1F]"/> Metode Pembayaran
              </p>
              <p className="text-xs text-[#234C6A] font-black uppercase tracking-widest">
                {order.payment || "Transfer Bank / Manual"}
              </p>
            </div>
          </div>

          {/* TOTAL FOOTER */}
          <div className="px-10 py-10 bg-[#234C6A] flex justify-between items-center">
            <span className="font-black text-white/50 uppercase tracking-[0.2em] text-[10px]">Total Dibayarkan</span>
            <span className="text-4xl font-black text-[#FF6D1F] tracking-tighter">
              Rp {order.total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* REVIEW SECTION */}
        {order.status === "completed" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {!showReview ? (
              <button
                onClick={() => setShowReview(true)}
                className="w-full bg-white border-4 border-dashed border-[#FF6D1F]/30 text-[#FF6D1F] hover:bg-[#FF6D1F] hover:text-white hover:border-[#FF6D1F] 
                           px-10 py-6 rounded-4xl font-black transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 uppercase tracking-widest text-sm"
              >
                <Star size={24} className="fill-current" /> BERIKAN ULASAN PRODUK
              </button>
            ) : (
              <div className="bg-white rounded-[2.5rem] border-2 border-[#FF6D1F]/10 shadow-2xl p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-[#234C6A] uppercase tracking-tighter">Kepuasan Pelanggan</h3>
                  <button onClick={() => setShowReview(false)} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest">Batal</button>
                </div>
                <ReviewForm
                  orderId={order.id}
                  items={order.items}
                  onSuccess={() => {
                    setShowReview(false);
                    alertSuccess("Terima kasih atas ulasan Anda!");
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