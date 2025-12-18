"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { 
  ChevronDown, FileText, Printer, Plus, 
  ChevronLeft, ChevronRight, Edit, Trash2, Search, Filter 
} from "lucide-react";
import { alertError, alertConfirmDelete, alertSuccess } from "@/components/Alert";

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
// KOMPONEN: ImageCarousel
// ================================================================
const ImageCarousel = ({ urls, alt }: { urls: string[], alt: string }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const totalImages = urls.length;
    
    if (totalImages === 0) return <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 rounded">No Image</div>;

    return (
        <div className="relative w-12 h-12 overflow-hidden rounded border border-gray-100 group">
            <div className="flex transition-transform duration-300 h-full" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                {urls.map((url, i) => (
                    <img key={i} src={url.startsWith('http') ? url : `http://localhost:8000/images/${url}`} alt={alt} className="w-12 h-12 object-cover shrink-0" />
                ))}
            </div>
            {totalImages > 1 && (
                <div className="absolute inset-0 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity px-0.5">
                    <button onClick={(e) => {e.stopPropagation(); setActiveIndex((a) => (a - 1 + totalImages) % totalImages)}} className="bg-black/50 text-white rounded-full p-0.5"><ChevronLeft size={8}/></button>
                    <button onClick={(e) => {e.stopPropagation(); setActiveIndex((a) => (a + 1) % totalImages)}} className="bg-black/50 text-white rounded-full p-0.5"><ChevronRight size={8}/></button>
                </div>
            )}
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
    
    // 🔥 State Baru untuk Search & Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua");

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
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Gagal menghapus produk");
            
            setProducts(prev => prev.filter(p => p.id !== id));
            alertSuccess("Produk berhasil dihapus");
        } catch (err: any) {
            alertError(err.message);
        }
    }

    useEffect(() => { fetchProducts(); }, []);

    // 🔥 LOGIKA FILTERING (useMemo agar performa kencang)
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.jenis_barang.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "Semua" || p.jenis_barang === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    // 🔥 Ambil list kategori unik untuk dropdown filter
    const categories = useMemo(() => {
        const unique = Array.from(new Set(products.map(p => p.jenis_barang)));
        return ["Semua", ...unique];
    }, [products]);

    const exportToExcel = () => {
        if (filteredProducts.length === 0) return alertError("Tidak ada data untuk diekspor.");
        setIsDropdownOpen(false);
        const worksheet = XLSX.utils.json_to_sheet(filteredProducts);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Produk");
        XLSX.writeFile(workbook, `Data_Produk_${new Date().getTime()}.xlsx`);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
                    <p className="text-sm text-gray-500">Total: {filteredProducts.length} Produk ditemukan</p>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-center bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg border hover:bg-gray-200 transition-all text-sm font-medium">
                            Ekspor <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
                                <button onClick={exportToExcel} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b"><FileText className="w-4 h-4 mr-2 text-emerald-600" /> Excel (.xlsx)</button>
                                <button onClick={() => {setIsDropdownOpen(false); window.print();}} className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"><Printer className="w-4 h-4 mr-2 text-blue-600" /> Cetak PDF</button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => router.push("/admin/produk/create")} className="flex-1 sm:flex-none flex items-center justify-center bg-[#FF6D1F] text-white px-5 py-2.5 rounded-lg shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all text-sm font-bold">
                        <Plus className="w-5 h-5 mr-1" /> Tambah Produk
                    </button>
                </div>
            </div>

            {/* 🔥 --- SEARCH & FILTER BAR --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Cari nama produk atau jenis barang..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-sm"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none text-sm transition-all"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {/* --- CONTENT --- */}
            {loading ? (
                <div className="bg-white p-20 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Menyelaraskan data...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Info</th>
                                    <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Nama & Kategori</th>
                                    <th className="p-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Harga</th>
                                    <th className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Stok</th>
                                    <th className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4 w-20"><ImageCarousel urls={p.img_urls} alt={p.name} /></td>
                                        <td className="p-4">
                                            <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">{p.jenis_barang}</span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-700">Rp {Number(p.price).toLocaleString("id-ID")}</td>
                                        <td className="p-4 text-center">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-lg ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => router.push(`/admin/produk/edit?id=${p.id}`)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit size={18}/></button>
                                                <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredProducts.length === 0 && (
                            <div className="p-20 text-center">
                                <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Produk "{searchQuery}" tidak ditemukan.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}