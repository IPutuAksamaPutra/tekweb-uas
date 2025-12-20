"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Send, CreditCard } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* ======================= TYPE ======================= */
interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState("reguler");
  const [paymentMethod, setPaymentMethod] = useState("transfer");

  // VA (DISPLAY ONLY)
  const [bank, setBank] = useState("");
  const [virtualAccount, setVirtualAccount] = useState("");

  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isMount, setIsMount] = useState(false);

  /* ======================= TOKEN ======================= */
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* ======================= GENERATE VA (UI ONLY) ======================= */
  const generateVA = (bankName: string) => {
    const prefix: Record<string, string> = {
      BCA: "014",
      BRI: "002",
      BNI: "009",
      Mandiri: "008",
    };

    const random = Math.floor(100000000 + Math.random() * 900000000);
    return `${prefix[bankName]}${random}`;
  };

  useEffect(() => {
    if (paymentMethod === "transfer" && bank) {
      setVirtualAccount(generateVA(bank));
    } else {
      setVirtualAccount("");
    }
  }, [bank, paymentMethod]);

  /* ================= FETCH CHECKOUT ITEMS ================= */
  useEffect(() => {
    setIsMount(true);

    const buyNow = localStorage.getItem("buy_now_product");
    const selected = localStorage.getItem("checkout_items");

    if (buyNow) {
      try {
        const parsed = JSON.parse(buyNow);
        setCart([
          {
            id: Date.now(),
            product_id: Number(parsed.product_id),
            quantity: parsed.quantity,
            product: {
              name: parsed.name,
              price: parsed.price,
            },
          },
        ]);
        return;
      } catch {
        alertError("Data Buy Now rusak.");
      }
    }

    if (selected) {
      try {
        const parsed = JSON.parse(selected);
        setCart(parsed);
        return;
      } catch {
        alertError("Data checkout rusak.");
      }
    }

    alertError("Tidak ada produk untuk checkout.");
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
    if (cart.length === 0) return alertError("Keranjang kosong.");
    if (!recipientName || !phone || !address)
      return alertError("Lengkapi data penerima.");

    const token = getCookie("token");
    if (!token) return alertError("Silakan login terlebih dahulu.");

    // ❗ VA TIDAK DIKIRIM
    const payload = {
      items: cart.map((item) => ({
        product_id: Number(item.product_id),
        quantity: item.quantity,
      })),
      name: recipientName,
      no_tlp: phone,
      address,
      delivery: "kurir",
      payment: paymentMethod,
      total,
    };

    try {
      const res = await fetch(
        "https://tekweb-uas-production.up.railway.app/api/orders",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return alertError(data.message || "Checkout gagal.");
      }

      localStorage.removeItem("checkout_items");
      localStorage.removeItem("buy_now_product");

      alertSuccess("Pesanan berhasil dibuat!");
      router.push("/marketplace/pesanan");
    } catch {
      alertError("Terjadi kesalahan koneksi.");
    }
  };

  if (!isMount) return null;

  const inputStyle =
    "w-full border-2 rounded-xl p-3 focus:border-orange-500 outline-none";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">

        {/* FORM */}
        <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
            <ShoppingBag /> Checkout
          </h1>

          <div className="space-y-5">
            <input
              className={inputStyle}
              placeholder="Nama Penerima"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />

            <input
              className={inputStyle}
              placeholder="No. Telepon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <textarea
              className={`${inputStyle} h-24`}
              placeholder="Alamat Lengkap"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <select
              className={inputStyle}
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            >
              <option value="reguler">Reguler (Rp 10.000)</option>
              <option value="express">Express (Rp 25.000)</option>
            </select>

            <select
              className={inputStyle}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="transfer">Transfer Bank</option>
              <option value="tunai">COD</option>
            </select>

            {/* VA DISPLAY ONLY */}
            {paymentMethod === "transfer" && (
              <>
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

                {virtualAccount && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3">
                    <CreditCard className="text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-700">
                        Virtual Account {bank}
                      </p>
                      <p className="text-lg font-bold tracking-widest text-blue-900">
                        {virtualAccount}
                      </p>
                      <p className="text-xs text-blue-600">
                        *Simulasi pembayaran
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="w-full md:w-96 bg-white p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>

          {cart.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <span>
                {item.product.name} x {item.quantity}
              </span>
              <span>
                Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}
              </span>
            </div>
          ))}

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir</span>
              <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-bold text-xl mt-3">
              <span>Total</span>
              <span className="text-orange-500">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="mt-6 w-full bg-orange-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Send size={18} /> Buat Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
