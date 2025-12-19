"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Edit3, 
  Calendar, 
  Tag, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Clock
} from "lucide-react";
import { alertError } from "@/components/Alert";

/* ===============================
   INTERFACES
================================ */
interface Product {
  id: number;
  name: string;
  price: number;
}

interface Promotion {
  id: number;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  products: Product[];
}

export default function PromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [promo, setPromo] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMount, setIsMount] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* ================= FETCH DATA ================= */
  const fetchPromoDetail = useCallback(async () => {
    const token = getCookie("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/promotions/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setPromo(data.promotion ?? data.data ?? data);
    } catch (err) {
      alertError("Gagal memuat detail promosi");
      router.push("/admin/promotion");
    } finally {
      setLoading(false);
    }
  }, [id, API_URL, router]);

  useEffect(() => {
    setIsMount(true);
    fetchPromoDetail();
  }, [fetchPromoDetail]);

  if (!isMount) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={40} />
        <p className="text-[#234C6A] font-bold">Memuat Detail Promosi...</p>
      </div>
    );
  }

  if (!promo) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <button
          onClick={() => router.push("/admin/promotion")}
          className="flex items-center gap-2 mb-8 font-bold text-[#234C6A] hover:text-[#FF6D1F] transition-colors"
        >
          <ArrowLeft size={20} /> Kembali ke Daftar Promo
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
          
          {/* Header Card */}
          <div className="bg-[#234C6A] p-8 md:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Tag className="text-[#FF6D1F]" size={32} />
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                  {promo.name}
                </h1>
              </div>
              <p className="text-blue-100 font-medium opacity-80 uppercase text-xs tracking-widest">
                Promotion ID: #{promo.id}
              </p>
            </div>

            <button
              onClick={() => router.push(`/admin/promotion/${id}/edit`)}
              className="bg-[#FF6D1F] hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-200 transition-all flex items-center gap-2 active:scale-95"
            >
              <Edit3 size={18} /> Edit Data
            </button>
          </div>

          <div className="p-8 md:p-10 grid md:grid-cols-3 gap-10">
            
            {/* Left: Stats & Info */}
            <div className="md:col-span-1 space-y-8">
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Informasi Diskon</h3>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 mb-1">Nilai Potongan:</p>
                  <p className="text-4xl font-black text-[#FF6D1F]">
                    {promo.discount_type === "percentage" ? `${promo.discount_value}%` : `Rp${promo.discount_value.toLocaleString()}`}
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 uppercase">
                    Tipe: {promo.discount_type}
                  </span>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Status & Periode</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {promo.is_active ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                    <span className={`font-black uppercase text-xs tracking-widest ${promo.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {promo.is_active ? 'Kampanye Aktif' : 'Kampanye Nonaktif'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-600">
                    <Calendar size={18} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Masa Berlaku</p>
                      <p className="text-sm font-bold">{promo.start_date} <br/> s/d {promo.end_date}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Product Participants */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Package size={14} /> Produk yang Berpartisipasi
                </h3>
                <span className="bg-blue-50 text-[#234C6A] px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {promo.products?.length || 0} Barang
                </span>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-4xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Produk</th>
                      <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Harga Normal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {promo.products?.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-5">
                          <p className="font-bold text-[#234C6A] group-hover:text-[#FF6D1F] transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium tracking-tight">Product ID: #{product.id}</p>
                        </td>
                        <td className="p-5 text-right font-black text-gray-700">
                          Rp {product.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {(!promo.products || promo.products.length === 0) && (
                      <tr>
                        <td colSpan={2} className="p-10 text-center text-gray-400 font-bold uppercase text-xs italic tracking-widest">
                          Belum ada produk yang didaftarkan ke promo ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Gunakan menu edit untuk mengubah durasi atau nilai diskon.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}