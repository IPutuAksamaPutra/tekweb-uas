"use client";

import { PlusCircle } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  img_urls: string[];
  jenis_barang: string;
}

interface Props {
  product: Product;
  onAdd: (id: number) => void;
  onClick: () => void;
}

const formatRupiah = (v: number) =>
  Math.round(v).toLocaleString("id-ID");

export default function ProductCard({ product, onAdd, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow hover:shadow-lg cursor-pointer"
    >
      <div className="h-44 bg-gray-100 overflow-hidden">
        <img
          src={product.img_urls?.[0] || "/no-image.png"}
          alt={product.name}
          onError={(e) => (e.currentTarget.src = "/no-image.png")}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 flex flex-col">
        <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500">{product.jenis_barang}</p>

        <div className="flex justify-between items-center mt-3">
          <p className="font-bold text-orange-500">
            Rp {formatRupiah(product.price)}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product.id);
            }}
            className="bg-orange-500 text-white p-2 rounded-full"
          >
            <PlusCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
