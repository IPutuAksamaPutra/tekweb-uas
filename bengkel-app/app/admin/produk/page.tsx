"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
}

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from API
  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        credentials: "include",
      });
      setProducts(await res.json());
    } catch (err) {
      alert("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }

  // Delete product
  async function deleteProduct(id: number) {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      fetchProducts();
    } catch (err) {
      alert("Gagal menghapus produk");
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-5xl mx-auto">
      <div className="flex justify-between mb-5">
        <h1 className="text-2xl font-semibold">Manajemen Produk</h1>

        {/* 🔥 Navigate to create page */}
        <button
          onClick={() => router.push("/admin/produk/create")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Tambah Produk
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Memuat produk...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-3 text-left">Gambar</th>
              <th className="p-3 text-left">Nama Produk</th>
              <th className="p-3 text-left">Harga</th>
              <th className="p-3 text-left">Deskripsi</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>

                <td className="p-3">{p.name}</td>

                <td className="p-3">Rp {p.price.toLocaleString()}</td>

                <td className="p-3">{p.description}</td>

                <td className="p-3 space-x-2">
                  {/* 🔥 Edit → go to edit page */}
                  <button
                    onClick={() => router.push(`/admin/products/edit/${p.id}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Tidak ada produk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
