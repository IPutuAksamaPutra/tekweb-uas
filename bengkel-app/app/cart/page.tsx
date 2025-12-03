"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image_url?: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const decreaseQty = (id: number) => {
    const updated = cart.map((item) =>
      item.id === id && item.qty > 1
        ? { ...item, qty: item.qty - 1 }
        : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const increaseQty = (id: number) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id: number) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-3 gap-8">

      {/* LEFT CONTENT */}
      <div className="md:col-span-2">

        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart size={28} className="text-[#234C6A]" />
          <h1 className="text-2xl font-bold text-[#234C6A]">Keranjang Belanja</h1>
        </div>

        {cart.length === 0 && (
          <p className="text-gray-500 text-center py-10">Keranjang masih kosong.</p>
        )}

        <div className="space-y-5">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-300">

              <img
                src={item.image_url || "/no-image.jpg"}
                className="w-24 h-24 object-cover rounded-lg shadow-sm"
                alt="product"
              />

              <div className="flex flex-col grow">
                <h2 className="text-lg font-semibold text-[#234C6A]">{item.name}</h2>

                <p className="text-[#FF6D1F] font-bold text-lg">
                  Rp {item.price.toLocaleString("id-ID")}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => decreaseQty(item.id)} className="p-2 rounded-lg border hover:bg-gray-100">
                    <Minus size={16} />
                  </button>

                  <span className="text-lg font-semibold">{item.qty}</span>

                  <button onClick={() => increaseQty(item.id)} className="p-2 rounded-lg border hover:bg-gray-100">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={22} />
              </button>

            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY */}
      {cart.length > 0 && (
        <div className="w-full h-fit">

          <h2 className="text-xl font-bold text-[#234C6A] mb-3">Ringkasan Belanja</h2>

          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>Total</span>
            <span className="text-[#FF6D1F]">Rp {total.toLocaleString("id-ID")}</span>
          </div>

          <a
            href="/checkout"
            className="block w-full text-center bg-[#FF6D1F] hover:bg-orange-600 
            text-white font-semibold py-3 rounded-xl transition shadow-md"
          >
            Lanjutkan ke Checkout
          </a>
        </div>
      )}
    </div>
  );
}
