"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, Plus, Minus, ShoppingCart, Check, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { alertLoginRequired, alertSuccess, alertError } from "@/components/Alert";

/* ======================= TYPES ======================= */
interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    original_price?: number;
    img_url: string[];
  };
}

const formatRupiah = (value: number) =>
  "Rp " + value.toLocaleString("id-ID");

const BASE_URL = "https://tekweb-uas-production.up.railway.app";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [isMount, setIsMount] = useState(false);

  // Helper Ambil Token
  const getToken = useCallback(() => {
    if (typeof document === "undefined") return null;
    return document.cookie.match(/token=([^;]+)/)?.[1] || null;
  }, []);

  // Ambil Data Keranjang
  const fetchCart = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/cart`, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Accept": "application/json" 
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        // Normalisasi data untuk memastikan price adalah number dan img_url adalah array
        const rawItems = data.cart_items || data.data || [];
        const normalized: CartItem[] = rawItems.map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            price: Number(item.product.price),
            img_url: Array.isArray(item.product.img_url) 
              ? item.product.img_url 
              : (item.product.img_urls ? item.product.img_urls : [item.product.img_url]),
          },
        }));
        setCart(normalized);
      }
    } catch (err) { 
      console.error("Gagal mengambil keranjang:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [getToken]);

  useEffect(() => {
    setIsMount(true);
    const token = getToken();
    if (!token) {
      alertLoginRequired().then((res) => { 
        if (res.isConfirmed) router.push("/auth/login"); 
      });
      setLoading(false);
    } else { 
      fetchCart(); 
    }
  }, [fetchCart, getToken, router]);

  // Logika Gambar (Safe Array Access)
  const getCartImageUrl = (imgArray: any) => {
    // Jika data gambar tersimpan sebagai string JSON dalam array
    let targetImg = Array.isArray(imgArray) ? imgArray[0] : imgArray;
    
    if (!targetImg) return "/no-image.png";
    if (typeof targetImg === 'string' && targetImg.startsWith("http")) return targetImg;
    
    // Pembersihan path storage Laravel
    const fileName = String(targetImg)
      .replace("public/products/", "")
      .replace("products/", "")
      .replace("public/", "");
      
    return `${BASE_URL}/storage/products/${fileName}`;
  };

  // Update Quantity ke Database
  const updateQty = async (id: number, qty: number) => {
    if (qty < 1) return;
    const token = getToken();
    const item = cart.find((c) => c.id === id);
    if (!item || !token) return;

    // Optimistic Update (Update UI dulu baru Server)
    const oldCart = [...cart];
    setCart(cart.map(c => c.id === id ? { ...c, quantity: qty } : c));

    try {
      const res = await fetch(`${BASE_URL}/api/cart/${id}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          product_id: item.product.id, 
          quantity: qty 
        }),
      });
      if (!res.ok) throw new Error();
    } catch (err) { 
      setCart(oldCart); 
      alertError("Gagal memperbarui jumlah."); 
    }
  };

  // Hapus Item
  const removeItem = async (id: number) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/cart/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCart(cart.filter(item => item.id !== id));
        setSelected(selected.filter(sId => sId !== id));
        alertSuccess("Produk dihapus dari keranjang.");
      }
    } catch (err) { 
      alertError("Gagal menghapus produk."); 
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id] 
    );
  };

  // Perhitungan Biaya
  const selectedItems = cart.filter((c) => selected.includes(c.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  if (!isMount) return null;
  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F4F9F4]">
      <Loader2 className="animate-spin text-[#234C6A]" size={40} />
      <p className="mt-4 text-[#234C6A] font-bold italic">Memuat Keranjang...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F9F4] font-sans pb-32 md:pb-12 text-black">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 py-3 md:py-4 px-4 md:px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/marketplace")}>
            <div className="w-8 h-8 bg-[#234C6A] rounded-lg flex items-center justify-center text-white">
              <Plus size={20} className="rotate-45" />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight text-[#234C6A]">Kembali</span>
          </div>
          <div className="flex items-center gap-3">
             <ShoppingCart size={20} className="text-[#234C6A]" />
             <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 border border-gray-200" />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-10">
          
          {/* LEFT: CART LIST */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-black italic uppercase tracking-tighter">Keranjang Belanja</h1>
              <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border">{cart.length} Items</span>
            </div>
            
            {cart.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
                <p className="text-gray-400 mb-6 italic">Keranjang Anda masih kosong, ayo belanja!</p>
                <button onClick={() => router.push("/marketplace")} className="text-[#234C6A] font-bold flex items-center gap-2 mx-auto hover:underline">
                   <ChevronLeft size={20} /> Mulai Belanja
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => {
                  const isChecked = selected.includes(item.id);
                  return (
                    <div key={item.id} className={`bg-white rounded-2xl p-3 md:p-4 flex gap-3 md:gap-6 border transition-all shadow-sm ${isChecked ? 'border-[#234C6A] ring-1 ring-[#234C6A]/10' : 'border-gray-100'}`}>
                      {/* Checkbox */}
                      <button onClick={() => toggleSelect(item.id)} className={`shrink-0 w-6 h-6 mt-1 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? "bg-[#234C6A] border-[#234C6A]" : "border-gray-300 bg-white"}`}>
                        {isChecked && <Check size={14} className="text-white stroke-[4px]" />}
                      </button>

                      {/* Image */}
                      <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                        <img 
                          src={getCartImageUrl(item.product.img_url)} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/no-image.png" }} 
                        />
                      </div>

                      {/* Info & Controls */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-sm md:text-lg text-black leading-tight truncate uppercase italic">{item.product.name}</h3>
                          <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                        
                        <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">Suku Cadang Original</p>

                        <div className="flex items-center justify-between mt-auto">
                           <p className="font-black text-black text-sm md:text-lg italic tracking-tight">{formatRupiah(item.product.price)}</p>
                           
                           <div className="flex items-center gap-2 md:gap-3 bg-slate-100 border border-gray-200 rounded-lg px-2 py-1">
                              <button onClick={() => updateQty(item.id, item.quantity - 1)} className="text-gray-500 hover:text-black p-1 transition-colors"><Minus size={14}/></button>
                              <span className="text-xs md:text-sm font-black w-4 text-center text-[#234C6A]">{item.quantity}</span>
                              <button onClick={() => updateQty(item.id, item.quantity + 1)} className="text-gray-500 hover:text-black p-1 transition-colors"><Plus size={14}/></button>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SUMMARY */}
          <div className="lg:sticky lg:top-24 h-fit">
            <h2 className="hidden lg:block text-2xl font-serif font-bold text-black italic uppercase tracking-tighter mb-8">Ringkasan Pesanan</h2>
            
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-lg">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-black">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">Biaya Layanan (10%)</span>
                  <span className="text-black">{formatRupiah(serviceFee)}</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-black uppercase text-xs tracking-widest">Total Tagihan</span>
                  <span className="text-xl font-black text-[#234C6A] italic">{formatRupiah(total)}</span>
                </div>
              </div>

              <button
                disabled={selectedItems.length === 0}
                onClick={() => { 
                  localStorage.setItem("checkout_items", JSON.stringify(selectedItems)); 
                  router.push("/checkout"); 
                }}
                className="hidden md:flex w-full bg-[#234C6A] hover:bg-black text-white py-4 rounded-xl font-bold transition-all items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 shadow-md uppercase tracking-widest text-sm italic"
              >
                Lanjutkan Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY CHECKOUT BAR */}
      {selectedItems.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-60 shadow-[0_-10px_25px_rgba(0,0,0,0.1)]">
           <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">Total Bayar</span>
                 <span className="text-lg font-black text-[#234C6A] italic">{formatRupiah(total)}</span>
              </div>
              <button
                onClick={() => { 
                  localStorage.setItem("checkout_items", JSON.stringify(selectedItems)); 
                  router.push("/checkout"); 
                }}
                className="flex-1 bg-[#234C6A] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-900/20 uppercase tracking-widest text-xs italic"
              >
                Checkout ({selectedItems.length})
                <ArrowRight size={18} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}