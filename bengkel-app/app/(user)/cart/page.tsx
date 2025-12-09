"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

// ================= TYPE =================
interface CartItem {
  product_id: number;
  quantity: number;
  isSelected: boolean;
  product: {
    name: string;
    price: number;
    image_url: string;
  };
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  // ================= LOAD CART =================
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const saved = localStorage.getItem("cart");
    if (!saved) return;

    const parsed = JSON.parse(saved);

    // NORMALISASI agar cart lama/baru tetap terbaca
    const formatted: CartItem[] = parsed.map((i: any) => ({
      product_id: i.product_id ?? i.id,
      quantity: i.quantity ?? i.qty ?? 1,
      isSelected: i.isSelected ?? true,
      product: {
        name: i.product?.name ?? i.name ?? "Produk",
        price: i.product?.price ?? i.price ?? 0,
        image_url:
          i.product?.image_url ??
          i.img_url ??
          i.image_url ??
          "https://placehold.co/200x200?text=No+Image",
      },
    }));

    setCart(formatted);
    localStorage.setItem("cart", JSON.stringify(formatted));
  };

  // ================= QUANTITY =================
  const increment = (id: number) => {
    const updated = cart.map((item) =>
      item.product_id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const decrement = (id: number) => {
    const updated = cart
      .map((item) =>
        item.product_id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ================= REMOVE =================
  const removeItem = (id: number) => {
    const updated = cart.filter((i) => i.product_id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ================= SELECT ITEM =================
  const toggleSelect = (id: number) => {
    const updated = cart.map((item) =>
      item.product_id === id
        ? { ...item, isSelected: !item.isSelected }
        : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const selectAll = (checked: boolean) => {
    const updated = cart.map((i) => ({ ...i, isSelected: checked }));
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ================= TOTAL =================
  const total = cart
    .filter((i) => i.isSelected)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // ================= GO CHECKOUT =================
  const goCheckout = () => {
    if (cart.filter((i) => i.isSelected).length === 0) {
      alert("Pilih produk terlebih dahulu!");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-0">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold text-[#234C6A] flex items-center gap-3">
            <ShoppingCart size={32} className="text-[#FF6D1F]" />
            Keranjang Belanja
          </h1>

          {/* Empty Cart */}
          {cart.length === 0 && (
            <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
              Keranjang masih kosong.
              <br />
              <a href="/marketplace" className="text-[#FF6D1F] font-semibold">
                Belanja Sekarang
              </a>
            </div>
          )}

          {/* Select All */}
          {cart.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3 border">
              <input
                type="checkbox"
                checked={cart.every((i) => i.isSelected)}
                onChange={(e) => selectAll(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-semibold">Pilih Semua</span>
              <span className="ml-auto text-gray-500">
                {cart.filter((i) => i.isSelected).length} item terpilih
              </span>
            </div>
          )}

          {/* Cart Items */}
          {cart.map((item) => (
            <div
              key={item.product_id}
              className={`flex gap-3 bg-white p-4 rounded-xl shadow border-l-4 ${
                item.isSelected ? "border-[#FF6D1F]" : "border-gray-200"
              }`}
            >
              <input
                type="checkbox"
                checked={item.isSelected}
                onChange={() => toggleSelect(item.product_id)}
                className="w-5 h-5 mt-2"
              />

              <img
                src={item.product.image_url}
                className="w-24 h-24 object-cover rounded"
              />

              <div className="flex justify-between w-full">
                <div>
                  <p className="font-bold text-lg">{item.product.name}</p>
                  <p className="text-[#FF6D1F] font-bold text-xl">
                    Rp {item.product.price.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex border rounded-full overflow-hidden">
                    <button
                      onClick={() => decrement(item.product_id)}
                      className="px-3 py-1 text-lg"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 font-bold">{item.quantity}</span>
                    <button
                      onClick={() => increment(item.product_id)}
                      className="px-3 py-1 text-lg"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="flex gap-1 text-red-500 text-sm mt-2"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="h-fit bg-white rounded-xl p-6 shadow border-t-8 border-[#234C6A]">
          <p className="text-xl font-bold text-[#234C6A]">Total Bayar</p>
          <p className="text-[#FF6D1F] text-3xl font-extrabold mt-2">
            Rp {total.toLocaleString("id-ID")}
          </p>

          <button
            onClick={goCheckout}
            className="mt-6 w-full bg-[#FF6D1F] text-white py-3 rounded-full font-bold disabled:bg-gray-300"
            disabled={total === 0}
          >
            Checkout ({cart.filter((i) => i.isSelected).length})
          </button>
        </div>
      </div>
    </div>
  );
}
