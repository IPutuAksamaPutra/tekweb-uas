"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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

    const handleImageChange = (e: any) => {
        if (e.target.files?.length) setImageFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        if (imageFiles.length === 0) {
            alert("Gambar wajib diupload!");
            setLoading(false);
            return;
        }

        const token = getCookie("token");
        if (!token) { 
            alert("Token tidak ditemukan"); 
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

        // ✅ LOGIKA BENAR: Loop untuk mengirim semua file
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
                alert(data.message || "Gagal menambah produk");
                setLoading(false);
                return;
            }

            alert("Produk berhasil ditambahkan!");
            router.push("/admin/produk");
        } catch (err) {
            console.error(err);
            alert("Gagal terhubung ke server");
        } finally {
            setLoading(false);
        }
    };

    const previewUrls = useMemo(() => imageFiles.map(file => URL.createObjectURL(file)), [imageFiles]);

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="max-w-xl mx-auto bg-white shadow p-8 rounded-xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                    Tambah Produk Baru
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... Inputs ... */}
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nama Produk" className="border px-3 py-2 rounded w-full" required/>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Deskripsi" className="border px-3 py-2 rounded w-full h-24" required/>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Harga" className="border px-3 py-2 rounded w-full" required/>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stok" className="border px-3 py-2 rounded w-full" required/>
                    <select name="jenis_barang" value={formData.jenis_barang} onChange={handleChange} className="border px-3 py-2 rounded w-full" required>
                        <option value="">-- Pilih Jenis --</option>
                        {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <div>
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="border px-3 py-2 rounded w-full"/>
                        <div className="flex gap-2 mt-2">
                            {previewUrls.map((url, i) => <img key={i} src={url} className="w-24 h-24 object-cover rounded" alt="preview"/>)}
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
                        {loading ? "Menyimpan..." : "Simpan Produk"}
                    </button>
                </form>
            </div>
        </div>
    );
}