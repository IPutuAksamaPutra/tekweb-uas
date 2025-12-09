"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, User, CreditCard, Truck, ShoppingBag, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    name: string;
    price: number;
    image_url?: string;
  };
}

const getToken = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^| )token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shipping, setShipping] = useState("reguler");
  const [paymentMethod, setPaymentMethod] = useState("transfer");

  const token = getToken();

  // Load cart from backend
  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setCart(data.cart_items || []);
    } catch (err) {
      console.log("Error load cart:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) router.push("/login");
    fetchCart();
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = shipping === "express" ? 25000 : 10000;
  const total = subtotal + shippingCost;

  // ================= Checkout =================
  const handleCheckout = async () => {
    if (!recipientName || !phone || !address) return alert("Isi data lengkap!");

    if (cart.length === 0) return alert("Keranjang kosong!");

    // Backend hanya menerima satu item cart
    const payload = {
      cart_items_id: cart[0].id,
      name: recipientName,
      no_tlp: phone,
      address,
      delivery: shipping === "express" ? "kurir" : "ambil_di_tempat",
      payment: paymentMethod,
      subtotal: subtotal,
      postage: shippingCost,
      grandTotal: total,
    };

    try {
      const res = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        return alert("Checkout gagal, cek console log!");
      }

      alert("Pesanan berhasil dibuat!");
      router.push("/marketplace/pesanan");

    } catch (err) {
      console.log(err);
      alert("Terjadi kesalahan server.");
    }
  };

  const BASE_INPUT = "w-full border-2 rounded-xl p-3 outline-none transition duration-200 text-gray-800 placeholder-gray-500 focus:border-[#FF6D1F]";

  if (loading) return <p className="text-center py-20 text-lg">Memuat keranjang...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* FORM INPUT */}
        <div className="flex-1">
          <div className="bg-white p-8 shadow-2xl rounded-2xl border-t-8 border-[#234C6A]">
            <h1 className="text-3xl font-bold text-[#234C6A] mb-8 flex items-center gap-3">
              <ShoppingBag size={30} className="text-[#FF6D1F]" /> Konfirmasi Checkout
            </h1>

            <div className="space-y-6">
              <div>
                <label className="font-semibold flex items-center gap-2"><User/>Nama</label>
                <input className={BASE_INPUT} value={recipientName} onChange={(e)=>setRecipientName(e.target.value)} placeholder="Nama lengkap"/>
              </div>

              <div>
                <label className="font-semibold flex items-center gap-2"><Phone/>No Telp</label>
                <input className={BASE_INPUT} type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="08xxxxxxxxxx"/>
              </div>

              <div>
                <label className="font-semibold flex items-center gap-2"><MapPin/>Alamat</label>
                <textarea className={`${BASE_INPUT} h-24`} value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Alamat lengkap"/>
              </div>

              <div>
                <h2 className="font-bold mb-2">Pengiriman</h2>
                <select value={shipping} onChange={(e)=>setShipping(e.target.value)} className={BASE_INPUT}>
                  <option value="reguler">Reguler (10.000)</option>
                  <option value="express">Express (25.000)</option>
                </select>
              </div>

              <div>
                <h2 className="font-bold mb-2">Pembayaran</h2>
                <select value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)} className={BASE_INPUT}>
                  <option value="transfer">Transfer Bank</option>
                  <option value="tunai">Bayar di tempat</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RINGKASAN */}
        <div className="w-full md:w-96">
          <div className="bg-white p-6 shadow-2xl rounded-2xl border-t-8 border-[#FF6D1F] md:sticky md:top-6">
            <h2 className="text-2xl font-bold mb-4">Ringkasan Order</h2>

            {cart.map((item)=>(
              <div key={item.id} className="flex justify-between border-b py-2 text-gray-700">
                <span>{item.product.name} ({item.quantity}x)</span>
                <span>Rp {(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}

            <div className="mt-5 space-y-2 text-gray-700">
              <p className="flex justify-between"><span>Subtotal</span><span>Rp {subtotal.toLocaleString()}</span></p>
              <p className="flex justify-between"><span>Ongkir</span><span>Rp {shippingCost.toLocaleString()}</span></p>
              <p className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-[#FF6D1F]">Rp {total.toLocaleString()}</span></p>
            </div>

            <button onClick={handleCheckout} className="w-full mt-6 bg-[#FF6D1F] text-white py-3 rounded-full font-bold flex justify-center gap-2 hover:bg-[#E05B1B]">
              <Send/> Bayar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
