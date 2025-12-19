"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Gunakan navigasi internal Next.js
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

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState("reguler");
  const [paymentMethod, setPaymentMethod] = useState("transfer");

  const [bank, setBank] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isMount, setIsMount] = useState(false);

  /* ======================= HELPER: TOKEN ======================= */
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* ================= FETCH CHECKOUT ITEMS ================= */
  useEffect(() => {
    setIsMount(true); // Memastikan komponen sudah nempel di browser
    const selected = localStorage.getItem("checkout_items");

    if (!selected) {
      alertError("Tidak ada produk yang dipilih untuk checkout.");
      return;
    }

    try {
      const parsed = JSON.parse(selected);
      setCart(parsed);
    } catch (err) {
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

  /* ================= CHECKOUT ACTION ================= */
  const handleCheckout = async () => {
    if (cart.length === 0) return alertError("Tidak ada produk untuk checkout.");
    if (!recipientName || !phone || !address) return alertError("Lengkapi data penerima.");
    if (paymentMethod === "transfer" && !bank) return alertError("Pilih bank terlebih dahulu.");

    const token = getCookie("token");
    if (!token) return alertError("Silakan login terlebih dahulu.");

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

    try {
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
        return alertError(data.message || "Checkout gagal.");
      }

      localStorage.removeItem("checkout_items");
      alertSuccess("Pesanan berhasil dibuat!");
      
      // Gunakan router.push agar navigasi mulus tanpa reload total
      router.push("/marketplace/pesanan");
    } catch (error) {
      alertError("Terjadi kesalahan koneksi.");
    }
  };

  // Cegah Hydration Error dengan tidak merender apapun sebelum mount
  if (!isMount) return null;

  const inputStyle = "w-full border-2 rounded-xl p-3 focus:border-[#FF6D1F] outline-none transition-all";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">

        {/* FORM PENGIRIMAN */}
        <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border-t-8 border-[#234C6A]">
          <h1 className="text-3xl font-bold text-[#234C6A] flex items-center gap-3 mb-8">
            <ShoppingBag className="text-[#FF6D1F]" /> Checkout
          </h1>

          <div className="space-y-5 text-[#04080b]">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Penerima</label>
              <input
                className={inputStyle}
                placeholder="Masukkan nama lengkap"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">No. Telepon</label>
              <input
                className={inputStyle}
                placeholder="Contoh: 08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
              <textarea
                className={`${inputStyle} h-24 resize-none`}
                placeholder="Nama jalan, nomor rumah, kec, kota..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Metode Pengiriman</label>
                <select
                  className={inputStyle}
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                >
                  <option value="reguler">Reguler (Rp 10.000)</option>
                  <option value="express">Express (Rp 25.000)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
                <select
                  className={inputStyle}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="transfer">Transfer Bank</option>
                  <option value="tunai">COD (Bayar di Tempat)</option>
                </select>
              </div>
            </div>

            {paymentMethod === "transfer" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium mb-1">Pilih Bank</label>
                <select
                  className={inputStyle}
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                >
                  <option value="">-- Pilih Bank --</option>
                  <option value="BCA">BCA</option>
                  <option value="BRI">BRI</option>
                  <option value="BNI">BNI</option>
                  <option value="Mandiri">Mandiri</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* RINGKASAN PESANAN */}
        <div className="w-full md:w-96 bg-white p-6 rounded-2xl shadow-sm border-t-8 border-[#FF6D1F] h-fit">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Ringkasan Pesanan</h2>

          <div className="max-h-60 overflow-y-auto mb-4 pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm border-b py-3 last:border-0">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700">{item.product.name}</span>
                  <span className="text-gray-500">Qty: {item.quantity}</span>
                </div>
                <span className="font-semibold text-gray-800">
                  Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t pt-4 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Ongkir</span>
              <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t pt-3 mt-2 text-[#234C6A]">
              <span>Total</span>
              <span className="text-[#FF6D1F]">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="mt-8 w-full bg-[#FF6D1F] hover:bg-[#e85d1a] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:bg-gray-300"
          >
            <Send size={18} />
            Buat Pesanan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}