"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { alertSuccess, alertError, alertLoginRequired, alertConfirmDelete } from "@/components/Alert";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const productId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");

  // Fetch existing product
  async function fetchProduct() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`,
        { credentials: "include" }
      );
      const data = await res.json();

      setName(data.name);
      setPrice(data.price.toString());
      setDesc(data.description);
      setImage(data.image_url);
    } catch (err) {
      alertError("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  }

  // Save product update
  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      price: Number(price),
      description: desc,
      image_url: image,
    };

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      alertSuccess("Produk berhasil diperbarui!");
      router.push("/admin/products");
    } catch (err) {
      alertError("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchProduct();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-500 p-6">
        Memuat data produk...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Produk</h1>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="text"
          placeholder="Nama Produk"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Harga"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Deskripsi"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="URL Gambar"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
