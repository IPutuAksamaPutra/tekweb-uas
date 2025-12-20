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
  img_url: string;
}

interface Props {
  product: PromoProduct;
  onAdd: (id: number) => void;
  onClick: () => void;
}

/* ================= FORMAT RUPIAH ================= */
const formatRupiah = (v: number) =>
  Math.round(v).toLocaleString("id-ID");

/* ================= COMPONENT ================= */
export default function ProductCardPromo({
  product,
  onAdd,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl shadow-md 
                 hover:shadow-xl border-2 border-orange-400
                 overflow-hidden cursor-pointer transition"
    >
      {/* ================= IMAGE (FIXED HEIGHT) ================= */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        <img
          src={product.img_url || "/no-image.png"}
          alt={product.name}
          onError={(e) => (e.currentTarget.src = "/no-image.png")}
          className="w-full h-full object-cover 
                     group-hover:scale-105 transition-transform"
        />

        {/* BADGE DISKON */}
        <span className="absolute top-3 left-3 
                         bg-red-600 text-white 
                         text-xs font-black px-3 py-1 
                         rounded-full shadow">
          {product.discountPercent}% OFF
        </span>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-4 flex flex-col justify-between h-40">
        <div>
          <h2 className="font-bold text-[15px] text-[#234C6A] line-clamp-2">
            {product.name}
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            {product.jenis_barang}
          </p>

          {/* PRICE */}
          <p className="text-xs text-gray-400 line-through mt-1">
            Rp {formatRupiah(product.original_price)}
          </p>
          <p className="text-lg font-bold text-[#FF6D1F]">
            Rp {formatRupiah(product.price)}
          </p>
        </div>

        {/* ================= ADD BUTTON ================= */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product.id);
          }}
          className="self-end bg-[#234C6A] text-white 
                     p-2 rounded-full shadow
                     hover:bg-[#1e3d50] transition"
        >
          <PlusCircle size={22} />
        </button>
      </div>
    </div>
  );
}
