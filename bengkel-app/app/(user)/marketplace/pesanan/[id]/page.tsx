"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReviewForm from "@/components/review/ReviewForm";

interface Item {
  product_id: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  items: Item[];
  total: number;
  status: string;
}

export default function DetailPesanan() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () =>
    typeof document !== "undefined"
      ? document.cookie.match(/token=([^;]+)/)?.[1]
      : null;

  useEffect(() => {
    const fetchDetail = async () => {
      const token = getToken();

      if (!token) {
        setError("Silakan login terlebih dahulu");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8000/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Gagal memuat detail pesanan");
        }

        setOrder({
          ...data.order,
          items: Array.isArray(data.order.items)
            ? data.order.items
            : JSON.parse(data.order.items),
        });
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchDetail();
  }, [id]);

  if (error) {
    return (
      <p className="mt-10 text-center text-red-600">{error}</p>
    );
  }

  if (!order) {
    return (
      <p className="mt-10 text-center">Loading...</p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-black">
      <Link href="/marketplace/pesanan">← Kembali</Link>

      <div className="border rounded-lg p-6 mt-4">
        <h2 className="font-bold text-xl mb-2">
          Detail Pesanan #{order.id}
        </h2>

        <p className="mb-4">
          Status: <b>{order.status}</b>
        </p>

        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between border-b py-1"
          >
            <span>
              Produk #{item.product_id} x {item.quantity}
            </span>
            <span>Rp {item.subtotal}</span>
          </div>
        ))}

        <div className="text-right font-bold mt-3">
          Total: Rp {order.total}
        </div>

        {/* =========================
            REVIEW (BACKEND-SAFE)
           ========================= */}
        {order.status === "completed" && (
          <div className="mt-6">
            {!showReview ? (
              <button
                onClick={() => setShowReview(true)}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Tulis Review
              </button>
            ) : (
              <ReviewForm
                orderId={order.id}
                items={order.items}
                onSuccess={() => {
                  setShowReview(false);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
