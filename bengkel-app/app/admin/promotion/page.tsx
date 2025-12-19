"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit, Calendar, Tag, Package, Loader2 } from "lucide-react";
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  /* ================= HELPERS ================= */
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* ================= GET DATA ================= */
  const getPromo = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/promotions`);
      const data = await res.json();
      
      // Mendukung response structure data.promotions atau data.data
      const promoData = data.promotions || data.data || [];
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
          Accept: "application/json"
        },
      });

      if (res.ok) {
        alertSuccess("Promo berhasil dihapus!");
        getPromo();
      } else {
        throw new Error();
      }
    } catch (err) {
      alertError("Gagal menghapus! Pastikan Anda admin.");
    }
  };

  if (!isMount) return null;

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={40} />
        <p className="text-[#234C6A] font-bold">Memuat Daftar Promo...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#234C6A] uppercase tracking-tighter">📢 Daftar Promosi</h1>
            <p className="text-gray-500 font-medium">Kelola diskon dan kampanye pemasaran</p>
          </div>

          <button
            onClick={() => router.push("/admin/promotion/create")}
            className="flex items-center gap-2 bg-[#FF6D1F] hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-200 transition-all active:scale-95"
          >
            <Plus size={20} /> Tambah Promo
          </button>
        </div>

        {/* LIST PROMO */}
        {list.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] text-center shadow-sm border-2 border-dashed border-gray-200">
             <Tag className="mx-auto text-gray-200 mb-4" size={64} />
             <h3 className="text-xl font-bold text-slate-400">Belum Ada Promo Tersedia</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {list.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-4xl shadow-sm hover:shadow-xl border-l-8 border-[#FF6D1F] transition-all overflow-hidden"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="font-black text-2xl text-[#234C6A] uppercase tracking-tight">{p.name}</h2>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                        <Tag size={16} className="text-[#FF6D1F]" />
                        <span className="font-black text-[#FF6D1F]">
                          {p.discount_type === "percentage" ? `${p.discount_value}% OFF` : `Potongan Rp ${p.discount_value.toLocaleString("id-ID")}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl">
                        <Calendar size={16} />
                        {new Date(p.start_date).toLocaleDateString("id-ID")} - {new Date(p.end_date).toLocaleDateString("id-ID")}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Package size={14} /> Produk Partisipan
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {p.products?.slice(0, 3).map((pr) => (
                          <span key={pr.id} className="bg-blue-50 text-[#234C6A] text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100">
                            {pr.name}
                          </span>
                        ))}
                        {p.products && p.products.length > 3 && (
                          <span className="text-[10px] font-bold text-gray-400">+{p.products.length - 3} lainnya</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8 border-gray-100">
                    <button
                      onClick={() => router.push(`/admin/promotion/${p.id}/edit`)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-blue-50 text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit size={16} /> Edit
                    </button>

                    <button
                      onClick={() => deletePromo(p.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-red-50 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
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