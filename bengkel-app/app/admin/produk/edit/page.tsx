"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// Definisi tipe Product
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  img_url: string | null;
  jenis_barang: string;
  stock: number;
}

const productTypes = ["Sparepart", "Aksesoris"];

// Helper ambil cookie
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export default function EditProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("/no-image.png");

  // ================= Fetch produk =================
  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const token = getCookie("token");
    if (!token) {
      alert("Sesi berakhir. Silakan login ulang.");
      router.push("/auth/login");
      return;
    }

    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:8000/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          alert(`Gagal memuat produk. Status: ${res.status}`);
          router.push("/admin/produk");
          return;
        }

        const data = await res.json();
        const prod: Product = data.product;
        setProduct(prod);
        setPreviewUrl(prod.img_url ?? "/no-image.png");
      } catch (err) {
        console.error(err);
        alert("Tidak dapat terhubung ke server.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId, router]);

  // ================= Handlers =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!product) return;
    const name = e.target.name;
    let value: string | number = e.target.value;
    if (name === "price" || name === "stock") value = Number(value);
    setProduct({ ...product, [name]: value });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsUpdating(true);
    const token = getCookie("token");
    if (!token) {
      alert("Sesi berakhir. Silakan login ulang.");
      router.push("/auth/login");
      setIsUpdating(false);
      return;
    }

    const form = new FormData();
    form.append("name", product.name);
    form.append("price", product.price.toString());
    form.append("description", product.description);
    form.append("jenis_barang", product.jenis_barang);
    form.append("stock", product.stock.toString());
    form.append("_method", "PUT"); // method spoofing Laravel

    if (newImageFile) form.append("img_url", newImageFile);

    try {
      const res = await fetch(`http://localhost:8000/api/products/${product.id}`, {
        method: "POST", // Laravel PUT via FormData
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg =
          res.status === 422 && data.errors
            ? Object.values(data.errors).flat().join("\n")
            : data.message || `Update gagal. Status: ${res.status}`;
        alert(errMsg);
        return;
      }

      alert("Produk berhasil diperbarui!");
      router.push("/admin/produk");
    } catch (err) {
      console.error(err);
      alert("Tidak dapat terhubung ke server.");
    } finally {
      setIsUpdating(false);
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    }
  };

  // ================= Render =================
  if (loading) return <p className="text-center mt-10">Memuat data produk...</p>;
  if (!product) return <p className="text-center mt-10 text-red-500">Produk tidak ditemukan.</p>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Edit Produk: {product.name}</h1>
      <form onSubmit={updateProduct} className="space-y-5">
        {/* Nama */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
          <input
            name="name"
            value={product?.name ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Harga */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Harga</label>
          <input
            name="price"
            type="number"
            step="0.01"
            value={product?.price ?? 0}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stok</label>
          <input
            name="stock"
            type="number"
            value={product?.stock ?? 0}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Jenis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Jenis Barang</label>
          <select
            name="jenis_barang"
            value={product?.jenis_barang ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="" disabled>
              Pilih jenis
            </option>
            {productTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            name="description"
            value={product?.description ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1 h-24 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Gambar */}
        <div className="flex gap-4 items-center border p-4 rounded-lg bg-gray-50">
          <Image
            src={previewUrl ?? "/no-image.png"}
            alt="Preview Produk"
            width={100}
            height={100}
            className="rounded-lg shadow-md object-cover shrink-0"
            unoptimized
          />
          <div className="grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ganti Gambar</label>
            <input type="file" name="img_url" accept="image/*" onChange={handleUpload} className="w-full text-sm text-gray-500" />
            <p className="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengganti gambar.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold transition duration-150 disabled:bg-gray-400"
        >
          {isUpdating ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
