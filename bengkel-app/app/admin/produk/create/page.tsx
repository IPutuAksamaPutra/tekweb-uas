"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// ENUM Produk
const productTypes = ["Sparepart", "Aksesoris"];

// AMBIL TOKEN DARI COOKIES
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
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        jenis_barang: "",
    });

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: any) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const imageUrl = useMemo(() => {
        if (imageFile) return URL.createObjectURL(imageFile);
        return null;
    }, [imageFile]);

    // =================== SUBMIT ===================
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        if (!imageFile) {
            alert("Gambar wajib diupload!");
            setLoading(false);
            return;
        }

        const token = getCookie("token");

        if (!token) {
            alert("Token tidak ditemukan. Silakan login ulang.");
            router.push('/auth/login');
            setLoading(false);
            return;
        }

        // FORM DATA
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("description", formData.description);
        payload.append("price", formData.price);
        payload.append("stock", formData.stock);
        payload.append("jenis_barang", formData.jenis_barang);
        payload.append("img_url", imageFile); // KEY SESUAI CONTROLLER

        try {
            // ============================
            // 🔥 ENDPOINT FIXED DI SINI
            // ============================
            const res = await fetch("http://localhost:8000/api/products", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: payload,
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 422 && data.errors) {
                    const validationErrors = Object.values(data.errors)
                        .flat()
                        .join("\n");
                    alert("Validasi gagal:\n" + validationErrors);
                } else {
                    alert("Gagal membuat produk: " + (data.message || "Unknown error"));
                }
                return;
            }

            alert("Produk berhasil ditambahkan!");
            router.push("/admin/produk");

        } catch (err) {
            alert("Tidak dapat terhubung ke server!");
        } finally {
            setLoading(false);
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        }
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="max-w-xl mx-auto bg-white shadow p-8 rounded-xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                    Tambah Produk Baru
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block mb-1">Nama Produk</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="border px-3 py-2 rounded w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Deskripsi</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="border px-3 py-2 rounded w-full h-24"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block mb-1">Harga</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="border px-3 py-2 rounded w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Stok</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="border px-3 py-2 rounded w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Jenis Barang</label>
                        <select
                            name="jenis_barang"
                            value={formData.jenis_barang}
                            onChange={handleChange}
                            className="border px-3 py-2 rounded w-full"
                            required
                        >
                            <option value="">-- Pilih --</option>
                            {productTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1">Gambar Produk</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="border px-3 py-2 rounded w-full"
                            required
                        />

                        {imageUrl && (
                            <img
                                src={imageUrl}
                                className="w-32 h-32 mt-3 object-cover border rounded"
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                        {loading ? "Menyimpan..." : "Simpan Produk"}
                    </button>
                </form>
            </div>
        </div>
    );
}
