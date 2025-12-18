"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { alertLoginRequired } from "@/components/Alert";

/* =======================
   TYPES
======================= */
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

/* =======================
   HELPER
======================= */
const formatRupiah = (value: number) =>
  "Rp " + value.toLocaleString("id-ID");

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  const token =
    typeof document !== "undefined"
      ? document.cookie.match(/token=([^;]+)/)?.[1]
      : null;

  /* =======================
     FETCH CART
  ======================= */
  const fetchCart = async () => {
    if (!token) {
      alertLoginRequired().then((res) => {
        if (res.isConfirmed) router.push("/auth/login");
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        const normalized: CartItem[] = (data.cart_items ?? []).map(
          (item: any) => ({
            ...item,
            product: {
              ...item.product,
              price: Number(item.product.price),
              original_price: item.product.original_price
                ? Number(item.product.original_price)
                : undefined,
              img_url: Array.isArray(item.product.img_url)
                ? item.product.img_url
                : item.product.img_url
                ? [item.product.img_url]
                : [],
            },
          })
        );

        setCart(normalized);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* =======================
     QTY UPDATE
  ======================= */
  const updateQty = async (id: number, qty: number) => {
    if (qty < 1) return;

    const product_id = cart.find((c) => c.id === id)?.product.id;
    if (!product_id) return;

    await fetch(`http://localhost:8000/api/cart/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id, quantity: qty }),
    });

    fetchCart();
  };

  /* =======================
     REMOVE ITEM
  ======================= */
  const removeItem = async (id: number) => {
    await fetch(`http://localhost:8000/api/cart/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart();
  };

  /* =======================
     SELECT HANDLER
  ======================= */
  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectedItems = cart.filter((c) =>
    selected.includes(c.id)
  );

  /* =======================
     TOTAL
  ======================= */
  const total = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500">
        Memuat keranjang...
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6 md:mb-10 border-b pb-4">
          <ShoppingCart size={28} className="text-orange-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Keranjang
          </h1>
        </div>

        {/* EMPTY */}
        {cart.length === 0 && (
          <div className="bg-white p-8 md:p-10 rounded-xl shadow text-center">
            <p className="text-gray-500 mb-4">
              Keranjang masih kosong
            </p>
            <button
              onClick={() => router.push("/marketplace")}
              className="bg-orange-500 text-white px-6 py-2 rounded-full"
            >
              Belanja Sekarang
            </button>
          </div>
        )}

        {/* CART LIST */}
        <div className="space-y-4">
          {cart.map((item) => {
            const checked = selected.includes(item.id);
            const img = item.product.img_url[0]
              ? `http://localhost:8000/images/${item.product.img_url[0]}`
              : "/no-image.png";

            return (
              <div
                key={item.id}
                className={`flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5 bg-white rounded-xl border
                ${checked ? "border-orange-500 ring-1 ring-orange-300" : ""}
              `}
              >
                {/* TOP ROW (MOBILE) */}
                <div className="flex items-center gap-4 md:gap-4">
                  {/* CHECK */}
                  <button
                    onClick={() => toggleSelect(item.id)}
                    className={`w-6 h-6 rounded border flex items-center justify-center
                    ${checked ? "bg-orange-500 border-orange-500" : "border-gray-400"}
                  `}
                  >
                    {checked && (
                      <Check size={14} className="text-[#05090c]" />
                    )}
                  </button>

                  {/* IMAGE */}
                  <img
                    src={img}
                    onClick={() =>
                      router.push(
                        `/marketplace/detailProduk?id=${item.product.id}`
                      )
                    }
                    className="w-20 h-20 rounded-lg object-cover border cursor-pointer"
                    onError={(e) =>
                      (e.currentTarget.src = "/no-image.png")
                    }
                  />

                  {/* INFO */}
                  <div
                    className="flex-1 cursor-pointer text-[#05090c]"
                    onClick={() =>
                      router.push(
                        `/marketplace/detailProduk?id=${item.product.id}`
                      )
                    }
                  >
                    <h2 className="font-semibold text-slate-800">
                      {item.product.name}
                    </h2>
                    <p className="text-orange-500 font-bold">
                      {formatRupiah(item.product.price)}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-between md:justify-end gap-4 md:ml-auto">
                  {/* QTY */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQty(item.id, item.quantity - 1)
                      }
                      className="w-8 h-8 bg-gray-200 rounded-full text-[#05090c]"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="font-semibold text-[#05090c]">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQty(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 bg-gray-200 rounded-full text-[#05090c]"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* DELETE */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        {selectedItems.length > 0 && (
          <div className="mt-8 bg-white p-5 md:p-6 rounded-xl shadow flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center text-[#05090c]">
            <p className="text-lg md:text-xl font-bold">
              Total:
              <span className="text-orange-500 ml-2">
                {formatRupiah(total)}
              </span>
            </p>

            <button
              onClick={() => {
                localStorage.setItem(
                  "checkout_items",
                  JSON.stringify(selectedItems)
                );
                router.push("/checkout");
              }}
              className="w-full md:w-auto bg-orange-500 text-[#05090c] px-7 py-3 rounded-full font-bold"
            >
              Checkout ({selectedItems.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
