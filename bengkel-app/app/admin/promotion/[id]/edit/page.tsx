"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  alertSuccess, 
  alertError 
} from "@/components/Alert";
import { 
  ArrowLeft, 
  Save, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  Package,
  AlertCircle
} from "lucide-react";

/* ===============================
   INTERFACES
================================ */
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
  const [isMount, setIsMount] = useState(false);

  /* ================= HELPERS ================= */
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(async () => {
    const token = getCookie("token");
    if (!token) {
      alertError("Sesi berakhir, silakan login ulang.");
      router.push("/auth/login");
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
      
      const [promoRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/promotions/${promoId}`, { headers }),
        fetch(`${API_URL}/products`, { headers })
      ]);

      if (!promoRes.ok) throw new Error("Gagal memuat data promosi");
      
      const promoJson = await promoRes.json();
      const prodJson = await productsRes.json();

      const promoData = promoJson.promotion ?? promoJson.data ?? promoJson;
      const productList = prodJson.products ?? prodJson.data ?? [];

      setPromo({
        name: promoData.name ?? "",
        discount_type: promoData.discount_type ?? "percentage",
        discount_value: Number(promoData.discount_value ?? 0),
        start_date: promoData.start_date ?? "",
        end_date: promoData.end_date ?? "",
        is_active: Boolean(promoData.is_active),
        product_ids: promoData.products?.map((p: any) => p.id) ?? [],
      });

      setProducts(productList);
    } catch (err: any) {
      alertError(err.message);
      router.push("/admin/promotion");
    } finally {
      setLoading(false);
    }
  }, [promoId, router, API_URL]);

  useEffect(() => {
    setIsMount(true);
    fetchData();
  }, [fetchData]);

  /* ================= HANDLERS ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!promo) return;
    setPromo({ ...promo, [e.target.name]: e.target.value });
  };

  const toggleProduct = (id: number) => {
    if (!promo) return;
    const currentIds = [...promo.product_ids];
    const newIds = currentIds.includes(id)
      ? currentIds.filter((pId) => pId !== id)
      : [...currentIds, id];
    setPromo({ ...promo, product_ids: newIds });
  };

  const updatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promo) return;

    setSaving(true);
    const token = getCookie("token");

    const payload = {
      ...promo,
      discount_value: Number(promo.discount_value),
      start_date: promo.start_date.replace("T", " "),
      end_date: promo.end_date.replace("T", " "),
      is_active: promo.is_active ? 1 : 0,
    };

    try {
      const res = await fetch(`${API_URL}/promotions/${promoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      alertSuccess("Promosi berhasil diperbarui! ✨");
      router.push("/admin/promotion");
    } catch (err) {
      alertError("Gagal memperbarui promosi.");
    } finally {
      setSaving(false);
    }
  };

  if (!isMount) return null;

  if (loading || !promo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={40} />
        <p className="text-[#234C6A] font-bold">Sinkronisasi Data Promo...</p>
      </div>
    );
  }

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
          <div className="bg-[#234C6A] p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <Tag className="text-[#FF6D1F]" size={32} /> 
                Edit Promosi
              </h1>
              <p className="text-blue-100 text-sm mt-1">Kelola diskon dan partisipasi produk</p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 ${promo.is_active ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
              {promo.is_active ? 'Aktif' : 'Nonaktif'}
            </div>
          </div>

          <form onSubmit={updatePromo} className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Kolom Kiri: Informasi Utama */}
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nama Kampanye</label>
                  <input name="name" value={promo.name} onChange={handleChange} className={inputStyle} placeholder="Contoh: Promo Akhir Tahun" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Tipe Diskon</label>
                    <select name="discount_type" value={promo.discount_type} onChange={handleChange} className={inputStyle}>
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nilai Diskon</label>
                    <input type="number" name="discount_value" value={promo.discount_value} onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Mulai</label>
                    <input type="datetime-local" name="start_date" value={promo.start_date.replace(" ", "T")} onChange={handleChange} className={inputStyle} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Berakhir</label>
                    <input type="datetime-local" name="end_date" value={promo.end_date.replace(" ", "T")} onChange={handleChange} className={inputStyle} />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Status Promo</label>
                  <select 
                    value={promo.is_active ? "1" : "0"} 
                    onChange={(e) => setPromo({...promo, is_active: e.target.value === "1"})} 
                    className={inputStyle}
                  >
                    <option value="1">Aktifkan Sekarang</option>
                    <option value="0">Nonaktifkan</option>
                  </select>
                </div>
              </div>

              {/* Kolom Kanan: Daftar Produk */}
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih Produk Partisipan</label>
                  <span className="text-[10px] font-black text-[#FF6D1F] bg-orange-50 px-2 py-1 rounded-md">
                    {promo.product_ids.length} Terpilih
                  </span>
                </div>
                
                <div className="border-2 border-gray-100 rounded-4xl bg-gray-50/50 p-4 max-h-[380px] overflow-y-auto custom-scrollbar">
                  {products.length === 0 ? (
                    <div className="text-center py-10">
                      <Package size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-bold text-gray-400 uppercase">Tidak ada produk tersedia</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {products.map((p) => {
                        const isSelected = promo.product_ids.includes(p.id);
                        return (
                          <label 
                            key={p.id} 
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2
                              ${isSelected ? 'bg-white border-[#FF6D1F] shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={isSelected}
                                onChange={() => toggleProduct(p.id)}
                              />
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#FF6D1F] border-[#FF6D1F]' : 'border-gray-300'}`}>
                                {isSelected && <CheckCircle2 size={14} className="text-white" />}
                              </div>
                              <div>
                                <p className={`text-sm font-black ${isSelected ? 'text-[#234C6A]' : 'text-gray-600'}`}>{p.name}</p>
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
              disabled={saving}
              className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-gray-300"
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Simpan Perubahan Promo</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}