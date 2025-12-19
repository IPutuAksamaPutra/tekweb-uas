"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { alertSuccess, alertError } from "@/components/Alert";
import { ArrowLeft, Tag, Calendar, CheckCircle2, Loader2, Package } from "lucide-react";

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
  const [isMount, setIsMount] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tekweb-uas-production.up.railway.app/api";

  /* ==================== GET TOKEN (SAFE) ==================== */
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* ==================== FETCH PRODUCT ==================== */
  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data.products ?? data.data ?? []);
    } catch (err) {
      console.error("Gagal memuat produk:", err);
    }
  }, [API_URL]);

  useEffect(() => {
    setIsMount(true);
    loadProducts();
  }, [loadProducts]);

  const toggleProduct = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  /* ==================== CREATE PROMO ==================== */
  const createPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie("token");

    if (!token) return alertError("Silakan login terlebih dahulu.");
    if (selectedProducts.length === 0) return alertError("Pilih minimal satu produk!");

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/promotions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name,
          discount_type: discountType,
          discount_value: discountValue,
          start_date: startDate.replace("T", " "),
          end_date: endDate.replace("T", " "),
          is_active: isActive ? 1 : 0,
          product_ids: selectedProducts
        })
      });

      const result = await res.json();

      if (res.ok) {
        alertSuccess("Promosi baru berhasil dibuat! 🎉");
        router.push("/admin/promotion");
      } else {
        const msg = result.message || "Gagal membuat promo.";
        alertError(msg);
      }
    } catch (err) {
      alertError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMount) return null;

  const inputStyle = "w-full bg-gray-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF6D1F] transition-all";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 font-bold text-[#234C6A] hover:text-[#FF6D1F] transition-colors"
        >
          <ArrowLeft size={20} /> Kembali ke Daftar
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-[#234C6A] p-8 text-white">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Tag className="text-[#FF6D1F]" size={32} /> 
              Tambah Promosi
            </h1>
            <p className="text-blue-100 text-sm mt-1">Buat kampanye diskon baru untuk produk marketplace</p>
          </div>

          <form onSubmit={createPromo} className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Kolom Kiri: Detail Promo */}
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nama Kampanye</label>
                  <input
                    className={inputStyle}
                    placeholder="Contoh: Promo Ganti Oli Ramadhan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Tipe Diskon</label>
                    <select
                      className={inputStyle}
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                    >
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nilai</label>
                    <input
                      className={inputStyle}
                      type="number"
                      placeholder="10 / 20000"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Tgl Mulai</label>
                    <input
                      type="datetime-local"
                      className={inputStyle}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Tgl Berakhir</label>
                    <input
                      type="datetime-local"
                      className={inputStyle}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Status</label>
                  <select
                    className={inputStyle}
                    value={isActive ? "1" : "0"}
                    onChange={(e) => setIsActive(e.target.value === "1")}
                  >
                    <option value="1">Aktif Sekarang</option>
                    <option value="0">Draft / Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Kolom Kanan: Pilih Produk */}
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partisipasi Produk</label>
                  <span className="text-[10px] font-black text-[#FF6D1F] bg-orange-50 px-2 py-1 rounded-md">
                    {selectedProducts.length} Terpilih
                  </span>
                </div>
                
                <div className="border-2 border-gray-100 rounded-4xl bg-gray-50/50 p-4 max-h-[380px] overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="text-center py-10 text-gray-400 text-xs font-bold uppercase italic">Memuat data produk...</p>
                  ) : (
                    <div className="grid gap-2">
                      {products.map((p) => {
                        const isChecked = selectedProducts.includes(p.id);
                        return (
                          <label 
                            key={p.id} 
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2
                              ${isChecked ? 'bg-white border-[#FF6D1F] shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={isChecked}
                                onChange={() => toggleProduct(p.id)}
                              />
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-[#FF6D1F] border-[#FF6D1F]' : 'border-gray-300'}`}>
                                {isChecked && <CheckCircle2 size={14} className="text-white" />}
                              </div>
                              <div>
                                <p className={`text-sm font-black ${isChecked ? 'text-[#234C6A]' : 'text-gray-600'}`}>{p.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Rp {p.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-gray-400"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Publikasikan Kampanye Promo"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}