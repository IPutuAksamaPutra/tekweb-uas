"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Package, 
  Loader2, 
  RefreshCw, 
  CheckCircle2, 
  Truck, 
  Clock, 
  User, 
  MapPin, 
  Phone 
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

// --- Antarmuka Data ---
interface OrderItem {
  product_id: number;
  product_name: string; // Sesuai transformasi di AdminOrderController
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  items: OrderItem[];
  name: string;
  no_tlp: string;
  address: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "completed";
  created_at: string;
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const apiUrl = "https://tekweb-uas-production.up.railway.app/api";

  // Fungsi ambil token dari cookie
  const getToken = useCallback(() => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
  }, []);

  // 1. Ambil Data Checkout (Sesuai AdminOrderController@index)
  const loadOrders = useCallback(async () => {
    const token = getToken();
    setLoading(true);

    if (!token) {
      alertError("Sesi login berakhir. Silakan login kembali.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/admin/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Server Error ${res.status}`);
      }

      // Sesuai response controller: return response()->json(['orders' => $orders])
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
      alertError(err.message || "Gagal mengambil data pesanan");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, getToken]);

  // 2. Update Status (Sesuai AdminOrderController@updateStatus)
  const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
    const token = getToken();
    if (!token) return;

    // Tentukan alur status otomatis sesuai validasi 'in:pending,processing,shipped,completed'
    let nextStatus = "";
    if (currentStatus === "pending") nextStatus = "processing";
    else if (currentStatus === "processing") nextStatus = "shipped";
    else if (currentStatus === "shipped") nextStatus = "completed";
    else return;

    setUpdatingId(orderId);

    try {
      // Endpoint: /api/admin/orders/{id}/status
      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal memperbarui status");

      alertSuccess(`Order #${orderId} kini berstatus: ${nextStatus.toUpperCase()}`);
      loadOrders(); // Refresh list otomatis
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-orange-500 mb-2" size={40} />
        <p className="font-bold text-[#234C6A]">SINKRONISASI DATA...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b-4 border-[#234C6A] pb-6">
          <h1 className="text-3xl font-black text-[#234C6A] uppercase italic flex items-center gap-4">
            <Package className="text-orange-500" size={40} />
            ORDER <span className="text-orange-500">CONTROL</span>
          </h1>
          <button 
            onClick={loadOrders}
            className="flex items-center gap-2 bg-white border-2 border-[#234C6A] px-6 py-2 rounded-xl font-bold shadow-md hover:bg-[#234C6A] hover:text-white transition-all active:scale-95"
          >
            <RefreshCw size={16} /> REFRESH
          </button>
        </header>

        {/* List Pesanan */}
        <div className="grid gap-8">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-xl overflow-hidden hover:border-orange-200 transition-all">
                
                {/* Bagian Atas Card */}
                <div className="bg-slate-50 px-8 py-5 border-b flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Pesanan</span>
                    <h2 className="text-xl font-black text-[#234C6A]">#{order.id}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Transaksi</span>
                    <p className="font-bold text-slate-500 text-xs">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <div className="p-8 grid md:grid-cols-3 gap-10">
                  {/* Daftar Barang */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Rincian Produk</h3>
                    {Array.isArray(order.items) && order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="bg-white px-3 py-1 rounded-lg border font-black text-xs text-[#234C6A]">x{item.quantity}</div>
                          <p className="font-bold text-[#234C6A] uppercase text-sm">
                            {item.product_name || `Produk ID: ${item.product_id}`}
                          </p>
                        </div>
                        <p className="font-black text-orange-500">Rp {item.subtotal.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Info Pelanggan & Aksi Admin */}
                  <div className="bg-[#234C6A] rounded-4xl p-8 text-white flex flex-col justify-between shadow-lg">
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-bold opacity-50 uppercase block mb-3">Data Pengiriman</span>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3"><User size={14} className="text-orange-400"/><p className="text-sm font-bold">{order.name}</p></div>
                          <div className="flex items-center gap-3"><Phone size={14} className="text-orange-400"/><p className="text-sm font-bold">{order.no_tlp}</p></div>
                          <div className="flex items-start gap-3"><MapPin size={14} className="text-orange-400 shrink-0"/><p className="text-[11px] opacity-80 leading-relaxed">{order.address}</p></div>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-white/10">
                         <span className="text-[10px] font-bold opacity-50 uppercase">Total Pembayaran</span>
                         <p className="text-2xl font-black text-orange-400 italic">Rp {Number(order.total).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-8">
                      {updatingId === order.id ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-orange-400" size={24}/></div>
                      ) : (
                        <div className="space-y-2">
                          {order.status === "pending" && (
                            <button onClick={() => handleUpdateStatus(order.id, "pending")} className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-md flex items-center justify-center gap-2">
                              <Clock size={14}/> TERIMA & PROSES
                            </button>
                          )}
                          {order.status === "processing" && (
                            <button onClick={() => handleUpdateStatus(order.id, "processing")} className="w-full bg-indigo-500 hover:bg-indigo-600 py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-md flex items-center justify-center gap-2">
                              <Truck size={14}/> KIRIM PESANAN
                            </button>
                          )}
                          {order.status === "shipped" && (
                            <button onClick={() => handleUpdateStatus(order.id, "shipped")} className="w-full bg-green-500 hover:bg-green-600 py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-md flex items-center justify-center gap-2">
                              <CheckCircle2 size={14}/> SELESAIKAN ORDER
                            </button>
                          )}
                          {order.status === "completed" && (
                            <div className="w-full text-center py-4 border-2 border-green-500/30 rounded-2xl text-green-400 font-black text-[10px] uppercase italic bg-white/5">
                              <CheckCircle2 size={14} className="inline mr-2"/> TRANSAKSI SELESAI
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
              <p className="text-slate-400 font-black italic uppercase tracking-widest">Belum ada pesanan masuk</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}