"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, User, CreditCard, Truck, ShoppingBag, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
    id: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        price: number;
        image_url: string;
    }
}

export default function CheckoutPage() {
    const router = useRouter();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [recipientName, setRecipientName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [shipping, setShipping] = useState("reguler");
    const [paymentMethod, setPaymentMethod] = useState("transfer");

    const token = typeof document !== "undefined"
        ? document.cookie.match(/token=([^;]+)/)?.[1]
        : null;

    // ================= Fetch Cart Backend =================
    const fetchCart = async () => {
        if(!token) return router.push("/login");

        try {
            const res = await fetch("http://localhost:8000/api/cart",{
                headers:{ Authorization:`Bearer ${token}` }
            });

            const data = await res.json();
            if(res.ok) setCart(data.cart_items);
            else console.log(data);

        } catch (err) {
            console.log("Checkout cart fetch error:",err);
        }
    };

    useEffect(()=>{ fetchCart() },[]);

    // Hitung total
    const subtotal = cart.reduce((t,i)=> t + i.product.price * i.quantity ,0);
    const postage = shipping==="express" ? 25000 : 10000;
    const grandTotal = subtotal + postage;

    // ================= Checkout Handler =================
    const handleCheckout = async () => {
        if(cart.length===0) return alert("Keranjang kosong!");

        const item = cart[0]; // backend kamu hanya bisa 1 item checkout dulu

        const payload = {
            cart_items_id:item.id,
            name:recipientName,
            no_tlp:phone,
            address,
            delivery:shipping==="express" ? "kurir":"ambil_di_tempat",
            payment:paymentMethod==="transfer" ? "transfer":"tunai",
            subtotal,
            postage,
            grandTotal
        };

        try {
            const res = await fetch("http://localhost:8000/api/orders",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                },
                body:JSON.stringify(payload)
            });

            const data = await res.json();

            if(!res.ok){
                console.log("Checkout error:",data);
                return alert("Checkout gagal, cek console");
            }

            alert("Checkout berhasil!");
            router.push("/marketplace/pesanan");

        } catch(err){
            console.log(err);
            alert("Terjadi error server saat checkout.");
        }
    };

    const BASE = "w-full border-2 rounded-xl p-3 focus:border-[#FF6D1F] outline-none";

    return(
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">

                {/* Input Form */}
                <div className="flex-1 bg-white p-8 rounded-2xl shadow-xl border-t-8 border-[#234C6A]">
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-[#234C6A] mb-8">
                        <ShoppingBag size={28}/> Checkout
                    </h1>

                    <div className="space-y-6">
                        
                        <div>
                            <label className="font-bold flex items-center gap-2 mb-2"><User size={18}/>Nama Penerima</label>
                            <input className={BASE} value={recipientName} onChange={e=>setRecipientName(e.target.value)}/>
                        </div>

                        <div>
                            <label className="font-bold flex items-center gap-2 mb-2"><Phone size={18}/>No Telp</label>
                            <input className={BASE} value={phone} onChange={e=>setPhone(e.target.value)}/>
                        </div>

                        <div>
                            <label className="font-bold flex items-center gap-2 mb-2"><MapPin size={18}/>Alamat</label>
                            <textarea className={`${BASE} h-24`} value={address} onChange={e=>setAddress(e.target.value)}/>
                        </div>

                        <div>
                            <label className="font-bold mb-2 flex gap-2"><Truck size={18}/>Pengiriman</label>
                            <select className={BASE} value={shipping} onChange={e=>setShipping(e.target.value)}>
                                <option value="reguler">Reguler - 10.000</option>
                                <option value="express">Express - 25.000</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-bold mb-2 flex gap-2"><CreditCard size={18}/>Pembayaran</label>
                            <select className={BASE} value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>
                                <option value="transfer">Transfer</option>
                                <option value="tunai">Tunai (COD)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="w-full md:w-80 bg-white p-6 rounded-2xl shadow-xl border-t-8 border-[#FF6D1F] h-fit">
                    <h2 className="font-bold text-xl border-b pb-3 text-[#234C6A]">Ringkasan Order</h2>

                    <div className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-2">
                        {cart.map(i=>(
                            <div key={i.id} className="flex justify-between border-b pb-1 text-sm">
                                <span>{i.product.name} ({i.quantity}x)</span>
                                <span>Rp {(i.product.price*i.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>Rp {subtotal.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Ongkir</span><span>Rp {postage.toLocaleString()}</span></div>
                        <div className="flex justify-between text-xl font-bold pt-3 border-t"><span>Total</span>
                            <span className="text-[#FF6D1F]">Rp {grandTotal.toLocaleString()}</span></div>
                    </div>

                    <button onClick={handleCheckout}
                        className="mt-6 w-full bg-[#FF6D1F] hover:bg-[#E65817] text-white font-bold py-3 rounded-full flex justify-center gap-2">
                        <Send size={20}/> Bayar Sekarang
                    </button>
                </div>

            </div>
        </div>
    );
}
