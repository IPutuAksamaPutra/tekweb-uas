"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { alertSuccess, alertError } from "@/components/Alert";
import { Package, Upload, X, Loader2, ArrowLeft } from "lucide-react";

const productTypes = ["Sparepart", "Aksesoris"];

/* =====================
    HELPER: GET COOKIE
===================== */
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMount, setIsMount] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    jenis_barang: "",
  });

  // URL API Railway
  const API_URL = "https://tekweb-uas-production.up.railway.app/api";

  useEffect(() => {
    setIsMount(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newlySelectedFiles = Array.from(e.target.files) as File[];
    const combinedFiles = [...imageFiles, ...newlySelectedFiles];
    
    // Batasi total file menjadi maksimal 5
    const finalFiles = combinedFiles.slice(0, 5);
    if (combinedFiles.length > 5) {
      alertError(`Maksimal upload 5 gambar!`);
    }
    
    setImageFiles(finalFiles);
    e.target.value = ''; 
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* =====================
      HANDLE SUBMIT
  ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (imageFiles.length === 0) {
      alertError("Minimal upload 1 gambar produk!");
      setLoading(false);
      return;
    }

    const token = getCookie("token");
    if (!token) { 
      alertError("Sesi berakhir, silakan login kembali"); 
      router.push("/auth/login"); 
      return; 
    }

    /**
     * MENGGUNAKAN FORMDATA
     * Penting untuk upload file fisik ke Storage Laravel
     */
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("price", formData.price);
    payload.append("stock", formData.stock);
    payload.append("jenis_barang", formData.jenis_barang);

    // Kirim images sebagai array file 'images[]' agar sesuai dengan Laravel
    imageFiles.forEach(file => {
        payload.append("images[]", file);
    });

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { 
            Authorization: `Bearer ${token}`,
            "Accept": "application/json", // Memastikan response Laravel berupa JSON
        },
        body: payload, // Browser akan otomatis mengatur Content-Type: multipart/form-data
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Gagal menambah produk");
      }

      alertSuccess("Produk berhasil disimpan ke Storage Railway!");
      router.push("/admin/produk");
    } catch (err: any) {
      alertError(err.message || "Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const previewUrls = useMemo(() => imageFiles.map(file => URL.createObjectURL(file)), [imageFiles]);

  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  if (!isMount) return null;

  const inputStyle = "w-full bg-gray-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-[#FF6D1F] focus:bg-white transition-all";

  return (
    <div className="min-h-screen p-6 bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto">
        
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 font-black text-[#234C6A] hover:text-[#FF6D1F] transition-colors uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={20} /> Kembali ke Daftar
        </button>

        <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-gray-100">
          <div className="bg-[#234C6A] p-8 text-white">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Package className="text-[#FF6D1F]" size={32} /> 
              Tambah Produk
            </h1>
            <p className="text-blue-100 text-xs font-bold mt-1 opacity-70 uppercase tracking-wider">Penyimpanan di Storage/App/Public Railway</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nama Produk</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nama barang..." className={inputStyle} required/>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Kategori</label>
                  <select name="jenis_barang" value={formData.jenis_barang} onChange={handleChange} className={inputStyle} required>
                    <option value="">Pilih Jenis</option>
                    {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Harga (Rp)</label>
                    <input type="number" name="price" min="0" value={formData.price} onChange={handleChange} placeholder="0" className={inputStyle} required/>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Stok Unit</label>
                    <input type="number" name="stock" min="0" value={formData.stock} onChange={handleChange} placeholder="0" className={inputStyle} required/>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Deskripsi Produk</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Jelaskan spesifikasi secara detail..." className={`${inputStyle} h-[180px] resize-none`} required/>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="border-4 border-dashed border-gray-100 rounded-4xl p-8 bg-gray-50/50">
              <label className="block text-center cursor-pointer">
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-white rounded-full shadow-lg text-[#FF6D1F]">
                    <Upload size={28} />
                  </div>
                  <p className="font-black text-[#234C6A] uppercase text-xs tracking-widest">Upload Foto Produk</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Maksimal 5 Gambar (JPG/PNG)</p>
                </div>
              </label>

              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-8 justify-center">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative group w-24 h-24">
                      <img src={url} className="w-full h-full object-cover rounded-2xl shadow-xl border-4 border-white" alt="Preview"/>
                      <button 
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> 
                  Sedang Mengupload...
                </>
              ) : "Publikasikan Produk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}