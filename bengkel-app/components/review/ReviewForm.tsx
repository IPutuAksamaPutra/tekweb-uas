"use client";

import { useState } from "react";

interface Item {
  product_id: number;
}

interface Props {
  orderId: number;
  items: Item[];
  onSuccess: () => void;
}

export default function ReviewForm({ orderId, items, onSuccess }: Props) {
  const [productId, setProductId] = useState(items[0]?.product_id || 0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getToken = () =>
    document.cookie.match(/token=([^;]+)/)?.[1];

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const token = getToken();

    if (!token) {
      setError("Silakan login terlebih dahulu");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,      // WAJIB (backend)
          product_id: productId,  // WAJIB
          rating,                 // 1–5
          comment,                // optional
        }),
      });

      const data = await res.json();

      // ============================
      // HANDLE ERROR DARI BACKEND
      // ============================
      if (!res.ok) {
        if (data?.errors) {
          const firstError = Object.values(data.errors)[0] as string[];
          throw new Error(firstError[0]);
        }

        throw new Error(data?.message || "Gagal mengirim review");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border rounded-lg p-4 text-black">
      <h3 className="font-bold mb-3">Tulis Review Produk</h3>

      {/* PILIH PRODUK */}
      <label className="block mb-2">
        Pilih Produk
        <select
          value={productId}
          onChange={(e) => setProductId(Number(e.target.value))}
          className="w-full border p-2 mt-1"
        >
          {items.map((item, i) => (
            <option key={i} value={item.product_id}>
              Produk #{item.product_id}
            </option>
          ))}
        </select>
      </label>

      {/* RATING */}
      <label className="block mb-2">
        Rating (1–5)
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full border p-2 mt-1"
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>

      {/* KOMENTAR */}
      <label className="block mb-2">
        Komentar
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border p-2 mt-1"
          placeholder="Tulis komentar (opsional)"
        />
      </label>

      {/* ERROR */}
      {error && (
        <p className="text-red-600 text-sm mb-2">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Mengirim..." : "Kirim Review"}
      </button>
    </div>
  );
}
