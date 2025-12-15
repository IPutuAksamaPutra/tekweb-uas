"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// Impor ikon dari Lucide React
import { ChevronDown, FileText, Printer, Plus, ChevronLeft, ChevronRight } from "lucide-react"; // <-- Menambahkan ikon panah
import { alertSuccess, alertError, alertLoginRequired, alertConfirmDelete } from "@/components/Alert";

export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    stock: number;
    jenis_barang: string;
    img_urls: string[];
}

function getCookie(name: string) {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

// ================================================================
// KOMPONEN BARU: ImageCarousel
// ================================================================
interface ImageCarouselProps {
    urls: string[];
    alt: string;
}

const ImageCarousel = ({ urls, alt }: ImageCarouselProps) => {
    // State untuk melacak indeks gambar yang sedang ditampilkan
    const [activeIndex, setActiveIndex] = useState(0);

    const totalImages = urls.length;
    
    if (totalImages === 0) {
        return <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded">No Image</div>;
    }

    const nextImage = () => {
        setActiveIndex((current) => (current + 1) % totalImages);
    };

    const prevImage = () => {
        setActiveIndex((current) => (current - 1 + totalImages) % totalImages);
    };

    // Jika hanya 1 gambar, tampilkan saja tanpa panah/carousel
    if (totalImages === 1) {
        return (
            <img
                src={urls[0]}
                alt={alt}
                className="w-16 h-16 object-cover rounded"
            />
        );
    }
    
    // Logika untuk menampilkan beberapa gambar dalam satu area 16x16
    return (
        <div className="relative w-16 h-16 overflow-hidden rounded shadow-md">
            {/* Kontainer semua gambar - di-transform untuk efek geser */}
            <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ 
                    width: `${totalImages * 100}%`, // Total lebar (misal: 2 gambar = 200%)
                    transform: `translateX(-${activeIndex * (100 / totalImages)}%)`, // Geser berdasarkan indeks aktif
                }}
            >
                {urls.map((url, i) => (
                    <img
                        key={i}
                        src={url}
                        alt={`${alt} ${i + 1}`}
                        className="w-16 h-16 object-cover shrink-0" // Lebar 1/N dari totalImages*100%
                        style={{ width: `${100 / totalImages}%` }}
                    />
                ))}
            </div>

            {/* Tombol Kontrol */}
            <button
                onClick={prevImage}
                className="absolute top-0 left-0 h-full p-0.5 bg-black bg-opacity-30 text-white flex items-center hover:bg-opacity-50 transition-colors"
                aria-label="Previous image"
            >
                <ChevronLeft size={10} />
            </button>
            <button
                onClick={nextImage}
                className="absolute top-0 right-0 h-full p-0.5 bg-black bg-opacity-30 text-white flex items-center hover:bg-opacity-50 transition-colors"
                aria-label="Next image"
            >
                <ChevronRight size={10} />
            </button>
            
            {/* Indikator Titik */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-1 p-0.5">
                {urls.map((_, i) => (
                    <span 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full ${i === activeIndex ? 'bg-white' : 'bg-gray-400 bg-opacity-70'}`}
                    ></span>
                ))}
            </div>
        </div>
    );
};
// ================================================================
// AKHIR: ImageCarousel
// ================================================================


export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // --- Fungsi Data (fetchProducts, deleteProduct, useEffect) ---

    async function fetchProducts() {
        setLoading(true);
        try {
            const token = getCookie("token");
            const res = await fetch(`http://localhost:8000/api/products`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setProducts(data.products ?? []);
        } catch (err) {
            console.error(err);
            alertError("Gagal memuat produk");
        } finally {
            setLoading(false);
        }
    }

    async function deleteProduct(id: number) {
        try {
            const confirm = await alertConfirmDelete();
            if (!confirm.isConfirmed) return;
            const token = getCookie("token");
            const res = await fetch(`http://localhost:8000/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Gagal menghapus produk");
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            alertError("Gagal menghapus produk");
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    // --- Fungsi Ekspor ---

    const exportToExcel = () => {
        if (products.length === 0) {
            alertError("Tidak ada data untuk diekspor.");
            return;
        }
        
        setIsDropdownOpen(false);

        const dataForExport = products.map((p) => ({
            ID: p.id,
            "Nama Produk": p.name,
            Harga: p.price,
            Deskripsi: p.description,
            Stok: p.stock,
            "Jenis Barang": p.jenis_barang,
            "URL Gambar": p.img_urls.join(", "),
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Produk");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(data, "Data_Produk_" + new Date().getTime() + ".xlsx");
    };

    const printToPDF = () => {
        setIsDropdownOpen(false);
        window.print();
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow max-w-5xl mx-auto">
            <div className="flex justify-between mb-5 items-center">
                <h1 className="text-2xl font-semibold">Manajemen Produk</h1>
                <div className="flex space-x-3">
                    {/* Dropdown Cetak/Ekspor */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                        >
                            Cetak / Ekspor
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                        </button>
                        
                        {/* Konten Dropdown */}
                        {isDropdownOpen && (
                            <div 
                                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                                onBlur={() => setIsDropdownOpen(false)}
                            >
                                <button
                                    onClick={exportToExcel}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <FileText className="w-4 h-4 mr-2 text-emerald-600" />
                                    Ekspor ke Excel
                                </button>
                                <button
                                    onClick={printToPDF}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Printer className="w-4 h-4 mr-2 text-red-600" />
                                    Cetak (PDF)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tombol Tambah Produk */}
                    <button
                        onClick={() => router.push("/admin/produk/create")}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Produk
                    </button>
                </div>
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
                                    {/* 🔥 MENGGANTI LOOP GAMBAR DENGAN CAROUSEL */}
                                    <ImageCarousel 
                                        urls={p.img_urls} 
                                        alt={p.name} 
                                    />
                                </td>
                                <td className="p-3">{p.name}</td>
                                <td className="p-3">
                                    Rp {Number(p.price).toLocaleString("id-ID")}
                                </td>
                                <td className="p-3">{p.description}</td>
                                <td className="p-3 space-x-2">
                                    <button
                                        onClick={() => router.push(`/admin/produk/edit?id=${p.id}`)}
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