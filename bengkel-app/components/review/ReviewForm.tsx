"use client";

import { useState } from "react";
import { Star } from "lucide-react";

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
          order_id: orderId,
          product_id: productId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

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
    <div className="mt-8 bg-white border rounded-2xl p-6 shadow-sm text-black">
      <h3 className="text-xl font-bold mb-6 text-[#234C6A]">
        Tulis Ulasan Produk
      </h3>

      {/* PILIH PRODUK */}
      <div className="mb-5">
        <label className="block font-semibold mb-2 text-gray-700">
          Pilih Produk
        </label>
        <select
          value={productId}
          onChange={(e) => setProductId(Number(e.target.value))}
          className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none"
        >
          {items.map((item, i) => (
            <option key={i} value={item.product_id}>
              Produk #{item.product_id}
            </option>
          ))}
        </select>
      </div>

      {/* RATING */}
      <div className="mb-5">
        <label className="block font-semibold mb-2 text-gray-700">
          Rating
        </label>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRating(r)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={
                  r <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-1">
          {rating === 5 && "Sangat puas"}
          {rating === 4 && "Puas"}
          {rating === 3 && "Cukup"}
          {rating === 2 && "Kurang"}
          {rating === 1 && "Sangat buruk"}
        </p>
      </div>

      {/* KOMENTAR */}
      <div className="mb-5">
        <label className="block font-semibold mb-2 text-gray-700">
          Komentar
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-xl p-3 min-h-[100px] focus:ring-2 focus:ring-orange-400 outline-none"
          placeholder="Ceritakan pengalamanmu tentang produk ini"
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#FF6D1F] hover:bg-[#E85E15] text-white font-bold py-3 rounded-full transition disabled:opacity-50"
      >
        {loading ? "Mengirim ulasan..." : "Kirim Ulasan"}
      </button>
    </div>
  );
}
