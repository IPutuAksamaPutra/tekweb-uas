"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, Truck, CheckCircle, Package, MapPin, Phone, CreditCard } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* =====================
    INTERFACE
===================== */
interface OrderItem {
  product_id: number;
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
  const [isMount, setIsMount] = useState(false); // 🔥 Untuk cegah Hydration Error

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  /* =====================
      COOKIE HELPER (SAFE)
  ===================== */
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil data");

      const data = await res.json();
      // Sorting agar order terbaru di atas
      const sortedOrders = (data.orders || []).sort((a: Order, b: Order) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setOrders(sortedOrders);
    } catch (err) {
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
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      alertSuccess(`Status Order #${orderId} berhasil diubah!`);
      loadOrders(); // Refresh data
    } catch (err) {
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
  const parseItems = (items: Order["items"]): OrderItem[] => {
    if (Array.isArray(items)) return items;
    try {
      return JSON.parse(items || "[]");
    } catch {
      return [];
    }
  };

  if (!isMount) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6D1F] border-t-transparent mb-4"></div>
        <p className="text-[#234C6A] font-bold">Sinkronisasi Data Pesanan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-[#234C6A] flex items-center gap-3 uppercase tracking-tighter">
            <Package size={36} className="text-[#FF6D1F]" /> 
            Manajemen Pesanan
          </h1>
          <p className="text-gray-500 font-medium">Pantau dan kelola seluruh transaksi marketplace</p>
        </header>

        <div className="space-y-6">
          {orders.map((order) => {
            const items = parseItems(order.items);
            const statusConfig = {
              pending: "bg-amber-100 text-amber-700 border-amber-200",
              processing: "bg-blue-100 text-blue-700 border-blue-200",
              shipped: "bg-purple-100 text-purple-700 border-purple-200",
              completed: "bg-green-100 text-green-700 border-green-200",
            };

            return (
              <div
                key={order.id}
                className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* HEADER */}
                <div className="px-8 py-5 border-b bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nomor Invoice</span>
                    <h2 className="text-xl font-black text-[#234C6A]">#{order.id}</h2>
                  </div>
                  <div className="text-right md:text-left">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Waktu Transaksi</span>
                     <p className="text-sm font-bold text-gray-600">
                        {new Date(order.created_at).toLocaleString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                     </p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${statusConfig[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="p-8">
                  {/* DETAIL GRID */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-400"><MapPin size={18}/></div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Penerima & Alamat</p>
                          <p className="font-bold text-slate-800">{order.name}</p>
                          <p className="text-sm text-gray-500 leading-relaxed">{order.address}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-400"><Phone size={18}/></div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kontak</p>
                          <p className="font-bold text-slate-800">{order.no_tlp}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-400"><CreditCard size={18}/></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metode & Pengiriman</p>
                          <div className="flex justify-between items-center border-b border-dashed pb-1">
                             <span className="text-sm font-bold text-slate-700 capitalize">{order.payment}</span>
                             <span className="text-sm font-medium text-gray-500 capitalize">{order.delivery}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                             <span className="text-sm font-black text-[#234C6A]">Total Tagihan</span>
                             <span className="text-xl font-black text-[#FF6D1F]">Rp {order.total.toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ITEMS TABLE */}
                  <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mb-8">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 text-[10px] font-black text-gray-400 uppercase">
                        <tr>
                          <th className="px-6 py-3 tracking-widest">Item</th>
                          <th className="px-6 py-3 tracking-widest text-center">Qty</th>
                          <th className="px-6 py-3 tracking-widest text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {items.map((item, i) => (
                          <tr key={i} className="hover:bg-white transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-700">Produk ID: #{item.product_id}</td>
                            <td className="px-6 py-4 text-center font-bold text-slate-600">{item.quantity}</td>
                            <td className="px-6 py-4 text-right font-black text-[#234C6A]">Rp {item.subtotal.toLocaleString("id-ID")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="flex justify-end gap-3 border-t pt-6">
                    {order.status === "pending" && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => updateStatus(order.id, "processing")}
                        className="px-8 py-3 bg-[#234C6A] hover:bg-[#1a384d] text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Clock size={16} /> Proses Pesanan
                      </button>
                    )}

                    {order.status === "processing" && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => updateStatus(order.id, "shipped")}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Truck size={16} /> Kirim Sekarang
                      </button>
                    )}

                    {order.status === "shipped" && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => updateStatus(order.id, "completed")}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <CheckCircle size={16} /> Selesaikan Order
                      </button>
                    )}

                    {order.status === "completed" && (
                      <div className="flex items-center gap-2 text-green-600 font-black uppercase text-xs tracking-widest bg-green-50 px-6 py-3 rounded-xl border border-green-100">
                        <CheckCircle size={18} /> Transaksi Selesai
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {orders.length === 0 && (
            <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm border-2 border-dashed border-gray-200">
              <Package size={64} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-400">Belum Ada Pesanan Masuk</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}