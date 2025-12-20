"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit, Calendar, Tag, Package, Loader2, Eye } from "lucide-react";
import { alertSuccess, alertError, alertValidate } from "@/components/Alert";

/* ===============================
    INTERFACES
================================ */
interface Promotion {
  id: number;
  name: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  products: { id: number; name: string; price: number }[];
}

export default function PromotionPage() {
  const router = useRouter();
  const [list, setList] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMount, setIsMount] = useState(false);

  const BASE_URL = "https://tekweb-uas-production.up.railway.app";
  const API_URL = `${BASE_URL}/api`;

  /* ================= HELPERS ================= */
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* ================= GET DATA ================= */
  const getPromo = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/promotions`, {
        cache: "no-store",
      });
      const data = await res.json();
      
      const promoData = data.promotions || data.data || data || [];
      setList(Array.isArray(promoData) ? promoData : []);
    } catch (e) {
      console.error("Fetch Error:", e);
      alertError("Gagal mengambil data promo");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    setIsMount(true);
    getPromo();
  }, [getPromo]);

  /* ================= DELETE ================= */
  const deletePromo = async (id: number) => {
    const token = getCookie("token");
    if (!token) return alertError("Sesi berakhir, silakan login ulang!");

    const validate = await alertValidate("Apakah Anda yakin ingin menghapus promo ini?");
    if (!validate.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/promotions/${id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Accept": "application/json"
        },
      });

      if (res.ok) {
        alertSuccess("Promo berhasil dihapus!");
        getPromo();
      } else {
        throw new Error();
      }
    } catch (err) {
      alertError("Gagal menghapus! Pastikan Anda memiliki akses admin.");
    }
  };

  if (!isMount) return null;

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={48} />
        <p className="text-[#234C6A] font-black uppercase text-xs tracking-widest animate-pulse">Sinkronisasi Kampanye Promo...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#234C6A] uppercase tracking-tighter italic">
              📢 Daftar Promosi
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 opacity-70">
              BengkelApp Marketing Center
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/promotion/create")}
            className="group flex items-center gap-3 bg-[#234C6A] hover:bg-[#FF6D1F] text-white px-8 py-4 rounded-4xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Tambah Kampanye Baru
          </button>
        </div>

        {/* LIST PROMO */}
        {list.length === 0 ? (
          <div className="bg-white p-24 rounded-[3.5rem] text-center shadow-xl border-4 border-dashed border-gray-100">
             <Tag className="mx-auto text-gray-200 mb-6" size={80} />
             <h3 className="text-2xl font-black text-slate-300 uppercase italic">Belum Ada Promo Aktif</h3>
             <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Mulai buat kampanye untuk meningkatkan penjualan</p>
          </div>
        ) : (
          <div className="space-y-8">
            {list.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-blue-50 transition-all overflow-hidden"
              >
                <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between gap-8">
                  
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <h2 className="font-black text-3xl text-[#234C6A] uppercase tracking-tighter leading-none">{p.name}</h2>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${p.is_active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {p.is_active ? '● Aktif' : '○ Nonaktif'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-3 bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100 shadow-sm">
                        <Tag size={18} className="text-[#FF6D1F]" />
                        <span className="font-black text-[#FF6D1F] text-lg">
                          {p.discount_type === "percentage" ? `${p.discount_value}% OFF` : `Rp${Number(p.discount_value).toLocaleString("id-ID")}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500 font-black text-xs uppercase tracking-widest bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                        <Calendar size={18} className="text-[#234C6A]" />
                        {new Date(p.start_date).toLocaleDateString("id-ID", {day:'numeric', month:'short'})} - {new Date(p.end_date).toLocaleDateString("id-ID", {day:'numeric', month:'short', year:'numeric'})}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                        <Package size={14} className="text-[#FF6D1F]" /> Produk Partisipan ({p.products?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {p.products?.slice(0, 4).map((pr) => (
                          <span key={pr.id} className="bg-white text-[#234C6A] text-[10px] font-black uppercase px-4 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                            {pr.name}
                          </span>
                        ))}
                        {p.products && p.products.length > 4 && (
                          <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">+{p.products.length - 4} More</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex md:flex-col gap-3 justify-center md:min-w-40 border-t md:border-t-0 md:border-l pt-8 md:pt-0 md:pl-10 border-gray-100">
                    <button
                      onClick={() => router.push(`/admin/promotion/${p.id}`)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-blue-50 text-[#234C6A] font-black text-[10px] uppercase tracking-widest hover:bg-[#234C6A] hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      <Eye size={16} /> Detail
                    </button>
                    
                    <button
                      onClick={() => router.push(`/admin/promotion/${p.id}/edit`)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl border-2 border-orange-50 text-orange-600 font-black text-[10px] uppercase tracking-widest hover:bg-[#FF6D1F] hover:text-white hover:border-[#FF6D1F] transition-all shadow-sm active:scale-95"
                    >
                      <Edit size={16} /> Edit
                    </button>

                    <button
                      onClick={() => deletePromo(p.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl border-2 border-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm active:scale-95"
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}