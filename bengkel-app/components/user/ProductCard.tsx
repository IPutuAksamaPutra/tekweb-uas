"use client";

import { PlusCircle } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  img_url: string;
  jenis_barang: string;
}

interface Props {
  product: Product;
  onAdd: (id:number)=>void;
  onClick: ()=>void;
}

export default function ProductCard({ product, onAdd, onClick }: Props) {

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-xl shadow-lg border hover:border-[#FF6D1F] overflow-hidden cursor-pointer transition"
    >
      <img
        src={product.img_url}
        alt={product.name}
        className="w-full h-44 object-cover group-hover:scale-[1.03] transition"
      />

      <div className="p-4 flex flex-col h-36 justify-between">
        <div>
          <h2 className="font-bold text-lg text-[#234C6A] line-clamp-2">
            {product.name}
          </h2>
          <p className="text-sm text-gray-500">{product.jenis_barang}</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xl font-bold text-[#FF6D1F]">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <button
            onClick={(e)=>{
              e.stopPropagation();
              onAdd(product.id);
            }}
            className="bg-[#234C6A] text-white p-2 rounded-full hover:bg-[#1c3d52] transition"
          >
            <PlusCircle size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
