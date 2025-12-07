"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 💡 Definisikan daftar Tipe Produk (ENUM)
const productTypes = [
    'Sparepart', 
    'Aksesoris'
];

export default function CreateProductPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    
    // 💡 PERBAIKAN STATE: Menggunakan jenis_barang untuk match dengan Laravel Controller
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        jenis_barang: "", // ⬅️ Field state yang benar
    });

    // Handle input
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
    };

    // ================= SAVE PRODUCT =====================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!imageFile) {
            alert("Gambar wajib di-upload!");
            setLoading(false);
            return;
        }

        // ⚠️ Asumsikan token disimpan dengan nama 'authToken' untuk konsistensi
        const token = localStorage.getItem("authToken"); 

        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("description", formData.description);
        payload.append("price", formData.price);
        payload.append("stock", formData.stock);
        // 💡 PERBAIKAN KRUSIAL: Kirim data dengan nama field yang benar
        payload.append("jenis_barang", formData.jenis_barang); 
        payload.append("img_url", imageFile); 

        try {
            const res = await fetch("http://localhost:8000/api/products", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: payload 
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok) {
                // Penanganan Error yang Lebih Baik
                if (res.status === 422 && data.errors) {
                    const errorMessages = Object.values(data.errors).flat().join('\n');
                    alert(`Gagal membuat produk (Validasi):\n${errorMessages}`);
                } else if (res.status === 500) {
                    alert("Terjadi kesalahan server! Pastikan Model Product \$fillable sudah benar.");
                } else {
                    alert(`Gagal membuat produk. Status HTTP: ${res.status}`);
                }
                return;
            }

            alert("Produk berhasil dibuat!");
            router.push("/admin/produk");
        } catch (error) {
            alert("Terjadi kesalahan jaringan atau server tidak dapat dijangkau!");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
                <h1 className="text-2xl font-bold mb-4">Tambah Produk Baru</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Produk</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Contoh: Oli Motor"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Deskripsi</label>
                        <textarea
                            name="description"
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 h-28"
                            placeholder="Masukkan deskripsi produk..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Harga</label>
                        <input
                            type="number"
                            name="price"
                            required
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="150000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Stock</label>
                        <input
                            type="number"
                            name="stock"
                            required
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="10"
                        />
                    </div>

                    {/* 💡 SELECT BARU BERDASARKAN ENUM ARRAY */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipe Produk (Enum)</label>
                        <select
                            name="jenis_barang" // 💡 PERBAIKAN KRUSIAL: Ganti ke jenis_barang
                            required
                            value={formData.jenis_barang} // 💡 PERBAIKAN KRUSIAL: Menggunakan jenis_barang
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">-- Pilih Tipe --</option>
                            {/* Mapping array productTypes yang sudah di-hardcode */}
                            {productTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Upload Gambar tetap sama */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Upload Gambar</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                        {imageFile && <img src={URL.createObjectURL(imageFile)} className="w-32 h-32 object-cover mt-3 rounded" />}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-800 transition disabled:bg-gray-400"
                    >
                        {loading ? "Menyimpan..." : "Simpan Produk"}
                    </button>
                </form>

            </div>
        </div>
    );
}