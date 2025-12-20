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
  img_urls: string; // DISAMAKAN DENGAN DATABASE
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
      className="group bg-white rounded-4xl shadow-md hover:shadow-2xl border-2 border-orange-400 overflow-hidden cursor-pointer transition-all duration-300"
    >
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.img_urls || "/no-image.png"} // MENGGUNAKAN img_urls
          alt={product.name}
          onError={(e) => (e.currentTarget.src = "/no-image.png")}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg">
          {product.discountPercent}% OFF
        </div>
      </div>

      <div className="p-5 flex flex-col justify-between h-44">
        <div>
          <h2 className="font-black text-sm text-[#0f172a] line-clamp-2 uppercase italic">
            {product.name}
          </h2>
          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest bg-slate-50 inline-block px-2 py-1 rounded-md">
            {product.jenis_barang}
          </p>
          <div className="mt-3">
            <p className="text-[10px] text-slate-400 line-through font-bold">
              Rp {formatRupiah(product.original_price)}
            </p>
            <p className="text-xl font-black text-[#FF6D1F]">
              Rp {formatRupiah(product.price)}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product.id);
          }}
          className="self-end bg-[#0f172a] text-white p-3 rounded-2xl hover:bg-orange-500 transition-all shadow-xl"
        >
          <PlusCircle size={22} />
        </button>
      </div>
    </div>
  );
}