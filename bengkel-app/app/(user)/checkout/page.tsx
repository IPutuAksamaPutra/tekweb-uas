"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, User, Send, ShoppingBag } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* ======================= TYPE ======================= */
interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    name: string;
    price: number;
    original_price?: number;
    img_url?: string;
  };
}

/* ======================= TOKEN ======================= */
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState("reguler");
  const [paymentMethod, setPaymentMethod] = useState("transfer");

  const [bank, setBank] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  /* ================= FETCH CHECKOUT ITEMS ================= */
  useEffect(() => {
    const selected = localStorage.getItem("checkout_items");

    if (!selected) {
      alertError("Tidak ada produk yang dipilih untuk checkout.");
      return;
    }

    try {
      const parsed = JSON.parse(selected);
      setCart(parsed);
    } catch {
      alertError("Data checkout rusak.");
    }
  }, []);

  /* ================= PERHITUNGAN ================= */
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const shippingCost = shipping === "express" ? 25000 : 10000;
  const total = subtotal + shippingCost;

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (cart.length === 0)
      return alertError("Tidak ada produk untuk checkout.");

    if (!recipientName || !phone || !address)
      return alertError("Lengkapi data penerima.");

    if (paymentMethod === "transfer" && !bank)
      return alertError("Pilih bank terlebih dahulu.");

    const token = getCookie("token");
    if (!token) return alertError("Silakan login.");

    const payload = {
      items: cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      })),
      name: recipientName,
      no_tlp: phone,
      address,
      delivery: "kurir",
      payment: paymentMethod,
      total,
    };

    const res = await fetch("http://localhost:8000/api/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      return alertError("Checkout gagal.");
    }

    localStorage.removeItem("checkout_items");
    alertSuccess("Pesanan berhasil dibuat!");
    window.location.href = "/marketplace/pesanan";
  };

  const input =
    "w-full border-2 rounded-xl p-3 focus:border-[#FF6D1F] outline-none";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">

        {/* FORM */}
        <div className="flex-1 bg-white p-8 rounded-2xl shadow border-t-8 border-[#234C6A]">
          <h1 className="text-3xl font-bold text-[#234C6A] flex gap-3 mb-8">
            <ShoppingBag className="text-[#FF6D1F]" /> Checkout
          </h1>

          <div className="space-y-5">
            <input
              className={input}
              placeholder="Nama Penerima"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
            <input
              className={input}
              placeholder="No. Telepon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <textarea
              className={`${input} h-24`}
              placeholder="Alamat Lengkap"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <select
              className={input}
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            >
              <option value="reguler">Reguler (Rp 10.000)</option>
              <option value="express">Express (Rp 25.000)</option>
            </select>

            <select
              className={input}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="transfer">Transfer Bank</option>
              <option value="tunai">COD</option>
            </select>

            {paymentMethod === "transfer" && (
              <select
                className={input}
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              >
                <option value="">Pilih Bank</option>
                <option>BCA</option>
                <option>BRI</option>
                <option>BNI</option>
                <option>Mandiri</option>
              </select>
            )}
          </div>
        </div>

        {/* RINGKASAN */}
        <div className="w-full md:w-96 bg-white p-6 rounded-2xl shadow border-t-8 border-[#FF6D1F]">
          <h2 className="text-xl font-bold mb-4">Ringkasan</h2>

          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm border-b py-1">
              <span>{item.product.name} x{item.quantity}</span>
              <span>
                Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}
              </span>
            </div>
          ))}

          <div className="mt-4 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir</span>
              <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-[#FF6D1F]">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="mt-6 w-full bg-[#FF6D1F] text-white py-3 rounded-full font-bold"
          >
            <Send size={18} className="inline mr-2" />
            Buat Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
