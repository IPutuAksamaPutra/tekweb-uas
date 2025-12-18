"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { 
  ChevronDown, FileText, Printer, Plus, 
  ChevronLeft, ChevronRight, Edit, Trash2, Package 
} from "lucide-react";
import { alertError, alertConfirmDelete } from "@/components/Alert";

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
// KOMPONEN: ImageCarousel (Tetap Sama)
// ================================================================
interface ImageCarouselProps {
    urls: string[];
    alt: string;
}

const ImageCarousel = ({ urls, alt }: ImageCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const totalImages = urls.length;
    
    if (totalImages === 0) {
        return <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 rounded">No Image</div>;
    }

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveIndex((current) => (current + 1) % totalImages);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveIndex((current) => (current - 1 + totalImages) % totalImages);
    };

    if (totalImages === 1) {
        return <img src={urls[0]} alt={alt} className="w-16 h-16 object-cover rounded shadow-sm" />;
    }
    
    return (
        <div className="relative w-16 h-16 overflow-hidden rounded shadow-sm group">
            <div
                className="flex transition-transform duration-300 ease-in-out h-full"
                style={{ 
                    width: `${totalImages * 100}%`, 
                    transform: `translateX(-${activeIndex * (100 / totalImages)}%)`, 
                }}
            >
                {urls.map((url, i) => (
                    <img
                        key={i}
                        src={url}
                        alt={`${alt} ${i + 1}`}
                        className="h-full object-cover shrink-0"
                        style={{ width: `${100 / totalImages}%` }}
                    />
                ))}
            </div>
            <button onClick={prevImage} className="absolute inset-y-0 left-0 p-0.5 bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={10}/></button>
            <button onClick={nextImage} className="absolute inset-y-0 right-0 p-0.5 bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={10}/></button>
        </div>
    );
};

// ================================================================
// KOMPONEN UTAMA
// ================================================================
export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // --- Logika Fungsi (Tidak Berubah) ---
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
            alertError("Gagal menghapus produk");
        }
    }

    useEffect(() => { fetchProducts(); }, []);

    const exportToExcel = () => {
        if (products.length === 0) return alertError("Tidak ada data.");
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
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(data, `Data_Produk_${new Date().getTime()}.xlsx`);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manajemen Produk</h1>
                
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {/* Dropdown Ekspor */}
                    <div className="relative flex-1 sm:flex-none">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700 transition-all text-sm"
                        >
                            Cetak <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-30 overflow-hidden">
                                <button onClick={exportToExcel} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b">
                                    <FileText className="w-4 h-4 mr-2 text-emerald-600" /> Excel
                                </button>
                                <button onClick={() => {setIsDropdownOpen(false); window.print();}} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                                    <Printer className="w-4 h-4 mr-2 text-blue-600" /> PDF
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tambah Produk */}
                    <button
                        onClick={() => router.push("/admin/produk/create")}
                        className="flex-1 sm:flex-none flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Tambah
                    </button>
                </div>
            </div>

            {/* --- CONTENT --- */}
            {loading ? (
                <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">Memuat data produk...</div>
            ) : (
                <>
                    {/* Tampilan Desktop (Table) */}
                    <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Gambar</th>
                                        <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Nama Produk</th>
                                        <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Harga</th>
                                        <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Deskripsi</th>
                                        <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4"><ImageCarousel urls={p.img_urls} alt={p.name} /></td>
                                            <td className="p-4 font-medium">{p.name}</td>
                                            <td className="p-4 whitespace-nowrap">Rp {Number(p.price).toLocaleString("id-ID")}</td>
                                            <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{p.description}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => router.push(`/admin/produk/edit?id=${p.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit size={18}/></button>
                                                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Hapus"><Trash2 size={18}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tampilan Mobile (Card List) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {products.map((p) => (
                            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                <div className="flex gap-4">
                                    <ImageCarousel urls={p.img_urls} alt={p.name} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 truncate">{p.name}</h3>
                                        <p className="text-green-600 font-semibold">Rp {Number(p.price).toLocaleString("id-ID")}</p>
                                        <p className="text-xs text-gray-400">Stok: {p.stock}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                                <div className="flex gap-2 pt-2 border-t">
                                    <button onClick={() => router.push(`/admin/produk/edit?id=${p.id}`)} className="flex-1 flex justify-center items-center py-2 bg-blue-50 text-blue-600 rounded text-sm font-medium"><Edit size={16} className="mr-2"/> Edit</button>
                                    <button onClick={() => deleteProduct(p.id)} className="flex-1 flex justify-center items-center py-2 bg-red-50 text-red-600 rounded text-sm font-medium"><Trash2 size={16} className="mr-2"/> Hapus</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-xl shadow text-gray-400">Tidak ada produk tersedia.</div>
                    )}
                </>
            )}
        </div>
    );
}