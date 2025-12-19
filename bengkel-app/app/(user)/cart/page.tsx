"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, Plus, Minus, ShoppingCart, Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { alertLoginRequired, alertSuccess, alertError } from "@/components/Alert";

/* ======================= TYPES ======================= */
interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    original_price?: number;
    img_url: string[];
  };
}

/* ======================= HELPER ======================= */
const formatRupiah = (value: number) =>
  "Rp " + value.toLocaleString("id-ID");

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
      const res = await fetch("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        const normalized: CartItem[] = (data.cart_items ?? []).map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            price: Number(item.product.price),
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

  /* ======================= QTY UPDATE ======================= */
  const updateQty = async (id: number, qty: number) => {
    if (qty < 1) return;
    const token = getToken();
    const item = cart.find((c) => c.id === id);
    if (!item) return;

    // Optimistic Update (Update UI dulu biar kerasa cepet)
    const oldCart = [...cart];
    setCart(cart.map(c => c.id === id ? { ...c, quantity: qty } : c));

    try {
      const res = await fetch(`http://localhost:8000/api/cart/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: item.product.id, quantity: qty }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setCart(oldCart); // Balikin kalo gagal
      alertError("Gagal memperbarui jumlah.");
    }
  };

  /* ======================= REMOVE ITEM ======================= */
  const removeItem = async (id: number) => {
    const token = getToken();
    try {
      const res = await fetch(`http://localhost:8000/api/cart/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        <p className="text-gray-500 font-medium">Sinkronisasi Keranjang...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <ShoppingCart size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Keranjang Belanja</h1>
          </div>
          <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border">
            {cart.length} Produk
          </span>
        </div>

        {/* EMPTY STATE */}
        {cart.length === 0 && (
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="text-gray-300" size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Keranjangmu Masih Kosong</h2>
            <p className="text-gray-500 mt-2 mb-8">Yuk, cari onderdil atau aksesoris motor impianmu!</p>
            <button
              onClick={() => router.push("/marketplace")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-200"
            >
              Mulai Belanja
            </button>
          </div>
        )}

        {/* CART LIST */}
        <div className="space-y-4">
          {cart.map((item) => {
            const isChecked = selected.includes(item.id);
            const imgPath = item.product.img_url[0]
              ? `http://localhost:8000/images/${item.product.img_url[0]}`
              : "/no-image.png";

            return (
              <div
                key={item.id}
                className={`group flex items-center gap-4 p-4 bg-white rounded-2xl border transition-all duration-300
                ${isChecked ? "border-orange-500 bg-orange-50/30" : "border-transparent shadow-sm hover:shadow-md"}
              `}
              >
                {/* CHECKBOX */}
                <button
                  onClick={() => toggleSelect(item.id)}
                  className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                  ${isChecked ? "bg-orange-500 border-orange-500 shadow-sm" : "border-gray-300 bg-white"}
                `}
                >
                  {isChecked && <Check size={14} className="text-white stroke-4" />}
                </button>

                {/* IMAGE */}
                <div 
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/marketplace/detailProduk?id=${item.product.id}`)}
                >
                  <img
                    src={imgPath}
                    alt={item.product.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <h2 
                    className="font-bold text-slate-800 truncate cursor-pointer hover:text-orange-500 transition-colors"
                    onClick={() => router.push(`/marketplace/detailProduk?id=${item.product.id}`)}
                  >
                    {item.product.name}
                  </h2>
                  <p className="text-orange-600 font-extrabold text-lg mt-1">
                    {formatRupiah(item.product.price)}
                  </p>
                  
                  {/* MOBILE QTY & DELETE */}
                  <div className="flex md:hidden items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1 hover:text-orange-500"><Minus size={14}/></button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1 hover:text-orange-500"><Plus size={14}/></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 p-2"><Trash2 size={18}/></button>
                  </div>
                </div>

                {/* DESKTOP ACTIONS */}
                <div className="hidden md:flex flex-col items-end gap-3">
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                  <div className="flex items-center gap-4 bg-gray-50 border rounded-xl p-1 px-2">
                    <button 
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-slate-700 min-w-5 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* STICKY FOOTER */}
        {selectedItems.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl bg-slate-900 text-white p-4 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="hidden md:block bg-white/10 p-3 rounded-2xl">
                <ShoppingCart className="text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Pembayaran</p>
                <p className="text-2xl font-black text-orange-400 leading-none">
                  {formatRupiah(total)}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem("checkout_items", JSON.stringify(selectedItems));
                router.push("/checkout");
              }}
              className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-orange-500/20"
            >
              Checkout Sekarang ({selectedItems.length})
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}