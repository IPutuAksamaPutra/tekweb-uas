"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // VALIDASI
    if (!imageFile) {
      alert("Gambar wajib di-upload!");
      setLoading(false);
      return;
    }

    // FormData untuk upload file
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("price", formData.price);
    payload.append("image", imageFile); // FILE IMAGE

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        credentials: "include",
        body: payload, // tanpa headers JSON
      });

      if (!res.ok) {
        alert("Gagal membuat produk!");
        return;
      }

      alert("Produk berhasil dibuat!");
      router.push("/admin/products");
    } catch (error) {
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Tambah Produk Baru</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nama Produk */}
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

          {/* Deskripsi */}
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

          {/* Harga */}
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

          {/* Upload Gambar */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload Gambar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded px-3 py-2"
              required
            />

            {/* Preview */}
            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                className="w-32 h-32 object-cover mt-3 rounded"
              />
            )}
          </div>

          {/* Submit */}
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
