"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
}

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof document !== "undefined"
    ? document.cookie.match(/token=([^;]+)/)?.[1]
    : null;

  // ====================== FETCH CART ======================
  const fetchCart = async () => {
    if (!token) return router.push("/login");

    try {
      const res = await fetch("http://localhost:8000/api/cart", {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setCart(data.cart_items);
      else console.log(data);

    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  // ====================== UPDATE QTY ======================
  const updateQty = async (id:number, qty:number) => {
    if(qty < 1) return;

    await fetch(`http://localhost:8000/api/cart/${id}`, {
      method:"PUT",
      headers:{
        "Authorization":`Bearer ${token}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({ quantity:qty })
    });

    fetchCart();
  };

  // ====================== DELETE ITEM ======================
  const removeItem = async (id:number) =>{
    await fetch(`http://localhost:8000/api/cart/${id}`,{
      method:"DELETE",
      headers:{ "Authorization":`Bearer ${token}` }
    });

    fetchCart();
  };

  // ====================== TOTAL ======================
  const total = cart.reduce((sum,item)=> sum + item.product.price * item.quantity ,0);

  if(loading) return <p className="text-center mt-10">Memuat keranjang...</p>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b pb-3">
          <ShoppingCart size={32} className="text-[#FF6D1F]" />
          <h1 className="text-3xl font-extrabold text-[#234C6A]">
            Keranjang Belanja
          </h1>
          <span className="ml-auto text-gray-500">({cart.length} item)</span>
        </div>

        {cart.length === 0 && (
          <div className="text-center bg-white p-10 rounded-xl shadow">
            <p className="text-gray-600 mb-4">Keranjang masih kosong</p>
            <button
              onClick={()=>router.push("/marketplace")}
              className="bg-[#FF6D1F] px-6 py-2 rounded-full text-white font-bold">
              Belanja Sekarang
            </button>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-4">
          {cart.map(item=>(
            <div key={item.id} className="flex bg-white p-4 rounded-xl shadow gap-4 items-center border">

              <img src={item.product.image_url} className="w-24 h-24 rounded object-cover"/>

              <div className="flex-1">
                <h2 className="font-bold text-lg">{item.product.name}</h2>
                <p className="text-[#FF6D1F] font-bold text-xl">
                  Rp {item.product.price.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={()=>updateQty(item.id,item.quantity-1)} className="p-2 bg-gray-200 rounded-full">
                  <Minus size={18}/>
                </button>

                <span className="font-bold text-lg">{item.quantity}</span>

                <button onClick={()=>updateQty(item.id,item.quantity+1)} className="p-2 bg-gray-200 rounded-full">
                  <Plus size={18}/>
                </button>
              </div>

              <button onClick={()=>removeItem(item.id)} className="text-red-500">
                <Trash2 size={22}/>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        {cart.length > 0 && (
          <div className="mt-10 bg-white p-5 rounded-xl shadow flex justify-between items-center">
            <p className="text-xl font-bold text-[#234C6A]">
              Total: <span className="text-[#FF6D1F]">Rp {total.toLocaleString('id-ID')}</span>
            </p>

            <button
              onClick={()=>router.push("/checkout")}
              className="bg-[#FF6D1F] text-white px-6 py-3 rounded-full font-bold text-lg">
              Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
