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
  AlertCircle
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* =====================
    INTERFACE
===================== */
interface OrderItem {
  product_id: number;
  product_name?: string; // Tambahan untuk display nama
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  user_id: number;
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://tekweb-uas-production.up.railway.app/api";

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* =====================
      LOAD ORDERS
  ===================== */
  const loadOrders = useCallback(async () => {
    const token = getCookie("token");
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/admin/orders`, {
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      // Menangani berbagai kemungkinan key dari Laravel (orders/data)
      const rawOrders = data.orders || data.data || [];
      
      const sortedOrders = rawOrders.sort(
        (a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(sortedOrders);
    } catch {
      alertError("Gagal mengambil data pesanan");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  /* =====================
      UPDATE STATUS
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

      if (!res.ok) throw new Error();

      alertSuccess(`Order #${orderId} sekarang: ${status.toUpperCase()}`);
      loadOrders();
    } catch {
      alertError("Gagal memperbarui status");
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    setIsMount(true);
    loadOrders();
  }, [loadOrders]);

  /* =====================
      SAFE PARSE ITEMS
  ===================== */
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={48} />
        <p className="font-black italic text-[#234C6A] uppercase tracking-widest">
          Syncing Orders Data...
        </p>
      </div>
    );
  }

  const statusStyle = {
    pending: "bg-amber-500 text-white shadow-amber-200",
    processing: "bg-blue-500 text-white shadow-blue-200",
    shipped: "bg-indigo-500 text-white shadow-indigo-200",
    completed: "bg-green-500 text-white shadow-green-200",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex justify-between items-end border-b-4 border-[#234C6A] pb-6">
          <div>
            <h1 className="text-5xl font-black text-[#234C6A] uppercase italic tracking-tighter flex items-center gap-4">
              <Package className="text-[#FF6D1F]" size={48} />
              Order <span className="text-orange-500">Control</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2">
              Panel Kendali Logistik Marketplace Bengkel
            </p>
          </div>
          <div className="text-right hidden md:block">
             <p className="text-[10px] font-black text-gray-400 uppercase">Total Pesanan</p>
             <p className="text-3xl font-black text-[#234C6A]">{orders.length}</p>
          </div>
        </header>

        {/* ORDER LIST */}
        <div className="space-y-6">
          {orders.map((order) => {
            const items = parseItems(order.items);

            return (
              <div
                key={order.id}
                className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-xl overflow-hidden hover:border-orange-500 transition-all duration-300"
              >
                {/* TOP HEADER */}
                <div className="flex flex-wrap justify-between items-center px-8 py-6 border-b bg-gray-50/50">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest">INV-NO</p>
                      <h2 className="text-2xl font-black text-[#234C6A] italic">#{order.id}</h2>
                    </div>
                    <div className="h-10 w-0.5 bg-gray-200 hidden sm:block"></div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest">Waktu Transaksi</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        <CalendarClock size={14} className="text-orange-500" />
                        {new Date(order.created_at).toLocaleString("id-ID", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <span className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${statusStyle[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="p-8">
                  <div className="grid lg:grid-cols-3 gap-10">
                    {/* CUSTOMER INFO */}
                    <div className="space-y-6 lg:col-span-2">
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="flex gap-4">
                            <div className="p-4 bg-orange-50 rounded-2xl h-fit">
                              <MapPin className="text-orange-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destinasi</p>
                              <p className="font-black text-[#234C6A] uppercase text-sm">{order.name}</p>
                              <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">{order.address}</p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="p-4 bg-green-50 rounded-2xl h-fit">
                              <Phone className="text-green-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Telepon</p>
                              <p className="font-black text-[#234C6A]">{order.no_tlp || "N/A"}</p>
                            </div>
                          </div>
                       </div>

                       {/* ITEMS TABLE */}
                       <div className="bg-gray-50 rounded-3xl p-6 border-2 border-dashed border-gray-200">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-gray-400 font-black uppercase">
                                <th className="pb-4">Deskripsi Part</th>
                                <th className="pb-4 text-center">Qty</th>
                                <th className="pb-4 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="font-bold text-[#234C6A]">
                              {items.map((item, i) => (
                                <tr key={i} className="border-t border-gray-100">
                                  <td className="py-3 uppercase flex items-center gap-2">
                                    <Package size={12} className="text-orange-500" />
                                    {item.product_name || `Sparepart ID #${item.product_id}`}
                                  </td>
                                  <td className="py-3 text-center">{item.quantity}</td>
                                  <td className="py-3 text-right">Rp {item.subtotal.toLocaleString("id-ID")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                       </div>
                    </div>

                    {/* PAYMENT & ACTIONS */}
                    <div className="bg-[#234C6A] rounded-4xl p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard size={100} /></div>
                       <div className="relative z-10">
                          <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-4">Ringkasan Pembayaran</p>
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold opacity-60">Metode</span>
                             <span className="font-black uppercase italic">{order.payment}</span>
                          </div>
                          <div className="flex justify-between items-center mb-6">
                             <span className="text-xs font-bold opacity-60">Kurir</span>
                             <span className="font-black uppercase italic text-orange-400">{order.delivery}</span>
                          </div>
                          <div className="border-t border-white/10 pt-4">
                             <p className="text-[10px] font-black opacity-60 uppercase mb-1">Total Tagihan</p>
                             <p className="text-4xl font-black italic tracking-tighter text-orange-500">
                               Rp {order.total.toLocaleString("id-ID")}
                             </p>
                          </div>
                       </div>

                       <div className="mt-8 space-y-3 relative z-10">
                          {order.status === "pending" && (
                            <button onClick={() => updateStatus(order.id, "processing")} disabled={updatingId === order.id} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl">
                              {updatingId === order.id ? <Loader2 className="animate-spin" /> : <><Clock size={16} /> Proses Pesanan</>}
                            </button>
                          )}

                          {order.status === "processing" && (
                            <button onClick={() => updateStatus(order.id, "shipped")} disabled={updatingId === order.id} className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl">
                              {updatingId === order.id ? <Loader2 className="animate-spin" /> : <><Truck size={16} /> Kirim Barang</>}
                            </button>
                          )}

                          {order.status === "shipped" && (
                            <button onClick={() => updateStatus(order.id, "completed")} disabled={updatingId === order.id} className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl">
                              {updatingId === order.id ? <Loader2 className="animate-spin" /> : <><CheckCircle size={16} /> Selesaikan</>}
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
            <div className="bg-white p-20 rounded-[3rem] text-center border-4 border-dashed border-gray-100 flex flex-col items-center">
              <Package size={80} className="text-gray-200 mb-4" />
              <p className="text-xl font-black text-gray-300 uppercase italic">Belum Ada Pesanan Masuk</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}