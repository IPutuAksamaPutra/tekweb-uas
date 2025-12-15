"use client";

import { useEffect, useState } from "react";
import { Clock, Truck, CheckCircle, Package } from "lucide-react";

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

/* =====================
   COOKIE HELPER
===================== */
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

/* =====================
   PAGE
===================== */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  /* =====================
     LOAD ORDERS
  ===================== */
  async function loadOrders() {
    const token = getCookie("token");
    if (!token) {
      alert("Login admin diperlukan");
      return;
    }

    const res = await fetch(`${apiUrl}/admin/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await res.text();
    if (!res.ok) {
      console.error(text);
      alert("Gagal mengambil data order");
      return;
    }

    const data = JSON.parse(text);
    setOrders(data.orders || []);
    setLoading(false);
  }

  /* =====================
     UPDATE STATUS
  ===================== */
  async function updateStatus(orderId: number, status: Order["status"]) {
    const token = getCookie("token");
    if (!token) return;

    setUpdatingId(orderId);

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

    if (!res.ok) {
      const text = await res.text();
      console.error(text);
      alert("Gagal update status");
    }

    setUpdatingId(null);
    loadOrders();
  }

  useEffect(() => {
    loadOrders();
  }, []);

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

  /* =====================
     STATUS LABEL
  ===================== */
  const statusLabel: Record<Order["status"], string> = {
    pending: "PENDING",
    processing: "PROCESSING",
    shipped: "DIKIRIM",
    completed: "SELESAI",
  };

  /* =====================
     LOADING
  ===================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black">
        <p className="font-semibold">Memuat pesanan...</p>
      </div>
    );
  }

  /* =====================
     UI
  ===================== */
  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-2">
        <Package /> Manajemen Pesanan (Admin)
      </h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const items = parseItems(order.items);

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-lg font-bold">
                    Order #{order.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleString("id-ID")}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-200">
                  {statusLabel[order.status]}
                </span>
              </div>

              {/* INFO */}
              <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p><b>Nama:</b> {order.name}</p>
                  <p><b>No. Telp:</b> {order.no_tlp}</p>
                  <p><b>Alamat:</b> {order.address}</p>
                </div>
                <div>
                  <p><b>Pengiriman:</b> {order.delivery}</p>
                  <p><b>Pembayaran:</b> {order.payment}</p>
                  <p className="font-semibold">
                    Total: Rp {order.total.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* ITEMS */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-2">Item Pesanan</p>

                {items.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Tidak ada item
                  </p>
                )}

                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm border-b py-1"
                  >
                    <span>Produk ID: {item.product_id}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              {/* ACTION BUTTON */}
              <div className="flex gap-3 flex-wrap">
                {order.status === "pending" && (
                  <button
                    disabled={updatingId === order.id}
                    onClick={() =>
                      updateStatus(order.id, "processing")
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    <Clock size={16} /> Proses
                  </button>
                )}

                {order.status === "processing" && (
                  <button
                    disabled={updatingId === order.id}
                    onClick={() =>
                      updateStatus(order.id, "shipped")
                    }
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    <Truck size={16} /> Kirim
                  </button>
                )}

                {order.status === "shipped" && (
                  <button
                    disabled={updatingId === order.id}
                    onClick={() =>
                      updateStatus(order.id, "completed")
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle size={16} /> Selesai
                  </button>
                )}

                {order.status === "completed" && (
                  <span className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700">
                    Pesanan Selesai
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-white p-10 rounded-xl text-center shadow">
            <p className="text-gray-600">
              Tidak ada pesanan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
