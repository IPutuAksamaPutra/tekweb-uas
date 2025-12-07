"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ENUM Produk sesuai migration
const productTypes = ["Sparepart", "Aksesoris"];

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setImageFile(e.target.files[0]);
    };

    // =================== SUBMIT ===================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!imageFile) return alert("Gambar wajib diupload!");

        const token = localStorage.getItem("token"); // sesuai login kamu

        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
        payload.append("img_url", imageFile);

        try {
            const res = await fetch("http://localhost:8000/api/products", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: payload
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 422 && data.errors) {
                    alert("Validasi gagal:\n" + Object.values(data.errors).flat().join("\n"));
                } else {
                    alert("Gagal membuat produk. HTTP " + res.status);
                }
                return;
            }

            alert("Produk berhasil ditambahkan!");
            router.push("/admin/produk");

        } catch (err) {
            alert("Tidak dapat terhubung ke server!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="max-w-xl mx-auto bg-white shadow p-6 rounded-xl">
                <h1 className="text-2xl font-semibold mb-4">Tambah Produk</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <Input label="Nama Produk" name="name" type="text"
                        value={formData.name} onChange={handleChange} required />

                    <Textarea label="Deskripsi" name="description"
                        value={formData.description} onChange={handleChange} required />

                    <Input label="Harga" name="price" type="number"
                        value={formData.price} onChange={handleChange} required />

                    <Input label="Stok" name="stock" type="number"
                        value={formData.stock} onChange={handleChange} required />

                    {/* ENUM */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Jenis Barang</label>
                        <select
                            name="jenis_barang"
                            value={formData.jenis_barang}
                            onChange={handleChange}
                            required
                            className="border rounded px-3 py-2 w-full"
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

                        {imageFile && (
                            <img
                                src={URL.createObjectURL(imageFile)}
                                alt="Preview"
                                className="w-28 h-28 rounded mt-3 object-cover border"
                            />
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

// ======== COMPONENT INPUT/ TEXTAREA (Agar rapi) =========

function Input(props: any) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1">{props.label}</label>
            <input {...props} className="border rounded px-3 py-2 w-full" />
        </div>
    );
}

function Textarea(props: any) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1">{props.label}</label>
            <textarea {...props} className="border rounded px-3 py-2 w-full h-24" />
        </div>
    );
}
