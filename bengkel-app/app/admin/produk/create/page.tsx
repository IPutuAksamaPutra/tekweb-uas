"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { InputHTMLAttributes, TextareaHTMLAttributes, ChangeEvent, FormEvent } from "react"; // Tambahkan impor tipe yang eksplisit untuk kejelasan

// ENUM Produk
const productTypes = ["Sparepart", "Aksesoris"];

// --- Input Components (Dipertahankan) ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
function Input({ label, ...props }: InputProps) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
            <input {...props} className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500" />
        </div>
    );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}
function Textarea({ label, ...props }: TextareaProps) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
            <textarea {...props} className="border rounded px-3 py-2 w-full h-24 focus:ring-blue-500 focus:border-blue-500" />
        </div>
    );
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export default function CreateProductPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        jenis_barang: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const imageUrl = useMemo(() => {
        if (imageFile) return URL.createObjectURL(imageFile);
        return null;
    }, [imageFile]);


    // =================== SUBMIT ===================
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!imageFile) {
            alert("Gambar wajib diupload!");
            setLoading(false);
            return;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null; 

        if (!token) {
            alert("Token tidak ditemukan. Silakan login ulang.");
            router.push('/login');
            setLoading(false);
            return;
        }

        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("description", formData.description);
        // Pastikan konversi ke string untuk FormData (walaupun input type="number" menghasilkan string)
        payload.append("price", formData.price.toString()); 
        payload.append("stock", formData.stock.toString());
        payload.append("jenis_barang", formData.jenis_barang);

        // Pastikan nama key 'img_url' sinkron dengan Controller Laravel Anda
        payload.append("img_url", imageFile); 

        try {
            const res = await fetch("http://localhost:8000/api/admin/products", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: payload
            });

            const data = await res.json();

            if (!res.ok) {
                // ... (Logika error handling sudah benar)
                if (res.status === 401 || res.status === 403) {
                    alert("Akses ditolak atau sesi berakhir. Silakan login ulang.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    router.push('/login');
                } else if (res.status === 422 && data.errors) {
                    const validationErrors = Object.values(data.errors).flat().join("\n");
                    alert("Validasi gagal:\n" + validationErrors);
                } else {
                    alert("Gagal membuat produk. HTTP " + res.status + ": " + (data.message || "Unknown error"));
                }
                return;
            }

            // Jika sukses
            alert("Produk berhasil ditambahkan!");
            router.push("/admin/produk");
        } catch (err) {
            // Error handling untuk masalah koneksi
            alert("Tidak dapat terhubung ke server!");
        } finally {
            setLoading(false);
            if (imageUrl) URL.revokeObjectURL(imageUrl); 
        }
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="max-w-xl mx-auto bg-white shadow p-8 rounded-xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Tambah Produk Baru</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <Input label="Nama Produk" name="name" type="text"
                        value={formData.name} onChange={handleChange} required />

                    <Textarea
                        label="Deskripsi"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />

                    <Input label="Harga" name="price" type="number"
                        value={formData.price} onChange={handleChange} required />

                    <Input label="Stok" name="stock" type="number"
                        value={formData.stock} onChange={handleChange} required />

                    {/* ENUM */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Jenis Barang</label>
                        <select
                            name="jenis_barang"
                            value={formData.jenis_barang}
                            onChange={handleChange}
                            required
                            className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        >
                            <option value="">-- Pilih --</option>
                            {productTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Upload Gambar */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Upload Gambar</label>
                        <input type="file" accept="image/*"
                            onChange={handleImageChange}
                            required
                            className="border rounded px-3 py-2 w-full" />

                        {imageUrl && (
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? "Menyimpan..." : "Simpan Produk"}
                    </button>
                </form>
            </div>
        </div>
    );
}