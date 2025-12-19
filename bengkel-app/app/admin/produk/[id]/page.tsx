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

  const BASE_URL = "https://tekweb-uas-production.up.railway.app";
  const API_URL = `${BASE_URL}/api`;

  /* =====================
      FETCH PRODUCT
  ===================== */
  const fetchProduct = useCallback(async () => {
    const token = getCookie("token");
    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json"
        },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      // Menyesuaikan dengan struktur data Laravel
      const p = data.product || data.data || data;
      
      setName(p.name || "");
      setPrice(p.price ? p.price.toString() : "");
      setDesc(p.description || "");
      
      // Ambil nama file asli dari array image_urls atau img_urls
      const rawImages = p.image_urls || p.img_urls || [];
      // Ambil nama file saja, bersihkan dari path storage jika terbawa
      const firstImg = Array.isArray(rawImages) ? rawImages[0] : "";
      setImage(firstImg ? firstImg.replace("public/products/", "").replace("products/", "") : "");
      
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
    
    // Pastikan key sesuai dengan Model Laravel Anda: 'img_url'
    // Mengirimkan sebagai array sesuai casting Model
    const payload = {
      name,
      price: Number(price),
      description: desc,
      img_url: [image], 
    };

    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal memperbarui produk");
      }

      alertSuccess("Produk berhasil diperbarui!");
      router.push("/admin/produk");
    } catch (err: any) {
      alertError(err.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (!isMount) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={40} />
        <p className="text-[#234C6A] font-black uppercase tracking-widest text-xs">Menyinkronkan dengan Railway...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Tombol Kembali */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 font-black text-[#234C6A] hover:text-[#FF6D1F] transition-colors uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={20} /> Kembali ke Daftar
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
          {/* Header Card */}
          <div className="bg-[#234C6A] p-8 text-white">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Package className="text-[#FF6D1F]" size={32} /> Edit Produk
            </h1>
            <p className="text-blue-100 text-xs font-bold mt-1 opacity-70 uppercase tracking-widest">Safe Storage Mode Enabled</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 grid md:grid-cols-2 gap-8">
            
            {/* Kolom Kiri: Input Data */}
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#FF6D1F] focus:bg-white transition-all shadow-sm"
                  placeholder="Nama produk..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  name="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#FF6D1F] focus:bg-white transition-all shadow-sm"
                  placeholder="Contoh: 150000"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi</label>
                <textarea
                  rows={4}
                  name="description"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#FF6D1F] focus:bg-white transition-all resize-none shadow-sm"
                  placeholder="Detail spesifikasi..."
                />
              </div>
            </div>

            {/* Kolom Kanan: Gambar */}
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama File Gambar</label>
                <input
                  type="text"
                  name="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#FF6D1F] focus:bg-white transition-all shadow-sm"
                  placeholder="contoh: helm.jpg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preview Gambar</label>
                <div className="aspect-square bg-white rounded-3xl border-4 border-dashed border-gray-100 flex items-center justify-center overflow-hidden shadow-inner relative group">
                  {image ? (
                    <img
                      src={image.startsWith("http") ? image : `${BASE_URL}/storage/products/${image.replace('public/products/', '').replace('products/', '')}`}
                      alt="Preview"
                      className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://placehold.co/400x400?text=File+Tidak+Ditemukan";
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-300">
                      <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Belum ada gambar</p>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase text-center mt-2 tracking-tighter">Pastikan file sudah ada di folder storage/products Railway</p>
              </div>
            </div>

            {/* Tombol Action */}
            <div className="md:col-span-2 pt-6 border-t flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#FF6D1F] hover:bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} /> 
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all active:scale-[0.98]"
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