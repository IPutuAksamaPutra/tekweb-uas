"use client";

import { PlusCircle } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;             // harga aktif (promo / normal)
  original_price?: number;   // harga sebelum promo
  stock: number;
  img_url: string;
  jenis_barang: string;
  is_promo?: boolean;
}

interface Props {
  product: Product;
  onAdd: (id: number) => void;
  onClick: () => void;
}

// =======================
// FORMAT RUPIAH (GLOBAL SAFE)
// =======================
const formatRupiah = (value: number) =>
  Math.round(Number(value)).toLocaleString("id-ID");

export default function ProductCard({ product, onAdd, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl shadow-md border 
                 hover:border-[#FF6D1F] hover:shadow-lg
                 overflow-hidden cursor-pointer transition"
    >
      {/* IMAGE */}
      <div className="w-full h-44 bg-gray-100 overflow-hidden">
        <img
          src={product.img_url || "/no-image.png"}
          alt={product.name}
          onError={(e) => (e.currentTarget.src = "/no-image.png")}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col h-36 justify-between">
        {/* INFO */}
        <div>
          <h2 className="font-bold text-[15px] text-[#234C6A] line-clamp-2">
            {product.name}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {product.jenis_barang}
          </p>
        </div>

        {/* PRICE + ACTION */}
        <div className="flex justify-between items-end mt-2">
          {/* PRICE */}
          <div>
            {product.is_promo && product.original_price ? (
              <>
                <p className="text-xs text-gray-400 line-through">
                  Rp {formatRupiah(product.original_price)}
                </p>
                <p className="text-lg font-bold text-[#FF6D1F]">
                  Rp {formatRupiah(product.price)}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-[#FF6D1F]">
                Rp {formatRupiah(product.price)}
              </p>
            )}
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product.id);
            }}
            className="bg-[#234C6A] text-white p-2 rounded-full 
                       hover:bg-[#1c3d52] transition shadow"
          >
            <PlusCircle size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
