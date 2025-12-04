"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ShoppingCart, DollarSign } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image_url: string; // Diperkuat agar dummy data bisa menggunakan URL
}

export default function CartPage() {
  // === DATA DUMMY DITAMBAHKAN DI SINI ===
  const dummyCart: CartItem[] = [
    {
      id: 101,
      name: "Oli Mesin Matic Premium (1L)",
      price: 65000,
      qty: 2,
      image_url: "https://placehold.co/100x100/234C6A/FFFFFF?text=Oli",
    },
    {
      id: 102,
      name: "Filter Udara Kualitas Tinggi",
      price: 85000,
      qty: 1,
      image_url: "https://placehold.co/100x100/FF6D1F/FFFFFF?text=Filter",
    },
    {
      id: 103,
      name: "Busi Iridium Motor (Set 2)",
      price: 120000,
      qty: 1,
      image_url: "https://placehold.co/100x100/234C6A/FFFFFF?text=Busi",
    },
  ];

  const [cart, setCart] = useState<CartItem[]>([]);

  // Mengganti penggunaan localStorage dengan data dummy untuk tampilan
  useEffect(() => {
    // Simulasi loading data dari 'API' atau 'Storage'
    setTimeout(() => {
      // Menggunakan data dummy saat komponen dimuat
      setCart(dummyCart);
    }, 500);
  }, []);
  // =======================================

  // Fungsi utilitas untuk update cart dan (opsional) storage
  const updateCartAndStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    // Jika menggunakan firebase, ini akan diganti dengan setDoc/updateDoc
    // localStorage.setItem("cart", JSON.stringify(updatedCart)); 
  };

  const decreaseQty = (id: number) => {
    const updated = cart.map((item) =>
      item.id === id && item.qty > 1
        ? { ...item, qty: item.qty - 1 }
        : item
    );
    updateCartAndStorage(updated);
  };

  const increaseQty = (id: number) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    updateCartAndStorage(updated);
  };

  const removeItem = (id: number) => {
    const updated = cart.filter((item) => item.id !== id);
    updateCartAndStorage(updated);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

        {/* ================= LEFT CONTENT: ITEMS & LIST ================= */}
        <div className="md:col-span-2">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8 border-b pb-3">
            <ShoppingCart size={32} className="text-[#FF6D1F]" />
            <h1 className="text-3xl font-extrabold text-[#234C6A]">Keranjang Belanja Anda</h1>
            <span className="text-xl text-gray-500 ml-auto">({cart.length} Item)</span>
          </div>

          {/* Empty State */}
          {cart.length === 0 && (
            <div className="text-center bg-white p-12 rounded-xl shadow-md border border-gray-200">
              <ShoppingCart size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Keranjang Anda masih kosong.</p>
              <p className="text-gray-400 mt-2">Segera tambahkan produk terbaik dari bengkel kami!</p>
            </div>
          )}

          {/* Item List */}
          <div className="space-y-6">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="
                  flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-lg border-l-4 border-[#FF6D1F]
                  hover:shadow-xl transition-shadow duration-200
                "
              >

                {/* Gambar Produk */}
                <img
                  src={item.image_url}
                  className="w-full sm:w-28 h-28 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                  alt={`Produk ${item.name}`}
                  // Fallback jika image_url tidak valid
                  onError={(e) => {
                    e.currentTarget.onerror = null; 
                    e.currentTarget.src = `https://placehold.co/112x112/cccccc/333333?text=${item.name.split(' ')[0]}`;
                  }}
                />

                <div className="flex grow justify-between">
                    <div className="flex flex-col justify-between py-1">
                        {/* Nama & Harga */}
                        <div>
                            <h2 className="text-lg font-bold text-[#234C6A] leading-snug">{item.name}</h2>
                            <p className="text-xl font-extrabold text-[#FF6D1F] mt-1">
                                Rp {item.price.toLocaleString("id-ID")}
                            </p>
                        </div>
                        
                        {/* Subtotal Item */}
                        <div className="text-sm text-gray-500">
                           Subtotal: <span className="font-semibold text-gray-700">Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                        </div>
                    </div>

                    {/* Kontrol Kuantitas & Hapus */}
                    <div className="flex flex-col items-end justify-between py-1">
                        {/* Kuantitas Kontrol */}
                        <div className="flex items-center border border-gray-300 rounded-full bg-gray-50">
                            <button 
                                onClick={() => decreaseQty(item.id)} 
                                disabled={item.qty === 1}
                                className="p-2 text-[#234C6A] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 rounded-l-full transition"
                            >
                                <Minus size={16} />
                            </button>

                            <span className="px-3 text-lg font-bold text-gray-800">{item.qty}</span>

                            <button 
                                onClick={() => increaseQty(item.id)} 
                                className="p-2 text-[#234C6A] hover:bg-gray-200 rounded-r-full transition"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Tombol Hapus */}
                        <button 
                            onClick={() => removeItem(item.id)} 
                            className="text-red-500 hover:text-red-700 transition flex items-center gap-1 mt-2 text-sm"
                        >
                            <Trash2 size={18} /> Hapus
                        </button>
                    </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* ================= SUMMARY CARD (RIGHT) ================= */}
        {cart.length > 0 && (
          <div className="w-full md:sticky md:top-6 h-fit">

            <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-[#234C6A]">
              <h2 className="text-2xl font-bold text-[#234C6A] mb-5 border-b pb-3 flex items-center gap-2">
                <DollarSign size={24} className="text-[#FF6D1F]" /> Rincian Pembayaran
              </h2>

              {/* Detail Harga */}
              <div className="space-y-3 mb-6 text-gray-700">
                  <div className="flex justify-between">
                      <span>Total Harga Produk ({cart.length} item)</span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                      <span>Diskon (Voucher)</span>
                      <span className="text-green-600">- Rp 0</span>
                  </div>
                  <div className="flex justify-between">
                      <span>Biaya Pengiriman</span>
                      <span>Rp 0</span>
                  </div>
              </div>

              {/* Total Final */}
              <div className="flex justify-between text-xl font-extrabold pt-4 border-t border-gray-200">
                <span className="text-[#234C6A]">TOTAL BAYAR</span>
                <span className="text-[#FF6D1F]">Rp {total.toLocaleString("id-ID")}</span>
              </div>

              {/* Tombol Checkout */}
              <a
                href="/checkout"
                className="block w-full text-center bg-[#FF6D1F] hover:bg-[#E05B1B] 
                text-white font-bold py-3 rounded-full mt-6 transition duration-300 shadow-lg shadow-[#FF6D1F]/40 transform hover:scale-[1.01]"
              >
                Lanjutkan ke Checkout ({cart.length} Item)
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}