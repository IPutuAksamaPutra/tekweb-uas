"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

interface Item {
  product_id: number;
}

interface ReviewFormProps {
  orderId: number;
  items: Item[]; // Data ini dikirim dari page.tsx
  onSuccess: () => void;
}

interface ProductMap {
  [key: number]: string;
}

const BASE_URL = "https://tekweb-uas-production.up.railway.app";

export default function ReviewForm({ orderId, items = [], onSuccess }: ReviewFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [productNames, setProductNames] = useState<ProductMap>({});

  // Ambil Nama Produk Asli agar dropdown tidak cuma "Produk #4"
  useEffect(() => {
    const fetchNames = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/products`);
        const data = await res.json();
        const list = data.products || data.data || [];
        
        const map: ProductMap = {};
        list.forEach((p: any) => { map[p.id] = p.name; });
        setProductNames(map);

        // Set default ke produk pertama jika items tersedia
        if (items && items.length > 0) {
          setSelectedProductId(items[0].product_id.toString());
        }
      } catch (err) {
        console.error("Gagal load nama produk");
      }
    };
    fetchNames();
  }, [items]);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || document.cookie.match(/token=([^;]+)/)?.[1];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return alertError("Silakan login kembali.");

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          product_id: parseInt(selectedProductId),
          rating,
          comment,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal kirim ulasan");

      alertSuccess("Ulasan terposting ke database!");
      onSuccess();
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* PILIH PRODUK */}
      <div>
        <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 italic">Pilih Produk</label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-[#234C6A] outline-none focus:border-orange-500"
        >
          {/* SAFETY CHECK: Gunakan items?.map */}
          {items?.map((item) => (
            <option key={item.product_id} value={item.product_id}>
              {productNames[item.product_id] || `Produk #${item.product_id}`}
            </option>
          ))}
        </select>
      </div>

      {/* RATING */}
      <div>
        <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 italic">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button key={num} type="button" onClick={() => setRating(num)}>
              <Star size={32} className={`${num <= rating ? "fill-orange-500 text-orange-500" : "text-slate-200"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* KOMENTAR */}
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 h-32 outline-none font-bold text-slate-600"
          placeholder="Tulis ulasan..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black uppercase italic shadow-xl"
      >
        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Kirim Ulasan"}
      </button>
    </form>
  );
}