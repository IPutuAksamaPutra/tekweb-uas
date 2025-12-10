"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function CreatePromotionPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const token = typeof document !== "undefined"
    ? document.cookie.match(/token=([^;]+)/)?.[1]
    : null;

  // ==================== FETCH PRODUCT ====================
  const loadProducts = async () => {
    const res = await fetch("http://localhost:8000/api/products");
    const data = await res.json();

    // Mendukung structure kemungkinan {products} / {data}
    setProducts(data.products ?? data.data ?? []);
  };

  useEffect(() => { loadProducts(); }, []);

  const toggleProduct = (id:number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };


  // ==================== CREATE PROMO ====================
  const createPromo = async () => {
    if (!name || !discountValue || !startDate || !endDate) {
      return alert("Semua field wajib diisi!");
    }

    setLoading(true);

    const res = await fetch("http://localhost:8000/api/promotions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        discount_type: discountType,
        discount_value: discountValue,
        start_date: startDate.replace("T"," "),
        end_date: endDate.replace("T"," "),
        is_active: isActive ? 1 : 0,
        product_ids: selectedProducts
      })
    });

    const result = await res.json();
    console.log("RESP CREATE PROMO =>", result);

    setLoading(false);

    if(res.ok){
      alert("Promo berhasil dibuat!");
      router.push("/admin/promotion");
    } 
    else if(result.errors){
      alert("Validasi gagal:\n" + JSON.stringify(result.errors,null,2));
    }
    else{
      alert("Gagal membuat promo. Lihat console.");
    }
  };


  // ==================== UI ====================
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-10 border">

      <h1 className="text-3xl font-bold text-[#234C6A] mb-6">Tambah Promotion 🎉</h1>

      {/* Nama */}
      <label className="font-semibold">Nama Promo</label>
      <input
        className="w-full border p-3 rounded-lg mb-4"
        placeholder="Promo Akhir Tahun"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      {/* Jenis Diskon */}
      <label className="font-semibold">Jenis Diskon</label>
      <select
        className="w-full border p-3 rounded-lg mb-4"
        value={discountType}
        onChange={(e)=>setDiscountType(e.target.value as any)}
      >
        <option value="percentage">Persentase (%)</option>
        <option value="fixed">Potongan Harga (Rp)</option>
      </select>

      {/* Diskon */}
      <label className="font-semibold">Nilai Diskon</label>
      <input
        className="w-full border p-3 rounded-lg mb-4"
        type="number"
        placeholder="contoh: 10 atau 20000"
        value={discountValue}
        onChange={(e)=>setDiscountValue(Number(e.target.value))}
      />

      {/* Tanggal */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Mulai</label>
          <input type="datetime-local" className="w-full border p-3 rounded-lg mb-4"
            value={startDate} onChange={(e)=>setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="font-semibold">Berakhir</label>
          <input type="datetime-local" className="w-full border p-3 rounded-lg mb-4"
            value={endDate} onChange={(e)=>setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Status */}
      <label className="font-semibold">Status Promo</label>
      <select
        className="w-full border p-3 rounded-lg mb-4"
        value={isActive ? "1" : "0"}
        onChange={(e)=>setIsActive(e.target.value==="1")}
      >
        <option value="1">Aktif</option>
        <option value="0">Nonaktif</option>
      </select>

      {/* Produk */}
      <label className="font-semibold block mb-2">Pilih Produk</label>
      <div className="border p-3 rounded-lg h-40 overflow-y-scroll mb-6">
        {products.map(p=>(
          <label key={p.id} className="flex items-center gap-3 mb-2 cursor-pointer">
            <input type="checkbox"
              checked={selectedProducts.includes(p.id)}
              onChange={()=>toggleProduct(p.id)}
            />
            <span>{p.name} — Rp {p.price.toLocaleString()}</span>
          </label>
        ))}
      </div>

      <button
        onClick={createPromo}
        disabled={loading}
        className={`w-full py-3 text-white text-lg rounded-lg font-bold transition
          ${loading? "bg-gray-400" : "bg-[#FF6D1F] hover:bg-[#e35a12]"}`}
      >
        {loading ? "Menyimpan..." : "Simpan Promosi"}
      </button>

    </div>
  );
}
