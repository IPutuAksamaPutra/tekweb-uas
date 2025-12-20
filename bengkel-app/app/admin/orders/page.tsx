"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Package, Loader2, User as UserIcon, RefreshCw, 
  CheckCircle, CreditCard, MapPin, Phone 
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* =====================
    INTERFACE
===================== */
interface OrderItem {
  product_id: number;
  product_name?: string; 
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  user?: { name: string };
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

  // 🔥 PASTIKAN URL INI BENAR (TANPA SLASH DI AKHIR)
  const apiUrl = "https://tekweb-uas-production.up.railway.app/api";

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const loadOrders = useCallback(async () => {
    const token = getCookie("token");
    
    // DEBUG: Cek apakah token kebaca di console browser
    console.log("Fetching dengan Token:", token);

    if (!token) {
      console.error("Token tidak ditemukan di cookie!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/admin/orders`, {
        method: "GET",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        // mode: 'cors' // Opsional jika masih kena CORS
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error ${res.status}: Gagal ambil data`);
      }

      const data = await res.json();
      console.log("Data diterima:", data);

      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
      alertError(err.message || "Gagal menyambung ke server");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  async function updateStatus(orderId: number, status: string) {
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
      if (!res.ok) throw new Error("Gagal update status");
      alertSuccess("Status Berhasil Diperbarui");
      loadOrders();
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 mb-2" size={40} />
        <p className="font-bold text-[#234C6A]">MEMUAT DATA PESANAN...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b-4 border-[#234C6A] pb-6">
          <h1 className="text-3xl font-black text-[#234C6A] uppercase italic flex items-center gap-4">
            <Package className="text-[#FF6D1F]" size={40} />
            Order <span className="text-orange-500">Control</span>
          </h1>
          <button 
            onClick={() => {setLoading(true); loadOrders();}}
            className="flex items-center gap-2 bg-white border-2 border-[#234C6A] px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all"
          >
            <RefreshCw size={16} /> REFRESH
          </button>
        </header>

        <div className="grid gap-6">
          {orders.length > 0 ? orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border-2 shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-8 py-4 border-b flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase">Order ID</span>
                  <h2 className="text-xl font-black text-[#234C6A]">#{order.id}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-gray-400 uppercase">Customer</span>
                  <p className="font-bold text-orange-600 uppercase text-sm italic">{order.user?.name || order.name}</p>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-400 uppercase border-b">
                        <th className="pb-2">Nama Barang</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-[#234C6A]">
                      {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 uppercase">{item.product_name || `Produk #${item.product_id}`}</td>
                          <td className="py-3">{item.quantity}</td>
                          <td className="py-3 text-right">Rp {Number(item.subtotal).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#234C6A] rounded-2xl p-6 text-white flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold opacity-60 uppercase">Total Transaksi</span>
                    <p className="text-2xl font-black text-orange-400 italic">Rp {Number(order.total).toLocaleString()}</p>
                    <p className="text-[10px] mt-2 opacity-80 uppercase tracking-widest">{order.payment} | {order.delivery}</p>
                  </div>
                  
                  <div className="mt-6">
                    <span className="text-[10px] font-bold opacity-60 uppercase block mb-2">Update Status: {order.status}</span>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <button onClick={() => updateStatus(order.id, 'processing')} className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg font-black text-[10px] uppercase">Proses</button>
                      )}
                      {order.status === 'processing' && (
                        <button onClick={() => updateStatus(order.id, 'shipped')} className="flex-1 bg-indigo-500 hover:bg-indigo-700 py-2 rounded-lg font-black text-[10px] uppercase">Kirim</button>
                      )}
                      {order.status === 'shipped' && (
                        <button onClick={() => updateStatus(order.id, 'completed')} className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded-lg font-black text-[10px] uppercase">Selesai</button>
                      )}
                      {order.status === 'completed' && (
                        <div className="flex-1 text-center py-2 border border-green-500/50 rounded-lg text-green-400 font-black text-[10px] uppercase">Transaksi Selesai</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
              <p className="text-gray-400 font-bold italic uppercase">Belum ada pesanan masuk</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}