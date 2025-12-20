"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, Truck, CheckCircle, Package, MapPin, Phone, CreditCard, Loader2, User as UserIcon, RefreshCw } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

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
  const [isMount, setIsMount] = useState(false);

  const apiUrl = "https://tekweb-uas-production.up.railway.app/api";

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const loadOrders = useCallback(async () => {
    const token = getCookie("token");
    if (!token) return setLoading(false);

    try {
      const res = await fetch(`${apiUrl}/admin/orders`, {
        method: "GET",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengambil data");

      setOrders(data.orders || []);
    } catch (err: any) {
      alertError(err.message);
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
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Gagal update");
      alertSuccess("Status Berhasil Diubah");
      loadOrders();
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    setIsMount(true);
    loadOrders();
  }, [loadOrders]);

  if (!isMount) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex justify-between items-center border-b-4 border-[#234C6A] pb-6">
          <h1 className="text-3xl font-black text-[#234C6A] uppercase italic tracking-tighter flex items-center gap-4">
            <Package className="text-[#FF6D1F]" size={40} /> Order <span className="text-orange-500">Control</span>
          </h1>
          <button onClick={() => {setLoading(true); loadOrders();}} className="p-2 bg-white border-2 rounded-xl"><RefreshCw size={20}/></button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center py-20"><Loader2 className="animate-spin text-orange-500" size={48} /></div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <div key={order.id} className="bg-white rounded-3xl border-2 shadow-xl overflow-hidden p-8">
                  <div className="flex justify-between border-b pb-4 mb-4">
                    <h2 className="text-xl font-black text-[#234C6A]">#{order.id} - {order.user?.name || "Customer"}</h2>
                    <span className="px-4 py-1 bg-orange-500 text-white rounded-lg text-xs font-bold uppercase">{order.status}</span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm border-b pb-2">
                          <span className="font-bold text-[#234C6A] uppercase">{item.product_name || "Sparepart"}</span>
                          <span>{item.quantity} x Rp {item.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#234C6A] p-6 rounded-2xl text-white">
                      <p className="text-xs opacity-60 uppercase mb-2">Total Bayar</p>
                      <p className="text-3xl font-black text-orange-500">Rp {order.total.toLocaleString()}</p>
                      <div className="mt-6 flex gap-2">
                        {order.status === 'pending' && <button onClick={() => updateStatus(order.id, 'processing')} className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold">PROSES</button>}
                        {order.status === 'processing' && <button onClick={() => updateStatus(order.id, 'shipped')} className="bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold">KIRIM</button>}
                        {order.status === 'shipped' && <button onClick={() => updateStatus(order.id, 'completed')} className="bg-green-600 px-4 py-2 rounded-lg text-xs font-bold">SELESAI</button>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}