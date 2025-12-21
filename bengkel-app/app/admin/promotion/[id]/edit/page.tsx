"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { alertSuccess, alertError } from "@/components/Alert";
import { 
  ArrowLeft, 
  Tag, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

/* ===============================
    INTERFACES
================================ */
interface Product {
  id: number;
  name: string;
  price: string | number;
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

  const BASE_URL = "https://tekweb-uas-production.up.railway.app";
  const API_URL = `${BASE_URL}/api`;

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(async () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      alertError("Sesi login hilang. Silakan login kembali.");
      router.push("/auth/login");
      return;
    }

    try {
      const headers = { 
        "Authorization": `Bearer ${token}`, 
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      
      const [promoRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/promotions/${promoId}`, { headers }),
        fetch(`${API_URL}/products`, { headers })
      ]);

      if (promoRes.status === 401) {
        alertError("Sesi kadaluarsa. Silakan login ulang.");
        router.push("/auth/login");
        return;
      }

      if (!promoRes.ok) throw new Error("Gagal mengambil data promosi.");
      
      const promoJson = await promoRes.json();
      const prodJson = await productsRes.json();

      const rawPromo = promoJson.data || promoJson.promotion || promoJson;
      const productList = prodJson.data || prodJson.products || [];

      const formatDT = (dateStr: string) => {
        if (!dateStr) return "";
        return dateStr.replace(" ", "T").substring(0, 16);
      };

      setPromo({
        name: rawPromo.name ?? "",
        discount_type: rawPromo.discount_type ?? "percentage",
        discount_value: Number(rawPromo.discount_value ?? 0),
        start_date: formatDT(rawPromo.start_date),
        end_date: formatDT(rawPromo.end_date),
        is_active: rawPromo.is_active === 1 || rawPromo.is_active === true,
        product_ids: rawPromo.products ? rawPromo.products.map((p: any) => p.id) : [],
      });

      setProducts(productList);
    } catch (err: any) {
      alertError(err.message || "Gagal sinkronisasi data.");
      router.push("/admin/promotion");
    } finally {
      setLoading(false);
    }
  }, [promoId, router, API_URL]);

  useEffect(() => {
    setIsMount(true);
    fetchData();
  }, [fetchData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!promo) return;
    const { name, value } = e.target;
    
    // Memastikan tipe data tetap terjaga agar tidak muncul error "not assignable"
    setPromo({ 
      ...promo, 
      [name]: name === "discount_value" ? Number(value) : value 
    });
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
    
    if (promo.product_ids.length === 0) {
      alertError("Pilih minimal satu produk!");
      return;
    }

    setSaving(true);
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    const payload = {
      name: promo.name,
      discount_type: promo.discount_type,
      discount_value: Number(promo.discount_value),
      start_date: promo.start_date.replace("T", " ") + ":00",
      end_date: promo.end_date.replace("T", " ") + ":00",
      is_active: promo.is_active ? 1 : 0,
      product_ids: Array.from(promo.product_ids),
    };

    try {
      const res = await fetch(`${API_URL}/promotions/${promoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal memperbarui promosi.");

      alertSuccess("Promosi berhasil diperbarui!");
      router.push("/admin/promotion");
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isMount) return null;

  // Render loading jika data sedang diambil atau promo masih null
  if (loading || !promo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={48} />
        <p className="text-[#234C6A] font-black uppercase text-xs tracking-widest">Syncing Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 font-black text-[#234C6A] hover:text-[#FF6D1F] transition-all uppercase text-[10px] tracking-widest group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-[#234C6A] p-10 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                <Tag className="text-[#FF6D1F]" size={36} /> Edit Data Promo
              </h1>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60">ID Promo: #{promoId}</p>
            </div>
          </div>

          <form onSubmit={updatePromo} className="p-10 space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nama Promo</label>
                  <input name="name" value={promo.name} onChange={handleChange} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#FF6D1F]" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tipe</label>
                    <select name="discount_type" value={promo.discount_type} onChange={handleChange} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none">
                      <option value="percentage">% Persen</option>
                      <option value="fixed">Rp Tetap</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nilai</label>
                    <input type="number" name="discount_value" value={promo.discount_value} onChange={handleChange} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Mulai</label>
                    <input type="datetime-local" name="start_date" value={promo.start_date} onChange={handleChange} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Selesai</label>
                    <input type="datetime-local" name="end_date" value={promo.end_date} onChange={handleChange} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <input 
                    type="checkbox" 
                    id="is_active" 
                    checked={promo.is_active} 
                    onChange={(e) => setPromo({ ...promo, is_active: e.target.checked })}
                    className="w-5 h-5 accent-[#FF6D1F]"
                  />
                  <label htmlFor="is_active" className="text-sm font-black text-[#234C6A] uppercase italic cursor-pointer">Status Aktif</label>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Pilih Produk ({promo.product_ids.length})</label>
                <div className="border-2 border-gray-100 rounded-[2.5rem] bg-gray-50/30 p-4 max-h-[350px] overflow-y-auto shadow-inner">
                  {products.map((p) => {
                    const isSelected = promo.product_ids.includes(p.id);
                    return (
                      <div key={p.id} onClick={() => toggleProduct(p.id)} className={`flex items-center gap-4 p-4 mb-2 rounded-3xl cursor-pointer transition-all ${isSelected ? 'bg-white border-2 border-[#FF6D1F] shadow-md' : 'bg-transparent border-2 border-transparent'}`}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-[#FF6D1F] border-[#FF6D1F]' : 'border-gray-200'}`}>
                          {isSelected && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase text-[#234C6A]">{p.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest">ID: {p.id}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white py-6 rounded-4xl font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:bg-gray-300 transition-all flex items-center justify-center gap-3">
              {saving ? <Loader2 className="animate-spin" size={24} /> : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}