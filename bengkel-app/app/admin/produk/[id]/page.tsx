"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Package } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* =====================
    HELPER: GET COOKIE
===================== */
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;

  const [isMount, setIsMount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tekweb-uas-production.up.railway.app/api";

  /* =====================
      FETCH PRODUCT
  ===================== */
  const fetchProduct = useCallback(async () => {
    const token = getCookie("token");
    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      // Menyesuaikan dengan struktur data Laravel Anda
      const p = data.product || data;
      setName(p.name);
      setPrice(p.price.toString());
      setDesc(p.description || "");
      // Ambil gambar pertama jika img_urls berupa array
      setImage(Array.isArray(p.img_urls) ? p.img_urls[0] : p.image_url || "");
    } catch (err) {
      alertError("Gagal memuat data produk");
      router.push("/admin/produk");
    } finally {
      setLoading(false);
    }
  }, [productId, API_URL, router]);

  useEffect(() => {
    setIsMount(true);
    if (productId) fetchProduct();
  }, [productId, fetchProduct]);

  /* =====================
      HANDLE SUBMIT
  ===================== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const token = getCookie("token");
    const payload = {
      name,
      price: Number(price),
      description: desc,
      // Sesuaikan key dengan backend (image_url atau img_urls)
      image_url: image, 
    };

    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      alertSuccess("Produk berhasil diperbarui!");
      router.push("/admin/produk");
    } catch (err) {
      alertError("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  if (!isMount) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={40} />
        <p className="text-[#234C6A] font-bold">Memuat Data Produk...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Tombol Kembali */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 font-bold text-[#234C6A] hover:text-[#FF6D1F] transition-colors"
        >
          <ArrowLeft size={20} /> Kembali ke Daftar
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
          {/* Header Card */}
          <div className="bg-[#234C6A] p-8 text-white">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Package className="text-[#FF6D1F]" /> Edit Produk
            </h1>
            <p className="text-blue-100 text-sm mt-1">ID Produk: #{productId}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 grid md:grid-cols-2 gap-8">
            
            {/* Kolom Kiri: Input Data */}
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF6D1F] transition-all"
                  placeholder="Contoh: Oli Mesin Matic"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF6D1F] transition-all"
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi</label>
                <textarea
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF6D1F] transition-all resize-none"
                  placeholder="Detail spesifikasi produk..."
                />
              </div>
            </div>

            {/* Kolom Kanan: Gambar */}
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL / Nama File Gambar</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF6D1F] transition-all"
                  placeholder="nama-gambar.jpg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preview Gambar</label>
                <div className="aspect-square bg-gray-100 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                  {image ? (
                    <img
                      src={image.startsWith("http") ? image : `https://tekweb-uas-production.up.railway.app/images/${image}`}
                      alt="Preview"
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://placehold.co/400x400?text=Gambar+Tidak+Ditemukan";
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon size={48} className="mx-auto mb-2" />
                      <p className="text-xs font-bold uppercase">Belum ada gambar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Action */}
            <div className="md:col-span-2 pt-6 border-t flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#FF6D1F] hover:bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-300"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Save size={20} /> Simpan Perubahan
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}