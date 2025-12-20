"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { alertSuccess, alertError } from "@/components/Alert";
import { 
  ArrowLeft, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  Package,
  PlusCircle
} from "lucide-react";

/* ===============================
    INTERFACES
================================ */
interface Product {
  id: number;
  name: string;
  price: string | number;
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

  const BASE_URL = "https://tekweb-uas-production.up.railway.app";
  const API_URL = `${BASE_URL}/api`;

  /* ==================== FETCH PRODUCT ==================== */
  const loadProducts = useCallback(async () => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    try {
      const res = await fetch(`${API_URL}/products`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      const list = data.products ?? data.data ?? [];
      setProducts(Array.isArray(list) ? list : []);
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
    const token = document.cookie.match(/token=([^;]+)/)?.[1];

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
          discount_value: Number(discountValue),
          // Mengganti T dari datetime-local menjadi spasi untuk Laravel
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

  const inputStyle = "w-full bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#FF6D1F] focus:bg-white transition-all";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigasi Kembali */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 font-black text-[#234C6A] hover:text-[#FF6D1F] transition-all uppercase text-xs tracking-widest group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Daftar
        </button>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header Card */}
          <div className="bg-[#234C6A] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 italic relative z-10">
              <PlusCircle className="text-[#FF6D1F]" size={36} /> 
              Tambah Promosi
            </h1>
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60 relative z-10">
              Buat kampanye diskon baru untuk produk marketplace
            </p>
          </div>

          <form onSubmit={createPromo} className="p-10 space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              
              {/* Kolom Kiri: Detail Promo */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Nama Kampanye</label>
                  <input
                    className={inputStyle}
                    placeholder="Contoh: Promo Ganti Oli Ramadhan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tipe Diskon</label>
                    <select
                      className={inputStyle}
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                    >
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Nilai Potongan</label>
                    <input
                      className={inputStyle}
                      type="number"
                      placeholder="10 / 20000"
                      value={discountValue || ""}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tgl Mulai</label>
                    <input
                      type="datetime-local"
                      className={inputStyle}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tgl Berakhir</label>
                    <input
                      type="datetime-local"
                      className={inputStyle}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Status Kampanye</label>
                  <select
                    className={inputStyle}
                    value={isActive ? "1" : "0"}
                    onChange={(e) => setIsActive(e.target.value === "1")}
                  >
                    <option value="1">Aktifkan Sekarang</option>
                    <option value="0">Draft / Simpan Saja</option>
                  </select>
                </div>
              </div>

              {/* Kolom Kanan: Pilih Produk */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mx-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Package size={14} className="text-[#FF6D1F]" /> Partisipasi Produk
                  </label>
                  <span className="text-[9px] font-black text-white bg-[#234C6A] px-3 py-1 rounded-full uppercase">
                    {selectedProducts.length} Terpilih
                  </span>
                </div>
                
                <div className="border-2 border-gray-100 rounded-[2.5rem] bg-gray-50/30 p-4 max-h-[400px] overflow-y-auto shadow-inner">
                  {products.length === 0 ? (
                    <div className="text-center py-20 opacity-40">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mengambil Data Produk...</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {products.map((p) => {
                        const isChecked = selectedProducts.includes(p.id);
                        return (
                          <div 
                            key={p.id} 
                            onClick={() => toggleProduct(p.id)}
                            className={`flex items-center justify-between p-5 rounded-[1.8rem] cursor-pointer transition-all border-2
                              ${isChecked ? 'bg-white border-[#FF6D1F] shadow-lg scale-[0.98]' : 'bg-white/50 border-transparent hover:border-gray-200'}
                            `}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-[#FF6D1F] border-[#FF6D1F]' : 'border-gray-200'}`}>
                                {isChecked && <CheckCircle2 size={16} className="text-white" />}
                              </div>
                              <div>
                                <p className={`text-sm font-black uppercase tracking-tight ${isChecked ? 'text-[#234C6A]' : 'text-gray-500'}`}>{p.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rp {Number(p.price).toLocaleString("id-ID")}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white py-6 rounded-4xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-orange-100 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>Publikasikan Kampanye Promo</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}