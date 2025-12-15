"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { alertSuccess, alertError, alertLoginRequired, alertConfirmDelete, alertValidation } from "@/components/Alert";

const productTypes = ["Sparepart", "Aksesoris"];

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
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        jenis_barang: "",
    });

    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // 🔥 MODIFIKASI FUNGSI INI: Menggabungkan file baru dengan file lama
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const newlySelectedFiles = Array.from(e.target.files) as File[];

        // Gabungkan file baru dengan file yang sudah ada
        // (Pastikan tidak ada duplikasi jika file yang sama dipilih lagi, 
        // meskipun browser biasanya sudah menangani ini)
        const combinedFiles = [...imageFiles, ...newlySelectedFiles];

        // Batasi total file menjadi maksimal 5
        const finalFiles = combinedFiles.slice(0, 5);

        if (combinedFiles.length > 5) {
             alertError(`Maksimal upload 5 gambar! Hanya 5 gambar pertama yang diambil.`);
        }
        
        setImageFiles(finalFiles);

        // Penting: Reset nilai input file agar kita bisa memilih file lagi
        e.target.value = ''; 
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        if (imageFiles.length === 0) {
            alertError("Gambar wajib diupload!");
            setLoading(false);
            return;
        }

        const token = getCookie("token");
        if (!token) { 
            alertError("Token tidak ditemukan"); 
            router.push("/auth/login"); 
            setLoading(false); 
            return; 
        }

        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("description", formData.description);
        payload.append("price", formData.price);
        payload.append("stock", formData.stock);
        payload.append("jenis_barang", formData.jenis_barang);

        // Logika pengiriman multi-file yang sudah benar
        imageFiles.forEach(file => payload.append("images[]", file));

        try {
            const res = await fetch("http://127.0.0.1:8000/api/products", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
                body: payload,
            });

            const data = await res.json();
            
            if (!res.ok) {
                let errorMsg = data.message || "Gagal menambah produk. Status: " + res.status;
                if (data.errors) {
                    const validationErrors = Object.values(data.errors).flat().join('\n- ');
                    errorMsg += "\n\nDetail Error:\n- " + validationErrors;
                }
                alert(errorMsg);
                setLoading(false);
                return;
            }

            alertSuccess("Produk berhasil ditambahkan!");
            router.push("/admin/produk");
        } catch (err) {
            console.error(err);
            alertError("Gagal terhubung ke server");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIKA PREVIEW & CLEANUP ---

    const previewUrls = useMemo(() => imageFiles.map(file => URL.createObjectURL(file)), [imageFiles]);

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);


    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="max-w-xl mx-auto bg-white shadow p-8 rounded-xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                    Tambah Produk Baru
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... Inputs lainnya (tetap sama) ... */}
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nama Produk" className="border px-3 py-2 rounded w-full" required/>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Deskripsi" className="border px-3 py-2 rounded w-full h-24" required/>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Harga" className="border px-3 py-2 rounded w-full" required/>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stok" className="border px-3 py-2 rounded w-full" required/>
                    <select name="jenis_barang" value={formData.jenis_barang} onChange={handleChange} className="border px-3 py-2 rounded w-full" required>
                        <option value="">-- Pilih Jenis --</option>
                        {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gambar Produk (Maks 5 File)
                        </label>
                        {/* Input file tidak direset oleh React, kita reset manual di fungsi handler */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={handleImageChange} 
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border rounded"
                        />
                        <div className="flex gap-2 mt-2">
                            {previewUrls.map((url, i) => 
                                <img key={i} src={url} className="w-24 h-24 object-cover rounded shadow-md" alt={`Preview ${i + 1}`}/>
                            )}
                        </div>
                        {/* Menampilkan jumlah file yang saat ini dipilih */}
                        {imageFiles.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                                Total {imageFiles.length} file dipilih.
                            </p>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {loading ? "Menyimpan..." : "Simpan Produk"}
                    </button>
                </form>
            </div>
        </div>
    );
}