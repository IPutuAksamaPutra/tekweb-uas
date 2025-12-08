"use client";

import Link from "next/link";
import { Truck, CheckCircle } from "lucide-react"; 
import { useEffect, useState } from "react";

// ===============================
// Interface Order
// ===============================
interface Order {
  id: number;
  product: string;
  image: string;
  status: "diproses" | "selesai";
  date: string;
  price: number;
}

// ===============================
// Pesanan Page
// ===============================
export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Ambil data pesanan lama dari localStorage
    const savedOrders = localStorage.getItem("orders");
    const parsedOrders: Order[] = savedOrders ? JSON.parse(savedOrders) : [];

    // Cek apakah ada item baru dari "Beli Sekarang"
    const checkoutItem = localStorage.getItem("checkoutItem");
    if (checkoutItem) {
      const product = JSON.parse(checkoutItem);
      const newOrder: Order = {
        id: Date.now(), // ID unik berdasarkan timestamp
        product: product.name,
        image: product.img_url,
        status: "diproses",
        date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        price: product.price,
      };

      // Tambahkan ke list pesanan
      parsedOrders.unshift(newOrder);
      // Hapus item checkout agar tidak duplikat
      localStorage.removeItem("checkoutItem");
      // Simpan kembali ke localStorage
      localStorage.setItem("orders", JSON.stringify(parsedOrders));
    }

    setOrders(parsedOrders);
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 sm:space-y-8 bg-gray-50 min-h-screen">
      {/* TITLE */}
      <h1 className="text-3xl font-bold text-[#234C6A] text-center border-b pb-2">
        Pesanan Saya 📦
      </h1>

      {/* LIST PESANAN */}
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center px-3 py-2 sm:px-4 sm:py-3 border-b bg-gray-50 rounded-t-xl">
                <span className="text-xs sm:text-sm text-gray-500">{item.date}</span>
                <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase
                  ${item.status === "selesai" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
                `}>
                  {item.status === "selesai" 
                    ? <><CheckCircle size={12} /> Selesai</>
                    : <><Truck size={12} /> Sedang Diproses</>}
                </span>
              </div>

              {/* PRODUCT ROW */}
              <div className="flex gap-3 p-3 sm:gap-4 sm:p-4 items-center">
                <img 
                  src={item.image} 
                  alt={item.product} 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/80x80?text=Produk";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-lg font-semibold text-[#234C6A] line-clamp-2">{item.product}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Jumlah: 1 barang</p>
                  <p className="font-bold text-[#FF6D1F] mt-1 text-sm sm:text-base">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* FOOTER BUTTON */}
              <div className="border-t px-3 py-2 sm:px-4 sm:py-3 flex justify-end bg-gray-50 rounded-b-xl">
                <Link 
                  href={`/marketplace/pesanan/${item.id}`}
                  className="bg-[#234C6A] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-[#1A374A] transition-colors text-xs sm:text-sm font-medium shadow-md"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-10 border rounded-xl bg-white shadow-sm">
            Belum ada pesanan yang tercatat.
          </p>
        )}
      </div>
    </div>
  );
}
