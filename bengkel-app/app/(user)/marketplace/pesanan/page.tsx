"use client";

import Link from "next/link";
// Impor ikon yang diperlukan untuk visual status
import { Truck, CheckCircle } from "lucide-react"; 

interface Order {
  id: number;
  product: string;
  image: string;
  status: "diproses" | "selesai";
  date: string;
  price: number;
}

// Dummy Data (sementara)
const orders: Order[] = [
  { id: 1, product: "Oli Mesin Yamalube Power Matic", image: "/oli.jpg", status: "selesai", date: "12 Feb 2025", price: 65000 },
  { id: 2, product: "Kampas Rem Depan Racing", image: "/kampas.jpg", status: "diproses", date: "13 Feb 2025", price: 85000 },
];

export default function PesananPage() {
  return (
    // Padding disesuaikan (p-4 di mobile, p-6 di desktop)
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 sm:space-y-8 bg-gray-50 min-h-screen">
      
      {/* TITLE */}
      <h1 className="text-3xl font-bold text-[#234C6A] text-center border-b pb-2">
        Pesanan Saya 📦
      </h1>

      {/* LIST KARTU PESANAN */}
      <div className="space-y-4">
        {orders.map((item) => (
          <div 
            key={item.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center px-3 py-2 sm:px-4 sm:py-3 border-b bg-gray-50 rounded-t-xl">
              {/* Ukuran font date diperkecil di mobile */}
              <span className="text-xs sm:text-sm text-gray-500">{item.date}</span>

              {/* Status Badge - menggunakan ikon dan ukuran responsif */}
              <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase
                ${item.status === "selesai" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-orange-100 text-orange-700"}
              `}>
                {item.status === "selesai" 
                    ? <><CheckCircle size={12} /> Selesai</>
                    : <><Truck size={12} /> Sedang Diproses</>}
              </span>
            </div>

            {/* PRODUCT ROW - Dibuat lebih responsif */}
            <div className="flex gap-3 p-3 sm:gap-4 sm:p-4 items-center">
              <img 
                src={item.image} 
                alt={item.product} 
                // Ukuran gambar disesuaikan
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border flex-shrink-0"
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/80x80?text=Produk";
                }}
              />

              <div className="flex-1 min-w-0">
                {/* Ukuran font nama produk disesuaikan */}
                <p className="text-sm sm:text-lg font-semibold text-[#234C6A] line-clamp-2">{item.product}</p>
                <p className="text-xs sm:text-sm text-gray-500">Jumlah: 1 barang</p>
                
                {/* PERBAIKAN HYDRATION ERROR: Menetapkan locale id-ID */}
                <p className="font-bold text-[#FF6D1F] mt-1 text-sm sm:text-base">
                  Rp {item.price.toLocaleString("id-ID")}
                </p>
                
              </div>
            </div>

            {/* FOOTER BUTTON */}
            <div className="border-t px-3 py-2 sm:px-4 sm:py-3 flex justify-end bg-gray-50 rounded-b-xl">
              <Link 
                href={`/marketplace/pesanan/${item.id}`}
                // Ukuran tombol disesuaikan
                className="bg-[#234C6A] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-[#1A374A] transition-colors text-xs sm:text-sm font-medium shadow-md"
              >
                Lihat Detail
              </Link>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-center text-gray-500 py-10 border rounded-xl bg-white shadow-sm">Belum ada pesanan yang tercatat.</p>
        )}
      </div>

    </div>
  );
}