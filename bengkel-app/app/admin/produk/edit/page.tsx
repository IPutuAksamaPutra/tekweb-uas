"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { alertSuccess, alertError, alertLoginRequired, alertConfirmDelete, alertValidation } from "@/components/Alert";

const DEFAULT_IMAGE_URL = "/no-image.png";
const BACKEND_BASE = "http://localhost:8000";

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    // Menggunakan img_urls karena Accessor di Model Laravel Anda menggunakan ini
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

// helper: bangun URL penuh untuk image yang berada di backend/public/images
function buildImageUrl(pathOrUrl?: string | null) {
    if (!pathOrUrl) return DEFAULT_IMAGE_URL;

    // kalau backend sudah mengirim URL lengkap, pakai langsung
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
        return pathOrUrl;
    }

    const cleaned = pathOrUrl.replace(/^\/+/, "");

    if (cleaned.startsWith("storage/")) {
        const after = cleaned.replace(/^storage\/+/, "");
        return `${BACKEND_BASE}/storage/${after}`;
    }

    if (cleaned.startsWith("images/")) {
        return `${BACKEND_BASE}/${cleaned}`;
    }

    return `${BACKEND_BASE}/images/${cleaned}`;
}


export default function EditProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get("id");

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // State untuk menyimpan file baru yang dipilih (sebagai PENGGANTI TOTAL)
    const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
    // State untuk menyimpan URL gambar yang dimuat dari Backend
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    
    // --- LOGIKA FETCH DATA ---

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
                    `http://localhost:8000/api/products/${productId}`,
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
                // Langsung simpan array URL gambar yang sudah jadi dari backend
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
    
    // --- LOGIKA IMAGE PREVIEW, CHANGE, & CLEANUP ---

    // 1. Buat URL objek untuk file baru yang dipilih
    const newPreviewUrls = useMemo(() => {
        return selectedImageFiles.map((file) => URL.createObjectURL(file));
    }, [selectedImageFiles]);

    // 2. Cleanup URL objek saat komponen di-unmount atau state file berubah
    useEffect(() => {
        return () => {
            newPreviewUrls.forEach((url) => {
                if (url.startsWith("blob:")) URL.revokeObjectURL(url);
            });
        };
    }, [newPreviewUrls]);

    // 3. Gabungkan file baru (jika ada) dengan file lama yang sudah ada.
    // Jika ada file baru, hanya gunakan file baru (sebagai pengganti total)
    const currentPreviewUrls = newPreviewUrls.length > 0
        ? newPreviewUrls
        : existingImageUrls;


    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        if (!product) return;
        const name = e.target.name;
        // Penanganan nilai untuk input numerik
        let value: string | number = e.target.value;
        if (name === "price" || name === "stock") value = Number(value);
        setProduct({ ...product, [name]: value });
    };

    // 🔥 MODIFIKASI: Menambahkan file secara akumulatif (tidak menghapus yang sudah dipilih di sesi yang sama)
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const filesArray = Array.from(files);

        // Gabungkan file baru dengan file yang sudah dipilih di sesi ini
        const combinedFiles = [...selectedImageFiles, ...filesArray];
        const finalFiles = combinedFiles.slice(0, 5); // Batasi maks 5

        if (combinedFiles.length > 5) {
            alertError(`Maksimal 5 gambar yang diperbolehkan. Hanya 5 gambar pertama yang diambil.`);
        }

        setSelectedImageFiles(finalFiles);
        
        // Reset nilai input file agar bisa memilih file lagi
        e.target.value = ''; 
    };

    const updateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setIsUpdating(true);

        const token = getCookie("token");
        if (!token) {
            alertError("Sesi berakhir. Silakan login ulang.");
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
        form.append("_method", "PUT");

        // 🔥 LOGIKA PENGIRIMAN: Jika ada file baru, kirim SEMUA file baru.
        // Backend akan menimpa yang lama.
        if (selectedImageFiles.length > 0) {
            selectedImageFiles.forEach((file) => {
                form.append("images[]", file);
            });
        }
        // Jika selectedImageFiles kosong, tidak ada 'images[]' yang dikirim, 
        // sehingga backend akan mempertahankan gambar lama.

        try {
            const res = await fetch(
                `http://localhost:8000/api/products/${product.id}`,
                {
                    method: "POST", // Menggunakan POST untuk method PUT via _method
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: form,
                }
            );

            let data: any = {};
            try {
                data = await res.json();
            } catch (parseErr) {
                data = {};
            }

            if (!res.ok) {
                const errMsg =
                    res.status === 422 && data.errors
                        ? Object.values(data.errors).flat().join("\n")
                        : data.message || `Update gagal. Status: ${res.status}`;
                alert(errMsg);
                return;
            }

            alertSuccess("Produk berhasil diperbarui!");
            router.push("/admin/produk");
        } catch (err) {
            console.error(err);
            alertError("Tidak dapat terhubung ke server.");
        } finally {
            setIsUpdating(false);
            // Cleanup URL objek di finally block
            newPreviewUrls.forEach((url) => {
                if (url.startsWith("blob:")) URL.revokeObjectURL(url);
            });
        }
    };

    if (loading)
        return <p className="text-center mt-10">Memuat data produk...</p>;
    if (!product)
        return (
            <p className="text-center mt-10 text-red-500">Produk tidak ditemukan.</p>
        );

    return (
        <div className="max-w-2xl mx-auto p-5 bg-white shadow-lg rounded-xl mt-6">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
                Edit Produk: {product.name}
            </h1>

            <form onSubmit={updateProduct} className="space-y-3">
                {/* ... (Input teks, harga, stok, jenis, deskripsi tetap sama) ... */}
                
                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                  <input name="name" value={product.name} onChange={handleChange} className="w-full border p-2 rounded mt-1" required/>
                </div>

                {/* Harga */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Harga</label>
                  <input name="price" type="number" step="0.01" value={product.price} onChange={handleChange} className="w-full border p-2 rounded mt-1" required/>
                </div>

                {/* Stok */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stok</label>
                  <input name="stock" type="number" value={product.stock} onChange={handleChange} className="w-full border p-2 rounded mt-1" required/>
                </div>

                {/* Jenis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jenis Barang</label>
                  <select name="jenis_barang" value={product.jenis_barang} onChange={handleChange} className="w-full border p-2 rounded mt-1" required>
                    <option value="" disabled>Pilih jenis</option>
                    {productTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea name="description" value={product.description} onChange={handleChange} className="w-full border p-2 rounded mt-1 h-24" required/>
                </div>


                {/* GAMBAR BARU / PENGGANTI */}
                <div className="border p-3 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ganti Gambar (Maks 5 File)
                    </label>
                    
                    {/* Input File Multi-Upload */}
                    <input
                        type="file"
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleUpload}
                        className="w-full text-sm text-gray-500 mb-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />

                    <p className="text-xs text-gray-500 mb-3">
                       {selectedImageFiles.length > 0 
                           ? `Anda memilih ${selectedImageFiles.length} gambar baru. Gambar lama akan DITIMPA.` 
                           : 'Pilih file baru untuk mengganti semua gambar yang ada.'}
                    </p>

                    {/* Area Preview Gambar */}
                    <div className="flex flex-wrap gap-2 border p-2 rounded-md bg-white">
                        {currentPreviewUrls.map((url, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden shadow">
                                <Image
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    layout="fill"
                                    objectFit="cover"
                                    unoptimized
                                />
                            </div>
                        ))}
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