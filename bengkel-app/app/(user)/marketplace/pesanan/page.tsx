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

interface ProductImageMap {
  [key: number]: string | null;
}

const BASE_URL = "https://tekweb-uas-production.up.railway.app";

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productImages, setProductImages] = useState<ProductImageMap>({});
  const [loading, setLoading] = useState(true);
  const [isMount, setIsMount] = useState(false);

  // Helper baca cookie yang aman untuk SSR
  const getCookie = useCallback((name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }, []);

  // ================= FETCH PRODUCT IMAGES =================
  const fetchProductImages = async (ordersData: Order[]) => {
    try {
      const productIds = Array.from(
        new Set(ordersData.flatMap((o) => o.items.map((i) => i.product_id)))
      );

      if (productIds.length === 0) return;

      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      const productList = data.products || data.data || [];

      const map: ProductImageMap = {};
      productList.forEach((p: any) => {
        // Ambil data gambar dari img_url (sesuai data Busi Motor kamu) atau img_urls
        const rawImg = Array.isArray(p.img_url) && p.img_url.length > 0
          ? p.img_url[0]
          : (p.img_urls && p.img_urls.length > 0 ? p.img_urls[0] : (p.img_url || null));
        
        if (rawImg) {
          if (rawImg.startsWith('http')) {
            map[p.id] = rawImg;
          } else {
            // Bersihkan path untuk Railway Storage
            const fileName = rawImg.replace('public/products/', '').replace('products/', '');
            map[p.id] = `${BASE_URL}/storage/products/${fileName}`;
          }
        } else {
          map[p.id] = null;
        }
      });

      setProductImages(map);
    } catch (err) {
      console.error("Gagal memuat gambar produk", err);
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
      setOrders(orderList.reverse()); // Terbaru di atas
      await fetchProductImages(orderList);
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
        <p className="mt-4 text-[#234C6A] font-black uppercase text-xs tracking-widest">Sinkronisasi Riwayat...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* TITLE */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-[#234C6A] tracking-tighter uppercase">
            Pesanan Saya 🛍️
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mx-auto">
            Pantau status pengiriman dan riwayat belanja kamu.
          </p>
        </div>

        {/* LIST PESANAN */}
        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:shadow-orange-900/5 transition-all duration-500 group overflow-hidden"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center px-8 py-5 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-gray-400">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                        Waktu Transaksi
                      </p>
                      <p className="font-black text-[#234C6A] text-sm uppercase">
                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest
                    ${item.status === "completed" ? "bg-green-50 text-green-600 border border-green-100" : "bg-orange-50 text-orange-600 border border-orange-100"}
                  `}>
                    {item.status === "completed" ? <CheckCircle size={14} /> : <Truck size={14} className="animate-bounce" />}
                    {item.status === "completed" ? "Selesai" : "Diproses"}
                  </div>
                </div>

                {/* BODY */}
                <div className="px-8 py-8">
                  <div className="space-y-5 mb-8">
                    {item.items.map((i, idx) => (
                      <div key={idx} className="flex items-center gap-5 group/item">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border-2 border-transparent group-hover/item:border-[#FF6D1F] transition-all shrink-0 shadow-inner flex items-center justify-center p-2">
                          {productImages[i.product_id] ? (
                            <img
                              src={productImages[i.product_id] as string}
                              className="max-w-full max-h-full object-contain"
                              alt="Produk"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/200x200?text=Error"; }}
                            />
                          ) : (
                            <Package size={24} className="text-gray-200" />
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-black text-[#234C6A] uppercase text-sm tracking-tight">Produk ID #{i.product_id}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                            Jumlah: {i.quantity} Unit
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-50 pt-6">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                      <p className="text-3xl font-black text-[#FF6D1F] tracking-tighter">
                        Rp {item.total.toLocaleString("id-ID")}
                      </p>
                    </div>
                    
                    <Link
                      href={`/marketplace/pesanan/${item.id}`}
                      className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#234C6A] text-white text-xs font-black uppercase tracking-widest
                                 hover:bg-[#FF6D1F] transition-all transform active:scale-95 shadow-xl shadow-blue-900/10"
                    >
                      Detail Pesanan <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 shadow-xl shadow-blue-900/5">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBag size={48} className="text-gray-200" />
              </div>
              <h3 className="text-2xl font-black text-[#234C6A] uppercase tracking-tighter">Belum Ada Riwayat</h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-3 max-w-xs mx-auto leading-relaxed">
                Sepertinya kamu belum belanja apapun nih. Yuk cek marketplace sekarang!
              </p>
              <Link 
                href="/marketplace" 
                className="inline-block mt-10 px-10 py-4 bg-[#FF6D1F] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:scale-105 transition-transform active:scale-95"
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