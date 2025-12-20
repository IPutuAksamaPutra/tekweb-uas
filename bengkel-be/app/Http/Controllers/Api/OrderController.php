"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Clock,
  Truck,
  CheckCircle,
  Package,
  MapPin,
  Phone,
  CreditCard,
  CalendarClock,
  Loader2,
  User as UserIcon,
  AlertCircle
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* =====================
    INTERFACE
===================== */
interface OrderItem {
  product_id: number;
  product_name?: string; // 🔥 Diambil dari hasil transform Laravel
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  user_id: number;
  user?: { name: string }; // 🔥 Relasi User
  items: OrderItem[] | string;
  name: string; 
  no_tlp: string;
  address: string;
  delivery: string;
  payment: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "completed";
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isMount, setIsMount] = useState(false);

  // Endpoint API mengarah ke Railway
  const apiUrl = "https://tekweb-uas-production.up.railway.app/api";

  const statusStyle: Record<string, string> = {
    pending: "bg-amber-500 text-white shadow-amber-200",
    processing: "bg-blue-500 text-white shadow-blue-200",
    shipped: "bg-indigo-500 text-white shadow-indigo-200",
    completed: "bg-green-500 text-white shadow-green-200",
  };

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* =====================
      LOAD DATA PESANAN
  ===================== */
  const loadOrders = useCallback(async () => {
    const token = getCookie("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Menembak route: api/admin/orders
      const res = await fetch(`${apiUrl}/admin/orders`, {
        method: "GET",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
      });

      if (res.status === 401) {
          alertError("Sesi admin berakhir. Silakan login kembali.");
          return;
      }

      if (!res.ok) throw new Error("Server bermasalah (Error 500)");

      const data = await res.json();
      const rawOrders = data.orders || data.data || [];
      
      const sortedOrders = [...rawOrders].sort(
        (a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(sortedOrders);
    } catch (err: any) {
      console.error(err);
      alertError(err.message || "Gagal mengambil data pesanan.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  /* =====================
      UPDATE STATUS PESANAN
  ===================== */
  async function updateStatus(orderId: number, status: Order["status"]) {
    const token = getCookie("token");
    if (!token) return;
    setUpdatingId(orderId);

    try {
      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status di server");

      alertSuccess(`Order #${orderId} berhasil diupdate.`);
      loadOrders(); 
    } catch (err: any) {
      alertError(err.message || "Gagal update status");
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    setIsMount(true);
    loadOrders();
  }, [loadOrders]);

  const parseItems = (items: any): OrderItem[] => {
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
        try { return JSON.parse(items); } catch { return []; }
    }
    return [];
  };

  if (!isMount) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-[#234C6A]">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={50} />
        <p className="font-black italic uppercase tracking-tighter">Syncing Logistics Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-[#234C6A] pb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-[#234C6A] uppercase italic tracking-tighter flex items-center gap-4">
              <Package className="text-[#FF6D1F]" size={40} />
              Order <span className="text-orange-500">Control</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Dashboard Pengiriman Marketplace</p>
          </div>
          <div className="text-left md:text-right">
             <p className="text-[10px] font-black text-gray-400 uppercase">Total Pesanan</p>
             <p className="text-3xl font-black text-[#234C6A]">{orders.length}</p>
          </div>
        </header>

        {/* ORDER LIST */}
        <div className="space-y-8">
          {orders.map((order) => {
            const items = parseItems(order.items);

            return (
              <div
                key={order.id}
                className="bg-white rounded-4xl border-2 border-gray-100 shadow-xl overflow-hidden hover:border-orange-500 transition-all duration-300"
              >
                {/* TOP HEADER */}
                <div className="flex flex-wrap justify-between items-center px-6 md:px-8 py-6 border-b bg-gray-50/50 gap-4">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div>
                      <p className="text-[9px] uppercase font-black text-gray-400">INV-NO</p>
                      <h2 className="text-xl md:text-2xl font-black text-[#234C6A] italic">#{order.id}</h2>
                    </div>
                    <div className="h-10 w-0.5 bg-gray-200 hidden sm:block"></div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-gray-400">Nama Pembeli</p>
                      <div className="flex items-center gap-2 text-xs md:text-sm font-black text-[#FF6D1F] uppercase italic">
                        <UserIcon size={14} />
                        {/* Menampilkan Nama User dari Tabel User */}
                        {order.user?.name || "Member Bengkel"}
                      </div>
                    </div>
                  </div>

                  <span className={`px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${statusStyle[order.status] || "bg-gray-500"}`}>
                    {order.status}
                  </span>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid lg:grid-cols-3 gap-8 md:gap-10">
                    
                    {/* INFO PENERIMA & ITEMS */}
                    <div className="space-y-6 lg:col-span-2">
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="flex gap-4">
                            <div className="p-4 bg-orange-50 rounded-2xl h-fit shadow-sm"><MapPin className="text-orange-600" /></div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Penerima & Alamat</p>
                              <p className="font-black text-[#234C6A] uppercase text-sm">{order.name}</p>
                              <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">{order.address}</p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="p-4 bg-green-50 rounded-2xl h-fit shadow-sm"><Phone className="text-green-600" /></div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kontak Pelanggan</p>
                              <p className="font-black text-[#234C6A]">{order.no_tlp || "N/A"}</p>
                            </div>
                          </div>
                       </div>

                       {/* TABEL BARANG */}
                       <div className="bg-gray-50 rounded-3xl p-4 md:p-6 border-2 border-dashed border-gray-200">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-left text-gray-400 font-black uppercase">
                                  <th className="pb-4">Nama Barang (Sparepart)</th>
                                  <th className="pb-4 text-center">Qty</th>
                                  <th className="pb-4 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="font-bold text-[#234C6A]">
                                {items.map((item, i) => (
                                  <tr key={i} className="border-t border-gray-200">
                                    <td className="py-3 uppercase flex items-center gap-2">
                                      <Package size={12} className="text-orange-500 shrink-0" />
                                      {/* Tampilkan product_name hasil suntikan Laravel */}
                                      <span className="font-black">
                                        {item.product_name || `Produk ID #${item.product_id}`}
                                      </span>
                                    </td>
                                    <td className="py-3 text-center">{item.quantity}</td>
                                    <td className="py-3 text-right whitespace-nowrap">Rp {Number(item.subtotal).toLocaleString("id-ID")}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                       </div>
                    </div>

                    {/* BOX TOTAL & AKSI */}
                    <div className="bg-[#234C6A] rounded-4xl p-6 md:p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard size={100} /></div>
                       <div className="relative z-10">
                          <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-4 italic">Ringkasan Finance</p>
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold opacity-60">Metode Bayar</span>
                             <span className="font-black uppercase italic">{order.payment}</span>
                          </div>
                          <div className="flex justify-between items-center mb-6">
                             <span className="text-xs font-bold opacity-60">Ekspedisi</span>
                             <span className="font-black uppercase italic text-orange-400">{order.delivery}</span>
                          </div>
                          <div className="border-t border-white/10 pt-4">
                             <p className="text-[10px] font-black opacity-60 uppercase mb-1">Total Transaksi</p>
                             <p className="text-3xl md:text-4xl font-black italic tracking-tighter text-orange-500">
                               Rp {Number(order.total).toLocaleString("id-ID")}
                             </p>
                          </div>
                       </div>

                       <div className="mt-8 space-y-3 relative z-10">
                          {order.status === "pending" && (
                            <button onClick={() => updateStatus(order.id, "processing")} disabled={updatingId === order.id} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl">
                              {updatingId === order.id ? <Loader2 className="animate-spin" /> : "Proses Pesanan"}
                            </button>
                          )}

                          {order.status === "processing" && (
                            <button onClick={() => updateStatus(order.id, "shipped")} disabled={updatingId === order.id} className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl">
                              {updatingId === order.id ? <Loader2 className="animate-spin" /> : "Kirim Barang"}
                            </button>
                          )}

                          {order.status === "shipped" && (
                            <button onClick={() => updateStatus(order.id, "completed")} disabled={updatingId === order.id} className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl">
                              {updatingId === order.id ? <Loader2 className="animate-spin" /> : "Tandai Selesai"}
                            </button>
                          )}

                          {order.status === "completed" && (
                            <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 py-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-400 shadow-inner">
                              <CheckCircle size={16} /> Transaksi Selesai
                            </div>
                          )}
                       </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

          {orders.length === 0 && (
            <div className="bg-white p-20 rounded-4xl text-center border-4 border-dashed border-gray-100 flex flex-col items-center shadow-sm">
              <Package size={80} className="text-gray-200 mb-4" />
              <p className="text-xl font-black text-gray-300 uppercase italic tracking-tighter">Belum Ada Riwayat Pesanan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}