"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Truck, CheckCircle, Package, Calendar, ChevronRight, ShoppingBag } from "lucide-react";
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
      // Ambil ID produk unik dari semua pesanan
      const productIds = Array.from(
        new Set(ordersData.flatMap((o) => o.items.map((i) => i.product_id)))
      );

      if (productIds.length === 0) return;

      const res = await fetch("https://tekweb-uas-production.up.railway.app/api/products");
      const data = await res.json();
      const productList = data.products || data.data || [];

      const map: ProductImageMap = {};
      productList.forEach((p: any) => {
        const img = Array.isArray(p.img_urls) && p.img_urls.length > 0
          ? p.img_urls[0]
          : (p.img_url || null);
        
        map[p.id] = img ? (img.startsWith('http') ? img : `https://tekweb-uas-production.up.railway.app/images/${img}`) : null;
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

      const res = await fetch("https://tekweb-uas-production.up.railway.app/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Gagal mengambil data");

      // Pastikan data yang di-set adalah array
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
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#FF6D1F] border-t-transparent"></div>
        <p className="mt-4 text-gray-500 font-medium">Memuat riwayat pesanan...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* TITLE */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-[#234C6A] tracking-tight">
            Pesanan Saya 🛍️
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Pantau status pengiriman dan riwayat belanja kamu di sini.
          </p>
        </div>

        {/* LIST PESANAN */}
        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50/50 border-b">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <Calendar size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                        Tanggal Transaksi
                      </p>
                      <p className="font-bold text-slate-700">
                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter
                    ${item.status === "completed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
                  `}>
                    {item.status === "completed" ? <CheckCircle size={14} /> : <Truck size={14} />}
                    {item.status === "completed" ? "Selesai" : "Diproses"}
                  </div>
                </div>

                {/* BODY */}
                <div className="px-6 py-6">
                  <div className="space-y-4 mb-6">
                    {item.items.map((i, idx) => (
                      <div key={idx} className="flex items-center gap-4 group/item">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border-2 border-transparent group-hover/item:border-[#FF6D1F] transition-all shrink-0">
                          {productImages[i.product_id] ? (
                            <img
                              src={productImages[i.product_id] as string}
                              className="w-full h-full object-cover"
                              alt="Produk"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 font-bold uppercase p-2 text-center">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-bold text-slate-800">Produk ID #{i.product_id}</p>
                          <p className="text-sm text-gray-400 font-medium">
                            {i.quantity} Barang
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-end border-t pt-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Belanja</p>
                      <p className="text-2xl font-black text-[#FF6D1F]">
                        Rp {item.total.toLocaleString("id-ID")}
                      </p>
                    </div>
                    
                    <Link
                      href={`/marketplace/pesanan/${item.id}`}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#234C6A] text-white text-sm font-bold
                                 hover:bg-[#FF6D1F] transition-all transform active:scale-95 shadow-lg shadow-blue-900/10"
                    >
                      Lihat Detail <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Belum Ada Pesanan</h3>
              <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                Sepertinya kamu belum belanja apapun nih. Yuk cek marketplace!
              </p>
              <Link 
                href="/marketplace" 
                className="inline-block mt-8 px-8 py-3 bg-[#FF6D1F] text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:scale-105 transition-transform"
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