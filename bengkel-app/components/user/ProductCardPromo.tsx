"use client";

import { PlusCircle } from "lucide-react";

export default function ProductCardPromo({ product, onAdd, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl shadow hover:shadow-xl border border-orange-400 overflow-hidden cursor-pointer transition"
    >
      <img
        src={product.img_url || "/no-image.png"}
        alt={product.name}
        className="w-full h-full object-cover"
      />

      <div className="p-4 flex flex-col justify-between h-36">
        <div>
          <h2 className="font-bold text-lg text-[#234C6A] line-clamp-2">
            {product.name}
          </h2>
          <p className="text-gray-500 text-sm">{product.jenis_barang}</p>

          <p className="text-xs line-through text-gray-400">
            Rp {product.original_price.toLocaleString("id-ID")}
          </p>
          <p className="text-xl font-bold text-[#FF6D1F]">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <span className="text-xs bg-red-100 px-2 py-1 rounded font-semibold text-red-600">
            {product.discountPercent}% OFF 🔥
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="bg-[#234C6A] text-white p-2 rounded-full hover:bg-[#1e3d50] self-end transition"
        >
          <PlusCircle size={22} />
        </button>
      </div>
    </div>
  );
}
