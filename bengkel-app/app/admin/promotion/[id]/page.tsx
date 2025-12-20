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
  Clock,
  ShieldAlert
} from "lucide-react";
import { alertError } from "@/components/Alert";

interface Product {
  id: number;
  name: string;
  price: string | number;
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

  const BASE_URL = "https://tekweb-uas-production.up.railway.app";
  const API_URL = `${BASE_URL}/api`;

  const fetchPromoDetail = useCallback(async () => {
    // 1. Ambil token dengan cara yang lebih aman
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    
    if (!token) {
      alertError("Sesi habis, silakan login kembali.");
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/promotions/${id}`, {
        method: "GET",
        headers: { 
          // Pastikan penulisan Bearer tepat (perhatikan spasi)
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        cache: "no-store"
      });

      // 2. Tangani Error 401 secara spesifik
      if (res.status === 401) {
        alertError("Sesi login tidak sah atau kadaluarsa.");
        // Hapus cookie token yang rusak agar tidak looping error
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/auth/login");
        return;
      }

      if (!res.ok) throw new Error("Gagal mengambil data dari server");

      const json = await res.json();
      const promoData = json.data || json.promotion || json;
      setPromo(promoData);
    } catch (err: any) {
      console.error("FETCH ERROR:", err.message);
      alertError(err.message || "Terjadi kesalahan sistem.");
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
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={48} />
        <p className="text-[#234C6A] font-black uppercase text-xs tracking-[0.4em] animate-pulse">
          Validasi Akses Keamanan...
        </p>
      </div>
    );
  }

  if (!promo) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigasi */}
        <button
          onClick={() => router.push("/admin/promotion")}
          className="flex items-center gap-2 mb-8 font-black text-[#234C6A] hover:text-[#FF6D1F] transition-all uppercase text-[10px] tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Dashboard
        </button>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-[#234C6A] p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
             {/* Glow Dekorasi */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-[#FF6D1F] p-3 rounded-2xl shadow-lg">
                  <Tag className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                    {promo.name}
                  </h1>
                  <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1 opacity-60">
                    System Record: #{promo.id}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push(`/admin/promotion/${id}/edit`)}
              className="bg-white/10 hover:bg-[#FF6D1F] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border border-white/10 hover:border-[#FF6D1F] shadow-xl active:scale-95"
            >
              <Edit3 size={18} className="inline mr-2" /> Modify Promo
            </button>
          </div>

          <div className="p-10 grid md:grid-cols-3 gap-12">
            
            {/* Informasi Diskon */}
            <div className="md:col-span-1 space-y-10">
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Pricing Strategy</h3>
                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-inner">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Potongan</p>
                  <p className="text-5xl font-black text-[#FF6D1F] tracking-tighter">
                    {promo.discount_type === "percentage" ? `${promo.discount_value}%` : `Rp${Number(promo.discount_value).toLocaleString("id-ID")}`}
                  </p>
                  <div className="mt-6 flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#234C6A] text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                      Type: {promo.discount_type}
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Campaign Status</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    {promo.is_active ? 
                      <CheckCircle2 className="text-green-500" size={24} /> : 
                      <ShieldAlert className="text-red-500" size={24} />
                    }
                    <span className={`font-black uppercase text-[11px] tracking-widest ${promo.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {promo.is_active ? 'Kampanye Aktif' : 'Kampanye Suspend'}
                    </span>
                  </div>
                  <div className="flex items-start gap-4 text-gray-600 p-4">
                    <Calendar size={20} className="text-[#FF6D1F] mt-1" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Masa Berlaku</p>
                      <p className="text-sm font-bold text-[#234C6A]">
                        {promo.start_date} <br/> 
                        <span className="text-gray-300 font-medium lowercase">sampai</span> <br/>
                        {promo.end_date}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Daftar Produk */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Package size={16} className="text-[#FF6D1F]" /> Participants list
                </h3>
                <span className="bg-orange-50 text-[#FF6D1F] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                  {promo.products?.length || 0} Products
                </span>
              </div>

              <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-100/50">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-50">
                    <tr>
                      <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Produk Motor</th>
                      <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">MSRP Harga</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {promo.products?.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="p-6">
                          <p className="font-black text-[#234C6A] group-hover:text-[#FF6D1F] transition-colors uppercase text-sm tracking-tight">
                            {product.name}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">PID: {product.id}</p>
                        </td>
                        <td className="p-6 text-right font-black text-[#234C6A]">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                    {(!promo.products || promo.products.length === 0) && (
                      <tr>
                        <td colSpan={2} className="p-20 text-center">
                          <Package size={48} className="mx-auto text-gray-200 mb-4" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">No active products linked</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-10 py-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-[#FF6D1F]" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Verified synchronization with Railway DB.
              </p>
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase italic">© BengkelApp Admin v2.1</p>
          </div>

        </div>
      </div>
    </div>
  );
}