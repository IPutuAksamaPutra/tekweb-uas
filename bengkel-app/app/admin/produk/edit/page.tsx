"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { alertSuccess, alertError } from "@/components/Alert";
import { ArrowLeft, Save, Upload, Package, X, Loader2 } from "lucide-react";

/* ===============================
   INTERFACE
================================ */
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  img_url: string[]; 
  jenis_barang: string;
  stock: number;
}

const productTypes = ["Sparepart", "Aksesoris"];
const BACKEND_BASE = "http://localhost:8000";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function EditProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMount, setIsMount] = useState(false);

  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  // 1. Initial Load & Hydration Guard
  useEffect(() => {
    setIsMount(true);
    if (!productId) {
      setLoading(false);
      return;
    }

    const token = getCookie("token");
    if (!token) {
      alertError("Sesi berakhir. Silakan login ulang.");
      router.push("/auth/login");
      return;
    }

    async function fetchProduct() {
      try {
        const res = await fetch(`${BACKEND_BASE}/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        const prod = data.product;

        setProduct(prod);
        
        // Transform nama file dari backend menjadi full URL jika perlu
        const formattedUrls = (prod.img_url || []).map((url: string) => 
          url.startsWith('http') ? url : `${BACKEND_BASE}/images/${url}`
        );
        setExistingImageUrls(formattedUrls);
      } catch (err) {
        alertError("Gagal memuat data produk.");
        router.push("/admin/produk");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId, router]);

  // 2. Blob URL Preview Management
  const newPreviewUrls = useMemo(() => {
    return selectedImageFiles.map((file) => URL.createObjectURL(file));
  }, [selectedImageFiles]);

  useEffect(() => {
    return () => {
      newPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviewUrls]);

  const currentPreviewUrls = newPreviewUrls.length > 0 ? newPreviewUrls : existingImageUrls;

  // 3. Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!product) return;
    const { name, value } = e.target;
    setProduct({ ...product, [name]: (name === "price" || name === "stock") ? Number(value) : value });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const combined = [...selectedImageFiles, ...Array.from(files)].slice(0, 5);
    if (selectedImageFiles.length + files.length > 5) alertError("Maksimal 5 gambar.");
    setSelectedImageFiles(combined);
    e.target.value = ''; 
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setIsUpdating(true);

    const token = getCookie("token");
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price.toString());
    formData.append("description", product.description);
    formData.append("jenis_barang", product.jenis_barang);
    formData.append("stock", product.stock.toString());
    formData.append("_method", "PUT"); // Laravel method spoofing

    selectedImageFiles.forEach((file) => formData.append("images[]", file));

    try {
      const res = await fetch(`${BACKEND_BASE}/api/products/${product.id}`, {
        method: "POST", // Harus POST untuk FormData + spoofing PUT
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error();
      alertSuccess("Produk diperbarui!");
      router.push("/admin/produk");
    } catch (err) {
      alertError("Gagal menyimpan perubahan.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isMount) return null;
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-[#FF6D1F]" size={40} />
      <p className="font-bold text-[#234C6A]">Memuat Data Produk...</p>
    </div>
  );

  const inputStyle = "w-full bg-gray-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF6D1F] transition-all";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 font-bold text-[#234C6A] hover:text-[#FF6D1F] transition-colors"
      >
        <ArrowLeft size={20} /> Kembali
      </button>

      <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100">
        <div className="bg-[#234C6A] p-8 text-white">
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Package className="text-[#FF6D1F]" size={32} /> 
            Edit Produk
          </h1>
          <p className="text-blue-100 text-sm mt-1">ID Produk: #{product?.id}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nama Produk</label>
                <input name="name" value={product?.name || ""} onChange={handleChange} className={inputStyle} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Harga (Rp)</label>
                  <input name="price" type="number" value={product?.price || 0} onChange={handleChange} className={inputStyle} required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Stok</label>
                  <input name="stock" type="number" value={product?.stock || 0} onChange={handleChange} className={inputStyle} required />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Kategori</label>
                <select name="jenis_barang" value={product?.jenis_barang || ""} onChange={handleChange} className={inputStyle} required>
                  <option value="" disabled>Pilih Kategori</option>
                  {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Deskripsi</label>
                <textarea name="description" value={product?.description || ""} onChange={handleChange} className={`${inputStyle} h-[190px] resize-none`} required />
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-200 rounded-4xl p-6 bg-gray-50/50">
            <label className="block text-center cursor-pointer group">
              <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
              <div className="flex flex-col items-center gap-2">
                <div className="p-4 bg-white rounded-full shadow-sm text-[#FF6D1F] group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <p className="font-black text-[#234C6A] uppercase text-xs">Klik untuk Ganti Gambar</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Akan mengganti semua gambar lama</p>
              </div>
            </label>

            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              {currentPreviewUrls.map((url, i) => (
                <div key={i} className="relative group w-24 h-24 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <Image src={url} alt="Preview" fill className="object-cover" unoptimized />
                  {newPreviewUrls.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => removeSelectedImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isUpdating}
            className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-gray-300"
          >
            {isUpdating ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Simpan Perubahan</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF6D1F]" size={40} />
      </div>
    }>
      <EditProductContent />
    </Suspense>
  );
}