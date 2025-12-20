"use client";

import { PlusCircle } from "lucide-react";

/* ================= TYPES ================= */
interface PromoProduct {
  id: number;
  name: string;
  price: number;
  original_price: number;
  discountPercent: number;
  jenis_barang: string;
  img_urls: string; // ganti nama sesuai API, berisi URL lengkap
}

interface Props {
  product: PromoProduct;
  onAdd: (id: number) => void;
  onClick: () => void;
}

const formatRupiah = (v: number) =>
  Math.round(v).toLocaleString("id-ID");

export default function ProductCardPromo({
  product,
  onAdd,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-4xl shadow-md hover:shadow-2xl border-2 border-orange-400 overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
    >
      {/* BAGIAN GAMBAR */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.img_urls || "/no-image.png"} 
          alt={product.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/no-image.png";
          }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />

        {/* BADGE DISKON */}
        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg italic animate-bounce">
          {product.discountPercent}% OFF
        </div>
      </div>

      {/* INFO PRODUK */}
      <div className="p-5 flex flex-col justify-between h-48">
        <div>
          <h2 className="font-black text-sm text-[#0f172a] line-clamp-2 uppercase italic leading-tight">
            {product.name}
          </h2>
          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-100">
            {product.jenis_barang}
          </p>
          
          <div className="mt-4">
            <p className="text-[10px] text-slate-300 line-through font-bold italic">
              Rp {formatRupiah(product.original_price)}
            </p>
            <p className="text-2xl font-black text-orange-500 tracking-tighter italic">
              Rp {formatRupiah(product.price)}
            </p>
          </div>
        </div>

        {/* TOMBOL ADD TO CART */}
        <div className="flex justify-end items-center mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Biar gak lari ke detail
              onAdd(product.id);
            }}
            className="bg-[#0f172a] text-white p-3 rounded-2xl hover:bg-orange-500 transition-all shadow-xl active:scale-90"
          >
            <PlusCircle size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
