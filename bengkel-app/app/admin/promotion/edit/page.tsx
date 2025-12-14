"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Promotion {
  id: number;
  name: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  product_ids: number[];
}

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();

  const promoId = params.id;

  const [promo, setPromo] = useState<Promotion | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= GET SINGLE PROMO =================
  const getPromo = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/promotions/${promoId}`);
      const data = await res.json();

      // Format product_ids untuk checkbox
      const ids = data.promotion.products.map((p: Product) => p.id);

      setPromo({ ...data.promotion, product_ids: ids });
    } catch (e) {
      console.log(e);
    }
  };

  // ================= GET LIST PRODUCTS =================
  const getProducts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/products");
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    Promise.all([getPromo(), getProducts()]).then(() => setLoading(false));
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e: any) => {
    setPromo({
      ...promo!,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckbox = (id: number) => {
    if (!promo) return;

    let selected = [...promo.product_ids];
    if (selected.includes(id)) {
      selected = selected.filter((p) => p !== id);
    } else {
      selected.push(id);
    }

    setPromo({ ...promo, product_ids: selected });
  };

  // ================= SUBMIT UPDATE =================
  const updatePromo = async (e: any) => {
    e.preventDefault();

    const token = document.cookie.match(/token=([^;]+)/)?.[1];

    if (!token) {
      alert("Login admin dulu!");
      return;
    }

    const res = await fetch(`http://localhost:8000/api/promotions/${promoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(promo),
    });

    if (res.ok) {
      alert("Promo berhasil diupdate");
      router.push("/admin/promotion");
    } else {
      alert("Gagal update promo");
    }
  };

  if (loading || !promo)
    return <p className="text-center p-10 text-gray-500">Memuat data...</p>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#234C6A] mb-6">
        ✏ Edit Promo
      </h1>

      <form
        onSubmit={updatePromo}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >
        {/* Nama Promo */}
        <div>
          <label className="font-semibold">Nama Promo</label>
          <input
            type="text"
            name="name"
            value={promo.name}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            required
          />
        </div>

        {/* Jenis Diskon */}
        <div>
          <label className="font-semibold">Jenis Diskon</label>
          <select
            name="discount_type"
            value={promo.discount_type}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          >
            <option value="percentage">Persentase (%)</option>
            <option value="fixed">Potongan Harga (Rp)</option>
          </select>
        </div>

        {/* Nilai Diskon */}
        <div>
          <label className="font-semibold">Nilai Diskon</label>
          <input
            type="number"
            name="discount_value"
            value={promo.discount_value}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            required
          />
        </div>

        {/* Tanggal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Tanggal Mulai</label>
            <input
              type="date"
              name="start_date"
              value={promo.start_date}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="font-semibold">Tanggal Berakhir</label>
            <input
              type="date"
              name="end_date"
              value={promo.end_date}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            />
          </div>
        </div>

        {/* Produk Terkait */}
        <div>
          <label className="font-semibold">Produk Terkait</label>

          <div className="border p-3 rounded max-h-52 overflow-y-auto mt-1">
            {products.map((prod) => (
              <label key={prod.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={promo.product_ids.includes(prod.id)}
                  onChange={() => handleCheckbox(prod.id)}
                />
                {prod.name}
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button className="w-full bg-[#FF6D1F] hover:bg-[#e55f19] text-white py-3 rounded-lg font-semibold">
          Update Promo
        </button>
      </form>
    </div>
  );
}
