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
} from "lucide-react";
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
  const [isMount, setIsMount] = useState(false);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://tekweb-uas-production.up.railway.app/api";

  /* =====================
      COOKIE HELPER
  ===================== */
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
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

      if (!res.ok) throw new Error();

      const data = await res.json();
      const sortedOrders = (data.orders || []).sort(
        (a: Order, b: Order) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
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
      const res = await fetch(
        `${apiUrl}/admin/orders/${orderId}/status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error();

      alertSuccess(`Status Order #${orderId} berhasil diubah!`);
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6D1F] border-t-transparent mb-4" />
        <p className="font-bold text-[#234C6A]">
          Sinkronisasi Data Pesanan...
        </p>
      </div>
    );
  }

  const statusStyle = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-indigo-100 text-indigo-700",
    completed: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <header>
          <h1 className="text-4xl font-black text-[#234C6A] flex items-center gap-3">
            <Package className="text-[#FF6D1F]" size={36} />
            Manajemen Pesanan
          </h1>
          <p className="text-gray-500 font-medium">
            Pantau dan kelola seluruh transaksi marketplace
          </p>
        </header>

        {orders.map((order) => {
          const items = parseItems(order.items);

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl border shadow-sm overflow-hidden"
            >
              {/* TOP HEADER */}
              <div className="flex flex-wrap justify-between items-center px-8 py-5 border-b bg-gray-50">
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    Nomor Invoice
                  </p>
                  <h2 className="text-2xl font-black text-[#234C6A]">
                    #{order.id}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <CalendarClock
                    size={16}
                    className="text-blue-500"
                  />
                  {new Date(order.created_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${statusStyle[order.status]}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="p-8 space-y-8">
                {/* INFO GRID */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <MapPin className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase">
                          Penerima & Alamat
                        </p>
                        <p className="font-bold">{order.name}</p>
                        <p className="text-sm text-gray-500">
                          {order.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="p-3 bg-green-50 rounded-xl">
                        <Phone className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase">
                          Kontak
                        </p>
                        <p className="font-bold">{order.no_tlp}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <CreditCard className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-400 uppercase">
                          Metode & Pengiriman
                        </p>
                        <div className="flex justify-between text-sm font-bold border-b border-dashed pb-1">
                          <span>{order.payment}</span>
                          <span className="text-gray-500">
                            {order.delivery}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="font-black text-[#234C6A]">
                            Total Tagihan
                          </span>
                          <span className="text-xl font-black text-[#FF6D1F]">
                            Rp {order.total.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-xs font-black text-gray-400 uppercase">
                      <tr>
                        <th className="px-6 py-3">Item</th>
                        <th className="px-6 py-3 text-center">Qty</th>
                        <th className="px-6 py-3 text-right">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4 font-bold">
                            Produk ID #{item.product_id}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-[#234C6A]">
                            Rp{" "}
                            {item.subtotal.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-3 border-t pt-6">
                  {order.status === "pending" && (
                    <button
                      onClick={() =>
                        updateStatus(order.id, "processing")
                      }
                      disabled={updatingId === order.id}
                      className="btn bg-blue-600"
                    >
                      <Clock size={16} /> Proses
                    </button>
                  )}

                  {order.status === "processing" && (
                    <button
                      onClick={() =>
                        updateStatus(order.id, "shipped")
                      }
                      disabled={updatingId === order.id}
                      className="btn bg-indigo-600"
                    >
                      <Truck size={16} /> Kirim
                    </button>
                  )}

                  {order.status === "shipped" && (
                    <button
                      onClick={() =>
                        updateStatus(order.id, "completed")
                      }
                      disabled={updatingId === order.id}
                      className="btn bg-green-600"
                    >
                      <CheckCircle size={16} /> Selesaikan
                    </button>
                  )}

                  {order.status === "completed" && (
                    <div className="flex items-center gap-2 text-green-600 font-black bg-green-50 px-6 py-3 rounded-xl border">
                      <CheckCircle /> Transaksi Selesai
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-white p-20 rounded-3xl text-center border-dashed border-2">
            <Package size={64} className="mx-auto text-gray-300" />
            <p className="mt-4 font-bold text-gray-400">
              Belum Ada Pesanan Masuk
            </p>
          </div>
        )}
      </div>

      {/* BUTTON STYLE */}
      <style jsx>{`
        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          color: white;
          font-weight: 800;
          border-radius: 12px;
          text-transform: uppercase;
          font-size: 12px;
          transition: 0.2s;
        }
        .btn:hover {
          filter: brightness(1.1);
        }
        .btn:disabled {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
