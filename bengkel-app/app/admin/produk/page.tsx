'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { 
  ChevronDown, FileText, Plus, 
  Edit, Trash2, Search, Package, Image as ImageIcon
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

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMount, setIsMount] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua");

    const API_URL = "https://tekweb-uas-production.up.railway.app/api";
    const BASE_IMAGE_URL = "https://tekweb-uas-production.up.railway.app/storage/products/";

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const token = getCookie("token");
            const res = await fetch(`${API_URL}/products`, {
                headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
            });
            const data = await res.json();
            const list = data.products ?? data.data ?? [];
            setProducts(Array.isArray(list) ? list : []);
        } catch (err) { alertError("Gagal sinkronisasi data"); } finally { setLoading(false); }
    }, [API_URL]);

    useEffect(() => { setIsMount(true); fetchProducts(); }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch = (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "Semua" || p.jenis_barang === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    const categories = useMemo(() => {
        const unique = Array.from(new Set(products.map(p => p.jenis_barang).filter(Boolean)));
        return ["Semua", ...unique];
    }, [products]);

    const exportToExcel = () => {
        if (filteredProducts.length === 0) {
            alertError("Data kosong, tidak bisa diekspor!");
            return;
        }

        const exportData = filteredProducts.map(p => ({
            ID: p.id,
            Nama: p.name,
            Kategori: p.jenis_barang,
            Harga: p.price,
            Stok: p.stock
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventaris");
        XLSX.writeFile(workbook, `Inventaris_Bengkel.xlsx`);
    };

    if (!isMount) return null;

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">

            {/* HEADER WEB */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-4xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#234C6A] text-white rounded-2xl shadow-lg">
                        <Package size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[#234C6A] tracking-tighter uppercase">Inventaris Produk</h1>
                        <p className="text-sm text-gray-500 font-medium uppercase opacity-60">Railway Storage Active</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <div className="relative">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="bg-white text-gray-700 px-5 py-3 rounded-2xl border-2 border-gray-100 hover:bg-gray-50 transition-all text-xs font-black uppercase tracking-widest flex items-center">
                            Ekspor <ChevronDown className={`w-4 h-4 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                <button onClick={exportToExcel} className="flex items-center w-full px-5 py-4 text-xs font-bold text-gray-600 hover:bg-gray-50 border-b border-gray-50">
                                    <FileText className="w-4 h-4 mr-3 text-emerald-600" /> Excel (.xlsx)
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => router.push("/admin/produk/create")} className="bg-[#FF6D1F] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-orange-600 text-xs font-black uppercase tracking-widest flex items-center">
                        <Plus className="w-5 h-5 mr-2" /> Tambah Produk
                    </button>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Cari sparepart..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl shadow-sm focus:border-[#FF6D1F] focus:outline-none text-sm font-bold" />
                </div>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-sm focus:border-[#FF6D1F] text-sm font-bold">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            {/* TABEL WEB */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Preview</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama & Kategori</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Harga</th>
                                <th className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Stok</th>
                                <th className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6">
                                        {p.img_urls && p.img_urls[0] ? (
                                            <img 
                                                src={p.img_urls[0].startsWith('http') ? p.img_urls[0] : BASE_IMAGE_URL + p.img_urls[0].split('/').pop()} 
                                                className="w-12 h-12 rounded-lg object-cover border border-gray-100" 
                                                alt="thumb" 
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100"><ImageIcon className="text-gray-300" size={16}/></div>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <p className="font-black text-[#234C6A] text-base leading-tight mb-1">{p.name}</p>
                                        <span className="text-[9px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-blue-100">{p.jenis_barang}</span>
                                    </td>
                                    <td className="p-6 font-black text-[#FF6D1F]">Rp {Number(p.price).toLocaleString("id-ID")}</td>
                                    <td className="p-6 text-center">
                                        <span className={`text-xs font-black px-4 py-1.5 rounded-xl border ${p.stock < 10 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{p.stock} Unit</span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => router.push(`/admin/produk/edit?id=${p.id}`)} className="p-3 text-blue-500 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all"><Edit size={18}/></button>
                                            <button onClick={() => alertConfirmDelete()} className="p-3 text-red-500 bg-red-50 hover:bg-red-600 hover:text-white rounded-2xl transition-all"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
