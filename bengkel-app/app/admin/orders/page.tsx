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
  Phone,
  ShieldCheck 
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* ================= TYPES ================= */
interface OrderItem {
  product_id: number;
  product_name: string;
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

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    const localToken = localStorage.getItem("token");
    if (localToken) return localToken;
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
  }, []);

  const loadOrders = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return; 
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengambil data");
      setOrders(data.orders || []);
    } catch (err: any) {
      alertError(err.message || "Koneksi ke server gagal");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, getToken]);

  const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
    const token = getToken();
    if (!token) return;

    let nextStatus = "";
    if (currentStatus === "pending") nextStatus = "processing";
    else if (currentStatus === "processing") nextStatus = "shipped";
    else if (currentStatus === "shipped") nextStatus = "completed";
    else return;

    setUpdatingId(orderId);
    try {
      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status");
      alertSuccess(`Order #${orderId} diupdate ke ${nextStatus.toUpperCase()}`);
      loadOrders(); 
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-500 mb-2" size={40} />
      <p className="font-bold text-[#234C6A] italic uppercase">Syncing Order Data...</p>
    </div>
  );

  const token = getToken();
  if (!token) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-4xl shadow-xl text-center border-2 border-orange-500">
        <ShieldCheck className="mx-auto text-orange-500 mb-4" size={50} />
        <h2 className="text-2xl font-black text-[#234C6A] uppercase italic">Akses Ditolak</h2>
        <p className="text-slate-500 font-bold mb-6">Silakan login sebagai Admin.</p>
        <button onClick={() => window.location.href = '/auth/login'} className="bg-[#234C6A] text-white px-8 py-3 rounded-xl font-black uppercase italic hover:bg-orange-500 transition-all">Login Admin</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-[#0f172a]">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b-4 border-[#234C6A] pb-6">
          <h1 className="text-3xl font-black text-[#234C6A] uppercase italic flex items-center gap-4 tracking-tighter">
            <Package className="text-orange-500" size={40} /> ORDER <span className="text-orange-500">CONTROL</span>
          </h1>
          <button onClick={loadOrders} className="flex items-center gap-2 bg-white border-2 border-[#234C6A] px-6 py-2 rounded-xl font-bold shadow-md hover:bg-[#234C6A] hover:text-white transition-all active:scale-95">
            <RefreshCw size={16} /> REFRESH
          </button>
        </header>

        <div className="grid gap-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-xl overflow-hidden hover:border-orange-200 transition-all group">
              <div className="bg-slate-50 px-8 py-5 border-b flex justify-between items-center group-hover:bg-orange-50 transition-colors">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ID Pesanan</span>
                  <h2 className="text-xl font-black text-[#234C6A]">#{order.id}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Waktu Masuk</span>
                  <p className="font-bold text-slate-500 text-xs">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 italic">Rincian Komponen</h3>
                  <div className="grid gap-3">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="bg-white px-3 py-1 rounded-lg border-2 border-[#234C6A]/10 font-black text-xs text-orange-500 italic">x{item.quantity}</div>
                          <p className="font-black text-[#234C6A] uppercase text-sm italic tracking-tight">{item.product_name || "Produk Racing"}</p>
                        </div>
                        {/* 🔥 SOLUSI: Proteksi toLocaleString dengan Number() dan default value 0 */}
                        <p className="font-black text-[#234C6A] italic text-sm">
                          Rp {(Number(item.subtotal) || 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#234C6A] rounded-4xl p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  <div className="space-y-6 relative z-10">
                    <div>
                      <span className="text-[10px] font-black opacity-40 uppercase block mb-4 tracking-[0.2em] italic">Data Delivery</span>
                      <div className="space-y-4 text-xs font-black uppercase italic">
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5"><User size={16} className="text-orange-400"/><p>{order.name}</p></div>
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5"><Phone size={16} className="text-orange-400"/><p>{order.no_tlp}</p></div>
                        <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5"><MapPin size={16} className="text-orange-400 shrink-0"/><p className="text-[10px] opacity-80 leading-relaxed">{order.address}</p></div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                       <span className="text-[10px] font-black opacity-40 uppercase italic tracking-widest">Grand Total</span>
                       <p className="text-3xl font-black text-orange-400 italic tracking-tighter leading-none mt-2">
                         Rp {(Number(order.total) || 0).toLocaleString("id-ID")}
                       </p>
                    </div>
                  </div>

                  <div className="mt-8 relative z-10">
                    {updatingId === order.id ? (
                      <div className="flex justify-center py-4"><Loader2 className="animate-spin text-orange-400" size={24}/></div>
                    ) : (
                      <div className="space-y-2">
                        {order.status === "pending" && (
                          <button onClick={() => handleUpdateStatus(order.id, "pending")} className="w-full bg-blue-500 hover:bg-blue-600 py-5 rounded-2xl font-black text-[11px] uppercase transition-all shadow-lg flex items-center justify-center gap-2 italic tracking-widest"><Clock size={14}/> TERIMA & PROSES</button>
                        )}
                        {order.status === "processing" && (
                          <button onClick={() => handleUpdateStatus(order.id, "processing")} className="w-full bg-indigo-500 hover:bg-indigo-600 py-5 rounded-2xl font-black text-[11px] uppercase transition-all shadow-lg flex items-center justify-center gap-2 italic tracking-widest"><Truck size={14}/> KIRIM PESANAN</button>
                        )}
                        {order.status === "shipped" && (
                          <button onClick={() => handleUpdateStatus(order.id, "shipped")} className="w-full bg-green-500 hover:bg-green-600 py-5 rounded-2xl font-black text-[11px] uppercase transition-all shadow-lg flex items-center justify-center gap-2 italic tracking-widest"><CheckCircle2 size={14}/> SELESAIKAN ORDER</button>
                        )}
                        {order.status === "completed" && (
                          <div className="w-full text-center py-5 border-2 border-green-500/30 rounded-2xl text-green-400 font-black text-[11px] uppercase italic bg-white/5 tracking-widest"><CheckCircle2 size={14} className="inline mr-2"/> TRANSAKSI SELESAI</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}