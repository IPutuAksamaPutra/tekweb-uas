"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  img_url: string | null;
  jenis_barang: string;
  stock: number; // ← WAJIB ADA
}

const productTypes = ["Sparepart", "Aksesoris"];

export default function EditProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // ================= GET PRODUK =================
  async function fetchProduct() {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:8000/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.product) {
      setProduct(data.product);
      setPreview(data.product.img_url ? `http://localhost:8000/storage/${data.product.img_url}` : "/no-image.png");
    }
    setLoading(false);
  }

  // ================= UPDATE PRODUK =================
  async function updateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;

    setIsUpdating(true);

    const token = localStorage.getItem("token");
    const form = new FormData();

    form.append("name", product.name);
    form.append("price", product.price.toString());
    form.append("description", product.description);
    form.append("jenis_barang", product.jenis_barang);
    form.append("stock", product.stock.toString());   // ← DIPERIKAN
    form.append("_method", "PUT");

    if (newImageFile) form.append("img_url", newImageFile);

    const res = await fetch(`http://localhost:8000/api/products/${productId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    setIsUpdating(false);

    if (!res.ok) {
      const err = await res.json();
      console.log("Error:", err);
      alert("Update gagal — periksa console log.");
      return;
    }

    alert("Produk berhasil diperbarui!");
    router.push("/admin/produk");
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const getImage = (img: string | null) =>
    img ? `http://localhost:8000/storage/${img}` : "/no-image.png";

  useEffect(() => { fetchProduct(); }, []);

  if (loading) return <p className="text-center mt-10">Memuat...</p>;
  if (!product) return <p className="text-center mt-10 text-red-500">Produk tidak ditemukan</p>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Produk</h1>

      <form onSubmit={updateProduct} className="space-y-5">

        {/* Nama */}
        <div>
          <label>Nama Produk</label>
          <input
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* Harga */}
        <div>
          <label>Harga</label>
          <input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* Stock */}
        <div>
          <label>Stok</label>
          <input
            type="number"
            value={product.stock}
            onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
            className="w-full border p-2 rounded mt-1"
            required
          />
        </div>

        {/* Jenis Barang */}
        <div>
          <label>Jenis Barang</label>
          <select
            value={product.jenis_barang}
            onChange={(e) => setProduct({ ...product, jenis_barang: e.target.value })}
            className="w-full border p-2 rounded mt-1"
            required
          >
            <option value="">Pilih jenis</option>
            {productTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Deskripsi */}
        <div>
          <label>Deskripsi</label>
          <textarea
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            className="w-full border p-2 rounded mt-1 h-24"
          />
        </div>

        {/* Gambar */}
        <div className="flex gap-4 items-center">
          <Image
            src={preview ?? getImage(product.img_url)}
            alt="Preview"
            width={100}
            height={100}
            className="rounded shadow object-cover"
            unoptimized
          />
          <input type="file" accept="image/*" onChange={handleUpload}/>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
