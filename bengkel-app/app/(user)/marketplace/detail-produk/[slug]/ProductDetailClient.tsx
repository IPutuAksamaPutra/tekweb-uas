"use client";

import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  img_urls?: string[];
}

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* IMAGE */}
        <div className="w-full aspect-square bg-gray-100 relative rounded">
          <Image
            src={
              product.img_urls?.[0] ??
              "/no-image.png"
            }
            alt={product.name}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {product.name}
          </h1>

          <p className="text-gray-600 mb-4">
            {product.description}
          </p>

          <p className="text-xl font-semibold text-green-600 mb-2">
            Rp {product.price.toLocaleString("id-ID")}
          </p>

          <p className="text-sm text-gray-500">
            Stok: {product.stock}
          </p>
        </div>
      </div>
    </div>
  );
}
