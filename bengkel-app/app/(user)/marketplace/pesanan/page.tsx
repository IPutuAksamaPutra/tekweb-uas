"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  Truck, 
  CheckCircle, 
  Package, 
  Calendar, 
  ChevronRight, 
  ShoppingBag, 
  Loader2, 
  ArrowLeft,
  ShoppingCart 
} from "lucide-react";
import { alertError } from "@/components/Alert";
import { useRouter } from "next/navigation";

/* ======================= TYPES ======================= */
interface Order {
  id: number;
  items: {
    product_id: number;
    quantity: number;
    subtotal: number;
  }[];
  name: string;
  total: number;
  status: string;
  created_at: string;
}

interface ProductDetailMap {
  [key: number]: {
    name: string;
    image: string | null;
  };
}

const BASE_URL = "https://tekweb-uas-production.up.railway.app";

export default function PesananPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDetailMap>({});
  const [loading, setLoading] = useState(true);
  const [isMount, setIsMount] = useState(false);

  const getCookie = useCallback((name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }, []);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      const productList = data.products || data.data || [];

      const map: ProductDetailMap = {};
      productList.forEach((p: any) => {
        let finalImg = null;
        const rawImg = Array.isArray(p.img_url) && p.img_url.length > 0
          ? p.img_url[0]
          : (p.img_urls && p.img_urls.length > 0 ? p.img_urls[0] : (p.img_url || null));
        
        if (rawImg) {
          if (rawImg.startsWith('http')) {
            finalImg = rawImg;
          } else {
            const fileName = rawImg.split('/').pop();
            finalImg = `${BASE_URL}/storage/products/${fileName}`;
          }
        }

        map[p.id] = {
          name: p.name,
          image: finalImg
        };
      });

      setProductDetails(map);
    } catch (err) {
      console.error("Gagal memuat detail produk", err);
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      const token = getCookie("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/api/orders`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Accept": "application/json"
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Gagal mengambil data");

      const orderList = Array.isArray(data.orders) ? data.orders : [];
      setOrders(orderList.reverse()); 
      await fetchProductDetails();
    } catch (e) {
      console.error(e);
      alertError("Gagal memuat daftar pesanan!");
    } finally {
      setLoading(false);
    }
  }, [getCookie]);

  useEffect(() => {
    setIsMount(true);
    fetchOrders();
  }, [fetchOrders]);

  if (!isMount) return null;

  if (loading)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#F4F9F4]">
        <Loader2 className="animate-spin h-12 w-12 text-[#234C6A]" />
        <p className="mt-4 text-[#234C6A] font-black uppercase text-xs tracking-[0.2em] italic text-center px-4">Syncing Transactions...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F4F9F4] pb-10 md:pb-20 font-sans text-[#234C6A]">
      
      {/* 🧭 NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6 md:px-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
          <button 
            onClick={() => router.push("/marketplace")} 
            className="flex items-center gap-3 group transition-all shrink-0"
          >
            <div className="bg-[#234C6A] p-2 sm:p-2.5 rounded-xl text-white shadow-lg group-hover:bg-[#FF6D1F] transition-colors">
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </div>
            <span className="font-black text-[11px] sm:text-xs uppercase tracking-widest text-[#234C6A] hidden xs:block">Kembali</span>
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-100">
              <ShoppingCart size={16} className="text-[#234C6A]" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">History</span>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#234C6A]/5 border border-[#234C6A]/10 hidden sm:block" />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-12 space-y-8 md:space-y-12">

        {/* 🏷️ TITLE SECTION */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-black tracking-tighter uppercase italic leading-none">
            Riwayat <span className="text-[#FF6D1F]">Pesanan</span>
          </h1>
          <div className="h-1 sm:h-1.5 w-16 sm:w-24 bg-[#234C6A] mx-auto rounded-full" />
          <p className="text-gray-400 font-bold uppercase text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] italic px-4">
            Monitoring purchase logs & genuine parts delivery
          </p>
        </div>

        {/* 📦 LIST PESANAN */}
        <div className="space-y-6 sm:space-y-8">
          {orders.length > 0 ? (
            orders.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xlounded-[2.5rem] border border-gray-100 shadow-xl shadow-[#234C6A]/5 overflow-hidden transition-all duration-500 hover:shadow-[#234C6A]/10 group"
              >
                {/* 💳 CARD HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 sm:px-8 sm:py-5 bg-slate-50 border-b border-gray-100 gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm text-[#234C6A] border border-gray-50">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Invoice Date</p>
                      <p className="font-black text-black text-xs sm:text-sm uppercase italic">
                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic border self-end sm:self-auto
                    ${item.status === "completed" 
                      ? "bg-green-50 text-green-600 border-green-100" 
                      : "bg-orange-50 text-orange-600 border-orange-100"}
                  `}>
                    {item.status === "completed" ? <CheckCircle size={12} /> : <Truck size={12} className="animate-pulse" />}
                    {item.status === "completed" ? "Selesai" : "Proses"}
                  </div>
                </div>

                {/* 🛒 CARD BODY */}
                <div className="px-6 py-6 sm:px-8 sm:py-8">
                  <div className="space-y-4 sm:space-y-6">
                    {item.items.map((i, idx) => (
                      <div key={idx} className="flex items-center gap-4 sm:gap-6 group/item">
                        {/* PRODUCT THUMBNAIL */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center p-2 relative group-hover/item:border-[#FF6D1F] transition-colors">
                          {productDetails[i.product_id]?.image ? (
                            <img
                              src={productDetails[i.product_id].image as string}
                              className="max-w-full max-h-full object-contain group-hover/item:scale-110 transition-transform duration-500"
                              alt="Item"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/no-image.png"; }}
                            />
                          ) : (
                            <Package size={20} className="text-gray-200" />
                          )}
                        </div>

                        {/* PRODUCT INFO */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-[#234C6A] uppercase text-sm sm:text-base leading-tight tracking-tight italic truncate">
                            {productDetails[i.product_id]?.name || `Sparepart #${i.product_id}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1 sm:mt-2">
                            <span className="text-[8px] sm:text-[9px] font-black text-white bg-[#234C6A] px-2 py-0.5 rounded-md italic shrink-0">
                              {i.quantity} UNIT
                            </span>
                            <span className="text-[8px] sm:text-[9px] font-black text-gray-300 uppercase tracking-widest hidden xs:block">
                              GENUINE COMPONENT
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 💰 CARD FOOTER */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-gray-100 mt-6 sm:mt-8 pt-6 sm:pt-8">
                    <div className="text-center sm:text-left">
                      <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5 italic leading-none">Total Tagihan</p>
                      <p className="text-2xl sm:text-4xl font-black text-black tracking-tighter italic">
                        Rp {item.total.toLocaleString("id-ID")}
                      </p>
                    </div>
                    
                    <Link
                      href={`/marketplace/pesanan/${item.id}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl bg-[#234C6A] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest
                                 hover:bg-[#FF6D1F] transition-all transform active:scale-95 shadow-md italic"
                    >
                      DETAIL PESANAN <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* 🚫 EMPTY STATE */
            <div className="bg-white rounded-4xl sm:rounded-[3rem] p-12 sm:p-24 text-center border-2 border-dashed border-gray-100 shadow-xl mx-4 sm:mx-0">
              <div className="bg-[#F4F9F4] w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShoppingBag size={40} className="text-gray-200" />
              </div>
              <h3 className="text-xl sm:text-3xl font-black text-[#234C6A] uppercase italic leading-tight">Belum Ada Pesanan</h3>
              <p className="text-gray-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-3 max-w-xs mx-auto leading-relaxed italic">
                Cari komponen impianmu sekarang di toko kami.
              </p>
              <Link 
                href="/marketplace" 
                className="inline-block mt-8 sm:mt-10 px-8 py-4 bg-[#FF6D1F] text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95 italic text-[10px] sm:text-xs"
              >
                Mulai Belanja
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}