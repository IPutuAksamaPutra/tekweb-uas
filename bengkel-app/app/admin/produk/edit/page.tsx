"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { alertSuccess, alertError } from "@/components/Alert";

const DEFAULT_IMAGE_URL = "/no-image.png";
const BACKEND_BASE = "http://localhost:8000";

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    img_url: string[]; 
    jenis_barang: string;
    stock: number;
}

const productTypes = ["Sparepart", "Aksesoris"];

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

// Komponen Konten Utama (Terpisah agar bisa dibungkus Suspense)
function EditProductContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get("id"); // Mengambil ID dari URL

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    
    useEffect(() => {
        if (!productId) {
            setLoading(false);
            return;
        }

        const token = getCookie("token");
        if (!token) {
            alertError("Sesi berakhir. Silakan login ulang.");
            router.push("/auth/login");
            return;
        }

        async function fetchProduct() {
            try {
                const res = await fetch(
                    `${BACKEND_BASE}/api/products/${productId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!res.ok) {
                    alertError(`Gagal memuat produk. Status: ${res.status}`);
                    router.push("/admin/produk");
                    return;
                }

                const data = await res.json();
                const prod: Product = data.product;

                setProduct(prod);
                setExistingImageUrls(prod.img_url || []); 
                
            } catch (err) {
                console.error(err);
                alertError("Tidak dapat terhubung ke server.");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [productId, router]);
    
    const newPreviewUrls = useMemo(() => {
        return selectedImageFiles.map((file) => URL.createObjectURL(file));
    }, [selectedImageFiles]);

    useEffect(() => {
        return () => {
            newPreviewUrls.forEach((url) => {
                if (url.startsWith("blob:")) URL.revokeObjectURL(url);
            });
        };
    }, [newPreviewUrls]);

    const currentPreviewUrls = newPreviewUrls.length > 0
        ? newPreviewUrls
        : existingImageUrls;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        if (!product) return;
        const name = e.target.name;
        let value: string | number = e.target.value;
        if (name === "price" || name === "stock") value = Number(value);
        setProduct({ ...product, [name]: value });
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const filesArray = Array.from(files);
        const combinedFiles = [...selectedImageFiles, ...filesArray];
        const finalFiles = combinedFiles.slice(0, 5); 

        if (combinedFiles.length > 5) {
            alertError(`Maksimal 5 gambar diperbolehkan.`);
        }
        setSelectedImageFiles(finalFiles);
        e.target.value = ''; 
    };

    const updateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        setIsUpdating(true);

        const token = getCookie("token");
        const form = new FormData();
        form.append("name", product.name);
        form.append("price", product.price.toString());
        form.append("description", product.description);
        form.append("jenis_barang", product.jenis_barang);
        form.append("stock", product.stock.toString());
        form.append("_method", "PUT");

        if (selectedImageFiles.length > 0) {
            selectedImageFiles.forEach((file) => {
                form.append("images[]", file);
            });
        }

        try {
            const res = await fetch(
                `${BACKEND_BASE}/api/products/${product.id}`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: form,
                }
            );

            if (!res.ok) {
                alertError("Update gagal.");
                return;
            }

            alertSuccess("Produk berhasil diperbarui!");
            router.push("/admin/produk");
        } catch (err) {
            alertError("Terjadi kesalahan jaringan.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <p className="text-center mt-10">Memuat data...</p>;

    return (
        <div className="max-w-2xl mx-auto p-5 bg-white shadow-lg rounded-xl mt-6">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
                Edit Produk: {product?.name}
            </h1>

            <form onSubmit={updateProduct} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                  <input name="name" value={product?.name || ""} onChange={handleChange} className="w-full border p-2 rounded mt-1" required/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Harga</label>
                  <input name="price" type="number" step="0.01" value={product?.price || 0} onChange={handleChange} className="w-full border p-2 rounded mt-1" required/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stok</label>
                  <input name="stock" type="number" value={product?.stock || 0} onChange={handleChange} className="w-full border p-2 rounded mt-1" required/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Jenis Barang</label>
                  <select name="jenis_barang" value={product?.jenis_barang || ""} onChange={handleChange} className="w-full border p-2 rounded mt-1" required>
                    <option value="" disabled>Pilih jenis</option>
                    {productTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea name="description" value={product?.description || ""} onChange={handleChange} className="w-full border p-2 rounded mt-1 h-24" required/>
                </div>

                <div className="border p-3 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ganti Gambar (Maks 5 File)</label>
                    <input type="file" multiple accept="image/*" onChange={handleUpload} className="w-full text-sm text-gray-500 mb-3" />
                    <div className="flex flex-wrap gap-2 border p-2 rounded-md bg-white">
                        {currentPreviewUrls.map((url, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden shadow">
                                <Image src={url} alt="Preview" layout="fill" objectFit="cover" unoptimized />
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" disabled={isUpdating} className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold disabled:bg-gray-400">
                    {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}

// Komponen Export Utama (Membungkus Konten dengan Suspense untuk Vercel)
export default function EditProductPage() {
    return (
        <Suspense fallback={<p className="text-center mt-10">Memuat halaman...</p>}>
            <EditProductContent />
        </Suspense>
    );
}