"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  ShoppingCart, 
  ChevronRight, 
  Star, 
  Package, 
  Loader2,
  RefreshCw,
  AlertCircle // 🔥 Impor ini ditambahkan untuk memperbaiki error Anda
} from "lucide-react";
import { useRouter } from "next/navigation";
import { alertError } from "@/components/Alert";

/* ======================= TYPES ======================= */
interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock: number;
  jenis_barang: string;
  img_url: string[]; 
}

// Menggunakan Proxy /api/railway sesuai konfigurasi next.config.js Anda
const API_URL = "/api/railway"; 
const BASE_URL = "https://tekweb-uas-production.up.railway.app";

export default function MarketplacePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isMount, setIsMount] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const getToken = useCallback(() => {
    if (typeof document === "undefined") return null;
    return document.cookie.match(/token=([^;]+)/)?.[1] || null;
  }, []);

  /* ======================= FETCH PRODUCTS ======================= */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      
      // Menangani error 502 jika Railway sedang crashed
      if (res.status === 502) {
        throw new Error("Server Railway (502) sedang offline atau crashed.");
      }
      
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      
      const data = await res.json();
      const list = data.products || data.data || data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error("DEBUG FETCH ERROR:", err.message);
      setErrorStatus(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ======================= FETCH CART COUNT ======================= */
  const updateCartCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const req = await fetch(`${API_URL}/cart`, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Accept": "application/json" 
        }
      });
      if (req.ok) {
        const res = await req.json();
        setCartCount((res.cart_items || res.data || []).length);
      }
    } catch (err) {
      console.warn("Update keranjang gagal karena server bermasalah.");
    }
  }, [getToken]);

  useEffect(() => {
    setIsMount(true);
    fetchProducts();
    updateCartCount();
  }, [fetchProducts, updateCartCount]);

  /* ======================= HELPERS ======================= */
  const getProductImage = (p: Product) => {
    const rawImg = p.img_url?.[0]; 
    if (!rawImg) return "https://placehold.co/400x400?text=No+Image";
    const cleanImg = rawImg.replace("public/products/", "").replace("products/", "");
    return `${BASE_URL}/storage/products/${cleanImg}`;
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || p.jenis_barang === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isMount) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* HEADER SECTION */}
      <div className="bg-[#234C6A] text-white p-10 rounded-b-[3.5rem] shadow-2xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Marketplace</h1>
          <button onClick={() => router.push("/cart")} className="relative p-4 bg-white/10 rounded-2xl hover:bg-[#FF6D1F] transition-all">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF6D1F] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#234C6A]">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-4xl mx-auto mt-10 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Cari kebutuhan motor kamu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-800 p-5 pl-14 rounded-2xl font-black shadow-2xl outline-none focus:ring-4 focus:ring-orange-500/20 transition-all placeholder:text-gray-300 placeholder:font-bold"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        {/* FILTER KATEGORI */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
          {["Semua", "Sparepart", "Aksesoris"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border-2
                ${selectedCategory === cat 
                  ? "bg-[#FF6D1F] border-[#FF6D1F] text-white shadow-lg shadow-orange-200" 
                  : "bg-white border-transparent text-gray-400 hover:border-gray-100"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* LOGIKA TAMPILAN (LOADING / ERROR / DATA) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-[#FF6D1F] mb-4" size={48} />
            <p className="font-black text-[#234C6A] uppercase text-[10px] tracking-widest">Menyambungkan ke Railway...</p>
          </div>
        ) : errorStatus ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-red-50 shadow-xl mx-auto max-w-2xl">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h3 className="text-xl font-black text-red-600 uppercase tracking-tighter">Backend Sedang Bermasalah</h3>
            <p className="text-gray-400 font-bold text-xs mt-2 px-6 uppercase tracking-widest">{errorStatus}</p>
            <button 
              onClick={fetchProducts} 
              className="mt-8 px-8 py-4 bg-[#234C6A] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 mx-auto hover:bg-[#FF6D1F] transition-all shadow-lg active:scale-95"
            >
              <RefreshCw size={18} /> Coba Hubungkan Kembali
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <Package className="mx-auto text-gray-200 mb-4" size={64} />
            <h3 className="text-xl font-black text-[#234C6A] uppercase tracking-tighter">Produk Tidak Ditemukan</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => router.push(`/marketplace/detail-produk/${product.slug}`)}
                className="bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl transition-all cursor-pointer group border border-transparent hover:border-gray-50"
              >
                <div className="aspect-square bg-gray-50 rounded-4xl overflow-hidden mb-4 p-4">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/400x400?text=Error+Image"; }}
                  />
                </div>
                <h2 className="font-black text-[#234C6A] text-lg uppercase truncate">{product.name}</h2>
                <p className="text-[#FF6D1F] font-black text-2xl tracking-tighter">Rp {Number(product.price).toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}