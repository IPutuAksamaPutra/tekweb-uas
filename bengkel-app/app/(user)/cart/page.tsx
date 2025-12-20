"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, Plus, Minus, ShoppingCart, Check, ArrowRight, Loader2 } from "lucide-react";
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

/* ======================= HELPER ======================= */
const formatRupiah = (value: number) =>
  "Rp " + value.toLocaleString("id-ID");

const BASE_URL = "https://tekweb-uas-production.up.railway.app";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [isMount, setIsMount] = useState(false);

  // Helper ambil token yang aman
  const getToken = useCallback(() => {
    if (typeof document === "undefined") return null;
    return document.cookie.match(/token=([^;]+)/)?.[1] || null;
  }, []);

  /* ======================= FETCH CART ======================= */
  const fetchCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/cart`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Accept": "application/json"
        },
      });

      const data = await res.json();

      if (res.ok) {
        const normalized: CartItem[] = (data.cart_items ?? []).map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            price: Number(item.product.price),
            // Memastikan img_url selalu berupa array
            img_url: Array.isArray(item.product.img_url)
              ? item.product.img_url
              : item.product.img_url ? [item.product.img_url] : [],
          },
        }));
        setCart(normalized);
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
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

  /* ======================= LOGIKA GAMBAR RAILWAY ======================= */
  const getCartImageUrl = (imgArray: string[]) => {
    const targetImg = imgArray[0];
    if (!targetImg) return "https://placehold.co/200x200?text=No+Image";
    if (targetImg.startsWith("http")) return targetImg;
    
    // Membersihkan path agar sesuai dengan symbolic link Railway /storage/products/
    const fileName = targetImg.replace("public/products/", "").replace("products/", "");
    return `${BASE_URL}/storage/products/${fileName}`;
  };

  /* ======================= QTY UPDATE ======================= */
  const updateQty = async (id: number, qty: number) => {
    if (qty < 1) return;
    const token = getToken();
    const item = cart.find((c) => c.id === id);
    if (!item) return;

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
        body: JSON.stringify({ product_id: item.product.id, quantity: qty }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setCart(oldCart); 
      alertError("Gagal memperbarui jumlah.");
    }
  };

  /* ======================= REMOVE ITEM ======================= */
  const removeItem = async (id: number) => {
    const token = getToken();
    try {
      const res = await fetch(`${BASE_URL}/api/cart/${id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Accept": "application/json"
        },
      });
      if (res.ok) {
        setCart(cart.filter(item => item.id !== id));
        setSelected(selected.filter(sId => sId !== id));
        alertSuccess("Item dihapus.");
      }
    } catch (err) {
      alertError("Gagal menghapus item.");
    }
  };

  /* ======================= SELECT HANDLER ======================= */
  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedItems = cart.filter((c) => selected.includes(c.id));
  const total = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!isMount) return null;

  if (loading)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="text-gray-500 font-black uppercase text-xs tracking-widest">Sinkronisasi Keranjang...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#234C6A] p-3 rounded-2xl text-white shadow-lg shadow-blue-900/20">
              <ShoppingCart size={24} />
            </div>
            <h1 className="text-3xl font-black text-[#234C6A] tracking-tighter uppercase">Keranjang Belanja</h1>
          </div>
          <span className="text-xs font-black text-gray-400 bg-white px-4 py-2 rounded-full border uppercase tracking-widest">
            {cart.length} Item
          </span>
        </div>

        {/* EMPTY STATE */}
        {cart.length === 0 && (
          <div className="bg-white p-16 rounded-[3rem] shadow-xl shadow-blue-900/5 text-center border border-gray-100">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="text-gray-200" size={48} />
            </div>
            <h2 className="text-2xl font-black text-[#234C6A] uppercase tracking-tighter">Keranjang Kosong</h2>
            <p className="text-gray-400 font-medium mt-2 mb-10">Belum ada onderdil yang kamu pilih, yuk belanja dulu!</p>
            <button
              onClick={() => router.push("/marketplace")}
              className="bg-[#FF6D1F] hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-100 active:scale-95"
            >
              Cari Sparepart
            </button>
          </div>
        )}

        {/* CART LIST */}
        <div className="space-y-4">
          {cart.map((item) => {
            const isChecked = selected.includes(item.id);
            const imgPath = getCartImageUrl(item.product.img_url);

            return (
              <div
                key={item.id}
                className={`group flex items-center gap-4 p-5 bg-white rounded-4xl border transition-all duration-300
                ${isChecked ? "border-[#FF6D1F] bg-orange-50/30 shadow-orange-100 shadow-lg" : "border-gray-100 shadow-sm hover:shadow-md"}
              `}
              >
                {/* CHECKBOX */}
                <button
                  onClick={() => toggleSelect(item.id)}
                  className={`shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all
                  ${isChecked ? "bg-[#FF6D1F] border-[#FF6D1F] shadow-md" : "border-gray-200 bg-white"}
                `}
                >
                  {isChecked && <Check size={16} className="text-white stroke-4" />}
                </button>

                {/* IMAGE */}
                <div 
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-50 bg-white cursor-pointer"
                  onClick={() => router.push(`/marketplace/detail-produk/${item.product.slug}`)}
                >
                  <img
                    src={imgPath}
                    alt={item.product.name}
                    className="w-full h-full object-contain p-2 transition-transform group-hover:scale-110"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/200x200?text=Error"; }}
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <h2 
                    className="font-black text-[#234C6A] text-lg truncate cursor-pointer hover:text-[#FF6D1F] transition-colors uppercase tracking-tight"
                    onClick={() => router.push(`/marketplace/detail-produk/${item.product.slug}`)}
                  >
                    {item.product.name}
                  </h2>
                  <p className="text-[#FF6D1F] font-black text-xl mt-1">
                    {formatRupiah(item.product.price)}
                  </p>
                  
                  {/* MOBILE ACTIONS */}
                  <div className="flex md:hidden items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1 text-gray-400 hover:text-[#FF6D1F]"><Minus size={16}/></button>
                      <span className="text-sm font-black w-6 text-center text-[#234C6A]">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1 text-gray-400 hover:text-[#FF6D1F]"><Plus size={16}/></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 p-2 hover:text-red-600"><Trash2 size={20}/></button>
                  </div>
                </div>

                {/* DESKTOP ACTIONS */}
                <div className="hidden md:flex flex-col items-end gap-4">
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={22} />
                  </button>
                  <div className="flex items-center gap-5 bg-gray-50 border border-gray-100 rounded-2xl p-1.5 px-3">
                    <button 
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-[#FF6D1F] rounded-xl transition-all text-gray-400"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-black text-[#234C6A] min-w-5 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-[#FF6D1F] rounded-xl transition-all text-gray-400"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* STICKY FOOTER */}
        {selectedItems.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-4xl bg-[#234C6A] text-white p-5 md:p-7 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="hidden md:block bg-white/10 p-4 rounded-2xl">
                <ShoppingCart className="text-[#FF6D1F]" size={28} />
              </div>
              <div>
                <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest mb-1">Total Pembayaran</p>
                <p className="text-3xl font-black text-[#FF6D1F] leading-none tracking-tighter">
                  {formatRupiah(total)}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem("checkout_items", JSON.stringify(selectedItems));
                router.push("/checkout");
              }}
              className="w-full md:w-auto bg-[#FF6D1F] hover:bg-orange-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-orange-500/20"
            >
              Checkout ({selectedItems.length})
              <ArrowRight size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}