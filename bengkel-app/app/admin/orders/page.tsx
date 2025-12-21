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
  ShieldCheck,
  ChevronRight,
  Receipt
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
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <p className="font-bold text-[#234C6A] tracking-widest uppercase animate-pulse">Syncing Database...</p>
    </div>
  );

  const token = getToken();
  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-2xl text-center border-b-8 border-orange-500">
        <ShieldCheck className="mx-auto text-orange-500 mb-6" size={64} />
        <h2 className="text-3xl font-black text-[#234C6A] uppercase italic leading-none mb-2">Restricted</h2>
        <p className="text-slate-400 font-medium mb-8 uppercase tracking-widest text-xs">Admin Authorization Required</p>
        <button onClick={() => window.location.href = '/auth/login'} className="w-full bg-[#234C6A] text-white px-8 py-4 rounded-2xl font-black uppercase italic hover:bg-orange-500 transition-all shadow-xl shadow-blue-900/20">Login System</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* MODER HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-[#234C6A] uppercase italic tracking-tighter flex items-center gap-3">
              ORDER <span className="text-orange-500">VAULT</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Real-time Logistics Management</p>
          </div>
          <button 
            onClick={loadOrders} 
            className="flex items-center gap-3 bg-white border border-slate-200 px-8 py-4 rounded-2xl font-black shadow-sm hover:shadow-xl hover:border-orange-500 transition-all group active:scale-95"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500 text-orange-500" />
            <span className="tracking-widest text-xs uppercase">Refresh Data</span>
          </button>
        </header>

        {/* ORDER GRID */}
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 group overflow-hidden">
              
              {/* TOP STRIP */}
              <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <Receipt className="text-orange-500" size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block leading-none mb-1">Log ID</span>
                    <h2 className="text-lg font-black text-[#234C6A]">#{order.id}</h2>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="hidden sm:block text-right border-r border-slate-200 pr-8">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block leading-none mb-1">Ingress Time</span>
                    <p className="font-bold text-slate-500 text-xs">{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  
                  {/* DYNAMIC BADGE */}
                  <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic border flex items-center gap-2
                    ${order.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 
                      order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-blue-50 text-blue-600 border-blue-100'}
                  `}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'completed' ? 'bg-green-600' : 'bg-current'}`} />
                    {order.status}
                  </div>
                </div>
              </div>

              <div className="p-8 grid lg:grid-cols-12 gap-10">
                {/* ITEMS SECTION */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Manifest Components</h3>
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>
                  
                  <div className="grid gap-4">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 group/item hover:bg-white hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-5">
                          <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 font-black text-xs text-orange-500 shadow-sm italic">x{item.quantity}</div>
                          <div>
                            <p className="font-black text-[#234C6A] uppercase text-sm italic tracking-tight">{item.product_name || "Produk Racing"}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Genuine Parts Verified</p>
                          </div>
                        </div>
                        <p className="font-black text-[#234C6A] italic text-sm">
                          Rp {(Number(item.subtotal) || 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* INFOGRAPHIC CARD */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="bg-[#234C6A] rounded-4xl p-8 text-white shadow-2xl relative overflow-hidden flex-1 group/card">
                    {/* DECORATIVE ELEMENT */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover/card:bg-orange-500/10 transition-colors duration-700"></div>
                    
                    <div className="space-y-6 relative z-10">
                      <div>
                        <span className="text-[10px] font-black text-orange-400/60 uppercase block mb-6 tracking-[0.3em] italic">Logistics Destination</span>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-xs font-black uppercase italic">
                            <div className="bg-white/10 p-3 rounded-xl"><User size={16} className="text-orange-400"/></div>
                            <p className="tracking-widest">{order.name}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-black uppercase italic">
                            <div className="bg-white/10 p-3 rounded-xl"><Phone size={16} className="text-orange-400"/></div>
                            <p className="tracking-widest">{order.no_tlp}</p>
                          </div>
                          <div className="flex items-start gap-4 text-xs font-black uppercase italic">
                            <div className="bg-white/10 p-3 rounded-xl shrink-0"><MapPin size={16} className="text-orange-400"/></div>
                            <p className="text-[10px] opacity-70 leading-relaxed font-bold normal-case italic">{order.address}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                        <div>
                          <span className="text-[10px] font-black text-white/40 uppercase italic tracking-widest">Grand Settlement</span>
                          <p className="text-4xl font-black text-orange-400 italic tracking-tighter leading-none mt-2">
                            Rp {(Number(order.total) || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <ChevronRight className="text-white/20 mb-2" size={32} />
                      </div>
                    </div>
                  </div>

                  {/* ACTION TRIGGER */}
                  <div className="relative">
                    {updatingId === order.id ? (
                      <div className="flex items-center justify-center py-5 bg-white rounded-2xl border border-slate-100 shadow-inner">
                        <Loader2 className="animate-spin text-orange-500" size={28}/>
                      </div>
                    ) : (
                      <div className="grid">
                        {order.status === "pending" && (
                          <button onClick={() => handleUpdateStatus(order.id, "pending")} className="w-full bg-blue-600 hover:bg-blue-700 py-6 rounded-2xl font-black text-[11px] text-white uppercase transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 italic tracking-widest group">
                            <Clock size={16} className="group-hover:scale-125 transition-transform" /> 
                            Approve & Process
                          </button>
                        )}
                        {order.status === "processing" && (
                          <button onClick={() => handleUpdateStatus(order.id, "processing")} className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 rounded-2xl font-black text-[11px] text-white uppercase transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 italic tracking-widest group">
                            <Truck size={16} className="group-hover:translate-x-2 transition-transform" /> 
                            Initialize Shipping
                          </button>
                        )}
                        {order.status === "shipped" && (
                          <button onClick={() => handleUpdateStatus(order.id, "shipped")} className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 rounded-2xl font-black text-[11px] text-white uppercase transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 italic tracking-widest group">
                            <CheckCircle2 size={16} className="group-hover:scale-125 transition-transform" /> 
                            Finalize Transaction
                          </button>
                        )}
                        {order.status === "completed" && (
                          <div className="w-full py-6 bg-[#F8FAFC] border border-emerald-100 rounded-2xl text-emerald-600 font-black text-[11px] uppercase italic flex items-center justify-center gap-3 tracking-widest">
                            <ShieldCheck size={16}/> Settle Completed
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <Package size={64} className="mx-auto text-slate-200 mb-4" />
              <p className="font-black text-[#234C6A] uppercase italic opacity-30">No orders awaiting control</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}