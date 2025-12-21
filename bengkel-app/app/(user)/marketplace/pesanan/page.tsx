"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Truck, CheckCircle, Package, Calendar, ChevronRight, ShoppingBag, Loader2 } from "lucide-react";
import { alertError } from "@/components/Alert";

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

// Map untuk menyimpan detail produk (Nama & Gambar)
interface ProductDetailMap {
  [key: number]: {
    name: string;
    image: string | null;
  };
}

const BASE_URL = "https://tekweb-uas-production.up.railway.app";

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDetailMap>({});
  const [loading, setLoading] = useState(true);
  const [isMount, setIsMount] = useState(false);

  const getCookie = useCallback((name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }, []);

  // ================= FETCH PRODUCT DETAILS (NAME & IMAGE) =================
  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      const productList = data.products || data.data || [];

      const map: ProductDetailMap = {};
      productList.forEach((p: any) => {
        // Ambil data gambar (Logic yang sama dengan Marketplace kamu)
        let finalImg = null;
        const rawImg = Array.isArray(p.img_url) && p.img_url.length > 0
          ? p.img_url[0]
          : (p.img_urls && p.img_urls.length > 0 ? p.img_urls[0] : (p.img_url || null));
        
        if (rawImg) {
          if (rawImg.startsWith('http')) {
            finalImg = rawImg;
          } else {
            const fileName = rawImg.split('/').pop(); // Ambil nama file saja agar aman
            finalImg = `${BASE_URL}/storage/products/${fileName}`;
          }
        }

        map[p.id] = {
          name: p.name, // 🔥 AMBIL NAMA PRODUK
          image: finalImg
        };
      });

      setProductDetails(map);
    } catch (err) {
      console.error("Gagal memuat detail produk", err);
    }
  };

  // ================= GET DATA ORDER =================
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
      
      // Ambil detail produk setelah dapet list order
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
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-[#FF6D1F]" />
        <p className="mt-4 text-[#234C6A] font-black uppercase text-xs tracking-widest italic">Syncing History...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* TITLE */}
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-black text-[#234C6A] tracking-tighter uppercase italic">
            Pesanan <span className="text-[#FF6D1F]">Saya</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">
            Pantau status komponen racing yang kamu beli.
          </p>
        </div>

        {/* LIST PESANAN */}
        <div className="space-y-8">
          {orders.length > 0 ? (
            orders.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 group overflow-hidden transition-all duration-300 hover:border-[#FF6D1F]/30"
              >
                {/* HEADER CARD */}
                <div className="flex justify-between items-center px-10 py-6 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center gap-5">
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-[#FF6D1F]">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoice Date</p>
                      <p className="font-black text-[#234C6A] text-sm uppercase italic">
                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest italic
                    ${item.status === "completed" ? "bg-green-50 text-green-600 border border-green-100" : "bg-orange-50 text-orange-600 border border-orange-100"}
                  `}>
                    {item.status === "completed" ? <CheckCircle size={14} /> : <Truck size={14} className="animate-pulse" />}
                    {item.status === "completed" ? "Selesai" : "In Transit"}
                  </div>
                </div>

                {/* BODY CARD */}
                <div className="px-10 py-8">
                  <div className="space-y-6 mb-10">
                    {item.items.map((i, idx) => (
                      <div key={idx} className="flex items-center gap-6 group/item">
                        {/* PRODUCT IMAGE */}
                        <div className="w-24 h-24 bg-gray-50 rounded-3xl overflow-hidden border-2 border-transparent group-hover/item:border-[#FF6D1F] transition-all shrink-0 shadow-inner flex items-center justify-center p-3">
                          {productDetails[i.product_id]?.image ? (
                            <img
                              src={productDetails[i.product_id].image as string}
                              className="max-w-full max-h-full object-contain"
                              alt="Produk"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/no-image.png"; }}
                            />
                          ) : (
                            <Package size={28} className="text-gray-200" />
                          )}
                        </div>

                        {/* PRODUCT INFO */}
                        <div className="flex-1">
                          <p className="font-black text-[#234C6A] uppercase text-lg leading-none tracking-tight italic">
                            {/* 🔥 DISINI NAMA PRODUK MUNCUL */}
                            {productDetails[i.product_id]?.name || `Sparepart #${i.product_id}`}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-[10px] font-black text-white bg-[#234C6A] px-3 py-1 rounded-lg italic">
                              {i.quantity} UNIT
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              Genuine Parts
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER CARD */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-100 pt-8">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Total Transaction</p>
                      <p className="text-4xl font-black text-[#234C6A] tracking-tighter italic">
                        Rp {item.total.toLocaleString("id-ID")}
                      </p>
                    </div>
                    
                    <Link
                      href={`/marketplace/pesanan/${item.id}`}
                      className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-3xl bg-[#234C6A] text-white text-xs font-black uppercase tracking-widest
                                 hover:bg-[#FF6D1F] transition-all transform active:scale-95 shadow-xl shadow-blue-900/10 italic"
                    >
                      Cek Detail <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* EMPTY STATE */
            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 shadow-xl">
              <div className="bg-gray-50 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBag size={56} className="text-gray-200" />
              </div>
              <h3 className="text-3xl font-black text-[#234C6A] uppercase italic">Garasi Kosong</h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-4 max-w-xs mx-auto leading-relaxed italic">
                Kamu belum memesan sparepart apapun. Yuk upgrade performa kendaraanmu!
              </p>
              <Link 
                href="/marketplace" 
                className="inline-block mt-12 px-12 py-5 bg-[#FF6D1F] text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95 italic"
              >
                Gas ke Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}