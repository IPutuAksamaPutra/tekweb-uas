"use client";

import { useEffect, useState } from "react";

interface CartItem {
  type: "product" | "booking";
  id: number;
  name: string;
  price: number;
  qty: number;
}

export default function PembayaranPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metode, setMetode] = useState("Cash");
  const [bayar, setBayar] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setCart(JSON.parse(saved));
    }
  }, []);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const kembalian = Number(bayar) - total;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pembayaran</h1>

      {cart.map((item) => (
        <div key={`${item.type}-${item.id}`} className="border p-3 rounded-lg">
          <p>{item.name}</p>
          <p>Qty: {item.qty}</p>
          <p>Subtotal: Rp {(item.qty * item.price).toLocaleString()}</p>
        </div>
      ))}

      <h2 className="text-xl font-bold">
        Total: Rp {total.toLocaleString()}
      </h2>

      <input
        type="number"
        className="border p-3 w-full rounded"
        placeholder="Masukkan nominal bayar"
        value={bayar}
        onChange={(e) => setBayar(e.target.value)}
      />

      {bayar && (
        <p className="font-bold">
          Kembalian: Rp {kembalian.toLocaleString()}
        </p>
      )}
    </div>
  );
}
