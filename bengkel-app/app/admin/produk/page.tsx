"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { 
  ChevronDown, FileText, Printer, Plus, 
  ChevronLeft, ChevronRight, Edit, Trash2, Search, Filter,
  Loader2, Package, Image as ImageIcon
} from "lucide-react";
import { alertError, alertConfirmDelete, alertSuccess } from "@/components/Alert";

/* ================================================================
   INTERFACE
================================================================ */
export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    stock: number;
    jenis_barang: string;
    img_urls: string[];
}

/* ================================================================
   HELPER FUNCTIONS
================================================================ */
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

// ================================================================
// KOMPONEN: ImageCarousel (Mini Preview di Tabel)
// ================================================================
const ImageCarousel = ({ urls, alt }: { urls: string[], alt: string }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const images = Array.isArray(urls) ? urls.filter(Boolean) : [];
    const totalImages = images.length;
    
    // Alamat base Railway
    const BASE_URL = "https://tekweb-uas-production.up.railway.app";

    if (totalImages === 0) {
        return (
            <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-lg border border-gray-200">
                <ImageIcon size={16} className="text-gray-300" />
            </div>
        );
    }

    const getImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        
        // PERBAIKAN: Bersihkan path storage dan arahkan ke folder publik yang benar
        const fileName = url.replace('public/products/', '').replace('products/', '');
        return `${BASE_URL}/storage/products/${fileName}`;
    };

    return (
        <div className="relative w-12 h-12 overflow-hidden rounded-lg border border-gray-200 group bg-white">
            <div 
                className="flex transition-transform duration-300 h-full" 
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
                {images.map((url, i) => (
                    <img 
                        key={i} 
                        src={getImageUrl(url)} 
                        alt={`${alt} ${i}`} 
                        className="w-12 h-12 object-cover shrink-0" 
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `${BASE_URL}/images/default_product.png`;
                        }}
                    />
                ))}
            </div>
            {totalImages > 1 && (
                <div className="absolute inset-0 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity px-0.5 bg-black/10">
                    <button 
                        onClick={(e) => { e.preventDefault(); setActiveIndex((a) => (a - 1 + totalImages) % totalImages) }} 
                        className="bg-white/80 rounded-full p-0.5 shadow-sm hover:bg-white"
                    >
                        <ChevronLeft size={10}/>
                    </button>
                    <button 
                        onClick={(e) => { e.preventDefault(); setActiveIndex((a) => (a + 1) % totalImages) }} 
                        className="bg-white/80 rounded-full p-0.5 shadow-sm hover:bg-white"
                    >
                        <ChevronRight size={10}/>
                    </button>
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
    const [isMount, setIsMount] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua");

    const API_URL = "https://tekweb-uas-production.up.railway.app/api";

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const token = getCookie("token");
            const res = await fetch(`${API_URL}/products`, {
                headers: { 
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
            });

            if (res.status === 401) {
                router.push("/auth/login");
                return;
            }

            const data = await res.json();
            // Mendukung data.products atau data.data dari backend
            const list = data.products ?? data.data ?? [];
            setProducts(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error(err);
            alertError("Gagal sinkronisasi data produk");
        } finally {
            setLoading(false);
        }
    }, [API_URL, router]);

    useEffect(() => {
        setIsMount(true);
        fetchProducts();
    }, [fetchProducts]);

    async function deleteProduct(id: number) {
        try {
            const confirm = await alertConfirmDelete();
            if (!confirm.isConfirmed) return;
            
            const token = getCookie("token");
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: "DELETE",
                headers: { 
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
            });

            if (!res.ok) throw new Error("Gagal menghapus produk");
            
            setProducts(prev => prev.filter(p => p.id !== id));
            alertSuccess("Produk telah dihapus dari database Railway");
        } catch (err: any) {
            alertError(err.message);
        }
    }

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const name = p.name?.toLowerCase() || "";
            const category = p.jenis_barang?.toLowerCase() || "";
            const query = searchQuery.toLowerCase();

            const matchesSearch = name.includes(query) || category.includes(query);
            const matchesCategory = selectedCategory === "Semua" || p.jenis_barang === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    const categories = useMemo(() => {
        const unique = Array.from(new Set(products.map(p => p.jenis_barang).filter(Boolean)));
        return ["Semua", ...unique];
    }, [products]);

    const exportToExcel = () => {
        if (filteredProducts.length === 0) return alertError("Tidak ada data untuk diekspor.");
        setIsDropdownOpen(false);
        
        const exportData = filteredProducts.map(p => ({
            ID: p.id,
            Nama: p.name,
            Kategori: p.jenis_barang,
            Harga: p.price,
            Stok: p.stock
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Produk");
        XLSX.writeFile(workbook, `Inventaris_Bengkel_${new Date().getTime()}.xlsx`);
    };

    if (!isMount) return null;

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#234C6A] text-white rounded-2xl shadow-lg shadow-blue-900/20">
                        <Package size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[#234C6A] tracking-tighter uppercase">Inventaris Produk</h1>
                        <p className="text-sm text-gray-500 font-medium tracking-tight uppercase opacity-60">Safe Storage Railway Active</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                            className="bg-white text-gray-700 px-5 py-3 rounded-2xl border-2 border-gray-100 hover:bg-gray-50 transition-all text-xs font-black uppercase tracking-widest flex items-center shadow-sm"
                        >
                            Ekspor <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                <button onClick={exportToExcel} className="flex items-center w-full px-5 py-4 text-xs font-bold text-gray-600 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                                    <FileText className="w-4 h-4 mr-3 text-emerald-600" /> Excel (.xlsx)
                                </button>
                                <button onClick={() => {setIsDropdownOpen(false); window.print();}} className="flex items-center w-full px-5 py-4 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                    <Printer className="w-4 h-4 mr-3 text-blue-600" /> Cetak (PDF)
                                </button>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => router.push("/admin/produk/create")} 
                        className="bg-[#FF6D1F] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-orange-600 shadow-orange-100 transition-all text-xs font-black uppercase tracking-widest flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Tambah Produk
                    </button>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#FF6D1F] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Cari sparepart atau aksesoris..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl shadow-sm focus:border-[#FF6D1F] focus:outline-none transition-all text-sm font-bold text-slate-700"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl shadow-sm focus:border-[#FF6D1F] focus:outline-none appearance-none text-sm font-bold text-slate-700 cursor-pointer"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {/* TABLE CONTENT */}
            {loading ? (
                <div className="bg-white p-32 rounded-[2.5rem] shadow-sm text-center flex flex-col items-center border border-gray-100">
                    <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={48} />
                    <p className="text-[#234C6A] font-black uppercase tracking-widest text-xs">Sinkronisasi Data...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden shadow-blue-900/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Preview</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama & Kategori</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Harga</th>
                                    <th className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Stok</th>
                                    <th className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-6 w-24">
                                            <ImageCarousel urls={p.img_urls} alt={p.name} />
                                        </td>
                                        <td className="p-6">
                                            <p className="font-black text-[#234C6A] text-base leading-tight mb-1">{p.name}</p>
                                            <span className="text-[9px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-blue-100">
                                                {p.jenis_barang}
                                            </span>
                                        </td>
                                        <td className="p-6 whitespace-nowrap">
                                            <p className="text-sm font-black text-[#FF6D1F]">
                                                Rp {Number(p.price).toLocaleString("id-ID")}
                                            </p>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`text-xs font-black px-4 py-1.5 rounded-xl border ${p.stock < 10 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                {p.stock} Unit
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => router.push(`/admin/produk/edit?id=${p.id}`)} 
                                                    className="p-3 text-blue-500 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                                                    title="Edit Produk"
                                                >
                                                    <Edit size={18}/>
                                                </button>
                                                <button 
                                                    onClick={() => deleteProduct(p.id)} 
                                                    className="p-3 text-red-500 bg-red-50 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                                                    title="Hapus Produk"
                                                >
                                                    <Trash2 size={18}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredProducts.length === 0 && (
                            <div className="p-32 text-center flex flex-col items-center justify-center">
                                <Search className="w-12 h-12 text-gray-200 mb-4" />
                                <h3 className="text-lg font-black text-[#234C6A] uppercase tracking-tighter">Produk Tidak Ditemukan</h3>
                                <p className="text-gray-400 text-sm font-medium mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}