"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { alertSuccess, alertError, alertLoginRequired, alertConfirmDelete, alertValidation } from "@/components/Alert";

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Promotion {
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  product_ids: number[];
}

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const promoId = params.id as string;

  const [promo, setPromo] = useState<Promotion | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token =
    typeof document !== "undefined"
      ? document.cookie.match(/token=([^;]+)/)?.[1]
      : null;

  /* ================= GET PROMO ================= */
  const getPromo = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/promotions/${promoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("GET PROMO ERROR:", text);
        return;
      }

      const data = await res.json();
      console.log("PROMO RESPONSE:", data);

      // 🔥 fleksibel handle response Laravel
      const promoData = data.promotion ?? data.data ?? data;

      setPromo({
        name: promoData.name ?? "",
        discount_type: promoData.discount_type ?? "percentage",
        discount_value: Number(promoData.discount_value ?? 0),
        start_date: promoData.start_date ?? "",
        end_date: promoData.end_date ?? "",
        is_active: Boolean(promoData.is_active),
        product_ids:
          promoData.products?.map((p: any) => p.id) ?? [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= GET PRODUCTS ================= */
  const getProducts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/products");
      const data = await res.json();
      setProducts(data.products ?? data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) {
      alertError("Login admin dulu!");
      router.push("/login");
      return;
    }

    Promise.all([getPromo(), getProducts()]).finally(() =>
      setLoading(false)
    );
  }, []);

  /* ================= HANDLER ================= */
  const handleChange = (e: any) => {
    setPromo({
      ...promo!,
      [e.target.name]: e.target.value,
    });
  };

  const toggleProduct = (id: number) => {
    if (!promo) return;

    setPromo({
      ...promo,
      product_ids: promo.product_ids.includes(id)
        ? promo.product_ids.filter((p) => p !== id)
        : [...promo.product_ids, id],
    });
  };

  /* ================= UPDATE PROMO ================= */
  const updatePromo = async (e: any) => {
    e.preventDefault();
    if (!promo) return;

    setSaving(true);

    const payload = {
      name: promo.name,
      discount_type: promo.discount_type,
      discount_value: Number(promo.discount_value),
      start_date: promo.start_date.replace("T", " "),
      end_date: promo.end_date.replace("T", " "),
      is_active: promo.is_active ? 1 : 0,
      product_ids: promo.product_ids,
    };

    const res = await fetch(
      `http://localhost:8000/api/promotions/${promoId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    setSaving(false);

    if (!res.ok) {
      const text = await res.text();
      console.error("UPDATE ERROR:", text);
      alertError("Gagal update promo");
      return;
    }

    alertSuccess("Promo berhasil diupdate 🎉");
    router.push("/admin/promotion");
  };

  if (loading || !promo) {
    return (
      <p className="text-center p-10 text-gray-500">
        Memuat data...
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-10 border">
      <h1 className="text-3xl font-bold text-[#234C6A] mb-6">
        ✏ Edit Promotion
      </h1>

      <form onSubmit={updatePromo} className="space-y-4">
        <input
          name="name"
          value={promo.name}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          placeholder="Nama Promo"
          required
        />

        <select
          name="discount_type"
          value={promo.discount_type}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        >
          <option value="percentage">Persentase (%)</option>
          <option value="fixed">Potongan Harga (Rp)</option>
        </select>

        <input
          type="number"
          name="discount_value"
          value={promo.discount_value}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="datetime-local"
            name="start_date"
            value={(promo.start_date ?? "").replace(" ", "T")}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />
          <input
            type="datetime-local"
            name="end_date"
            value={(promo.end_date ?? "").replace(" ", "T")}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />
        </div>

        <select
          value={promo.is_active ? "1" : "0"}
          onChange={(e) =>
            setPromo({
              ...promo,
              is_active: e.target.value === "1",
            })
          }
          className="w-full border p-3 rounded-lg"
        >
          <option value="1">Aktif</option>
          <option value="0">Nonaktif</option>
        </select>

        <div className="border p-3 rounded-lg max-h-48 overflow-y-auto">
          {products.map((p) => (
            <label key={p.id} className="flex gap-3 mb-2">
              <input
                type="checkbox"
                checked={promo.product_ids.includes(p.id)}
                onChange={() => toggleProduct(p.id)}
              />
              {p.name} — Rp {p.price.toLocaleString()}
            </label>
          ))}
        </div>

        <button
          disabled={saving}
          className={`w-full py-3 text-white rounded-lg font-bold ${
            saving
              ? "bg-gray-400"
              : "bg-[#FF6D1F] hover:bg-[#e35a12]"
          }`}
        >
          {saving ? "Menyimpan..." : "Update Promo"}
        </button>
      </form>
    </div>
  );
}
