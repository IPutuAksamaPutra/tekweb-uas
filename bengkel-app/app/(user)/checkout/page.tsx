"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Send, 
  CreditCard, 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Wallet,
  ArrowLeft,
  Loader2
} from "lucide-react";
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
  const [bank, setBank] = useState("");
  const [virtualAccount, setVirtualAccount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isMount, setIsMount] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ======================= HELPER: GET COOKIE ======================= */
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  /* ======================= GENERATE VA ======================= */
  const generateVA = (bankName: string) => {
    const prefix: Record<string, string> = { BCA: "014", BRI: "002", BNI: "009", Mandiri: "008" };
    const random = Math.floor(100000000 + Math.random() * 900000000);
    return `${prefix[bankName] || "888"}${random}`;
  };

  useEffect(() => {
    if (paymentMethod === "transfer" && bank) {
      setVirtualAccount(generateVA(bank));
    } else {
      setVirtualAccount("");
    }
  }, [bank, paymentMethod]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    setIsMount(true);
    const buyNow = localStorage.getItem("buy_now_product");
    const selected = localStorage.getItem("checkout_items");

    if (buyNow) {
      try {
        const parsed = JSON.parse(buyNow);
        setCart([{
          id: Date.now(),
          product_id: Number(parsed.product_id),
          quantity: Number(parsed.quantity),
          product: { name: parsed.name, price: Number(parsed.price) },
        }]);
        return;
      } catch { alertError("Data Buy Now rusak."); }
    } else if (selected) {
      try {
        setCart(JSON.parse(selected));
        return;
      } catch { alertError("Data checkout rusak."); }
    } else {
      router.push("/marketplace");
    }
  }, [router]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = shipping === "express" ? 25000 : 10000;
  const total = subtotal + shippingCost;

  /* ================= HANDLER CHECKOUT ================= */
  const handleCheckout = async () => {
    if (cart.length === 0) return alertError("Tidak ada item untuk diproses.");
    if (!recipientName || !phone || !address) return alertError("Lengkapi detail pengiriman.");
    
    // 🔥 PERBAIKAN: Ambil token dari Cookie (Sinkron dengan Login & Marketplace)
    const token = getCookie("token");
    if (!token) {
      alertError("Sesi berakhir, silakan login ulang.");
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    const payload = {
      items: cart.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
      name: recipientName,
      no_tlp: phone,
      address,
      delivery: "kurir",
      payment: paymentMethod,
      total,
    };

    try {
      const res = await fetch("https://tekweb-uas-production.up.railway.app/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout gagal.");

      localStorage.removeItem("checkout_items");
      localStorage.removeItem("buy_now_product");
      alertSuccess("Pesanan berhasil dibuat!");
      router.push("/marketplace/pesanan");
    } catch (err: any) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isMount) return null;

  const labelStyle = "block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 italic";
  const inputContainer = "relative flex items-center";
  const inputIcon = "absolute left-4 text-slate-400";
  const inputStyle = "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-10 px-4 font-sans text-[#0f172a]">
      <div className="max-w-6xl mx-auto">
        
        {/* BACK BUTTON */}
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 font-black uppercase text-[10px] text-slate-400 hover:text-orange-500 transition-all italic tracking-widest group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> KEMBALI
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT SIDE: FORM */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
                <ShoppingBag className="text-orange-500" size={32} /> Pengiriman
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelStyle}>Nama Lengkap</label>
                  <div className={inputContainer}>
                    <User className={inputIcon} size={18} />
                    <input className={inputStyle} placeholder="John Doe" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>No. WhatsApp</label>
                  <div className={inputContainer}>
                    <Phone className={inputIcon} size={18} />
                    <input className={inputStyle} placeholder="0812..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className={labelStyle}>Alamat Pengiriman</label>
                <div className={inputContainer}>
                  <MapPin className="absolute left-4 top-5 text-slate-400" size={18} />
                  <textarea className={`${inputStyle} h-32 pt-4 resize-none`} placeholder="Jl. Nama Jalan, No. Rumah, Kecamatan..." value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                <Truck className="text-orange-500" size={24} /> Opsi & Pembayaran
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelStyle}>Metode Pengiriman</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-orange-500 appearance-none" value={shipping} onChange={(e) => setShipping(e.target.value)}>
                    <option value="reguler">📦 Reguler (Rp 10.000)</option>
                    <option value="express">🚀 Express (Rp 25.000)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Metode Pembayaran</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-orange-500 appearance-none" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="transfer">🏦 Transfer Bank (VA)</option>
                    <option value="tunai">💵 COD (Bayar di Tempat)</option>
                  </select>
                </div>
              </div>

              {paymentMethod === "transfer" && (
                <div className="mt-8 p-6 bg-orange-50 rounded-3xl border-2 border-orange-100 space-y-4">
                  <label className={labelStyle}>Pilih Bank</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['BCA', 'BRI', 'BNI', 'Mandiri'].map((b) => (
                      <button key={b} onClick={() => setBank(b)} className={`py-3 rounded-xl font-black text-sm transition-all ${bank === b ? 'bg-[#0f172a] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        {b}
                      </button>
                    ))}
                  </div>

                  {virtualAccount && (
                    <div className="bg-white p-5 rounded-2xl border border-orange-200 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 bg-orange-500 rounded-xl text-white"><CreditCard size={20}/></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 italic">VA {bank} NUMBER</p>
                        <p className="text-xl font-black tracking-[0.2em] text-[#0f172a]">{virtualAccount}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: SUMMARY */}
          <div className="w-full lg:w-96">
            <div className="bg-[#0f172a] p-8 rounded-[2.5rem] shadow-2xl text-white sticky top-10">
              <h2 className="text-xl font-black italic uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Pesanan Kamu</h2>
              
              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold leading-tight">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400 font-black mt-1 uppercase italic tracking-widest">{item.quantity} Unit</p>
                    </div>
                    <p className="text-sm font-black">Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 italic">Subtotal</span>
                  <span className="font-bold">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 italic">Ongkos Kirim</span>
                  <span className="font-bold">Rp {shippingCost.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-end pt-4 mt-2 border-t-2 border-dashed border-white/20">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Total Tagihan</span>
                  <span className="text-3xl font-black italic tracking-tighter">Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-8 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> BUAT PESANAN</>}
              </button>
              
              <p className="text-[9px] text-center mt-6 text-slate-500 font-bold uppercase tracking-[0.2em] italic">
                Dengan mengklik tombol, kamu setuju dengan syarat & ketentuan Bengkel Market.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}