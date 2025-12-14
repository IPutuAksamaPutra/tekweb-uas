"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  MessageSquare,
  Tag,
  Info,
  ShieldCheck,
  Truck,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ===============================
   INTERFACE
================================ */
interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  is_promo?: boolean;
  stock: number;
  jenis_barang: string;
  description: string;
  img_url: string[];
}

/* ===============================
   PRICE HELPER
================================ */
function getPriceInfo(product: Product) {
  const hasPromo =
    product.is_promo &&
    product.original_price &&
    product.original_price > product.price;

  return {
    hasPromo,
    original: product.original_price ?? product.price,
    final: product.price,
    discount: hasPromo
      ? Math.round(
          ((product.original_price! - product.price) /
            product.original_price!) *
            100
        )
      : 0,
  };
}

/* ===============================
   ADD TO CART (LOCAL)
================================ */
const addToCart = (product: Product) => {
  const saved = localStorage.getItem("cart");
  const cartItems = saved ? JSON.parse(saved) : [];

  const index = cartItems.findIndex((p: any) => p.id === product.id);

  if (index > -1) cartItems[index].qty += 1;
  else cartItems.push({ ...product, qty: 1 });

  localStorage.setItem("cart", JSON.stringify(cartItems));
};

/* ===============================
   IMAGE CAROUSEL (FIXED)
================================ */
interface DetailImageCarouselProps {
  urls: string[];
  alt: string;
}

const DetailImageCarousel = ({ urls, alt }: DetailImageCarouselProps) => {
  const [index, setIndex] = useState(0);
  const images = urls.filter(Boolean);

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Tidak ada gambar
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {/* SLIDE TRACK */}
      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="w-full h-full flex-shrink-0">
            <img
              src={src}
              alt={`${alt} ${i + 1}`}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* NAV BUTTON */}
      {images.length > 1 && (
        <>
          <button
            onClick={() =>
              setIndex((prev) => (prev - 1 + images.length) % images.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => setIndex((prev) => (prev + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* DOTS */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${
              i === index ? "bg-orange-500" : "bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ===============================
   FEATURE
================================ */
const FeatureHighlight = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) => (
  <div className="flex gap-3 bg-gray-50 p-3 rounded-lg">
    <Icon className="text-[#234C6A]" />
    <div>
      <p className="font-bold text-sm">{title}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </div>
);

/* ===============================
   REVIEW
================================ */
const ReviewCard = ({
  name,
  rating,
  comment,
}: {
  name: string;
  rating: number;
  comment: string;
}) => (
  <div className="border p-4 rounded-xl">
    <b>{name}</b>
    <div className="flex text-yellow-500 my-1">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} size={16} fill="gold" />
      ))}
    </div>
    <p className="text-sm italic">"{comment}"</p>
  </div>
);

/* ===============================
   MAIN PAGE
================================ */
export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("selectedProduct");
    if (!data) return;

    const parsed = JSON.parse(data);

    parsed.img_url = Array.isArray(parsed.img_url)
      ? parsed.img_url
      : [parsed.img_url];

    setProduct(parsed);
  }, []);

  if (!product)
    return <div className="text-center py-20">Produk tidak ditemukan</div>;

  const { hasPromo, original, final, discount } = getPriceInfo(product);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 font-bold text-[#234C6A]"
        >
          <ArrowLeft /> Kembali
        </button>

        {/* PRODUCT */}
        <div className="grid md:grid-cols-12 gap-8 bg-white p-8 rounded-3xl">
          {/* IMAGE */}
          <div className="md:col-span-5 bg-gray-100 p-4 rounded-xl">
            <div className="aspect-square w-full">
              <DetailImageCarousel
                urls={product.img_url}
                alt={product.name}
              />
            </div>
          </div>

          {/* INFO */}
          <div className="md:col-span-7 space-y-4">
            <p className="text-orange-500 font-bold flex gap-1">
              <Tag size={16} /> {product.jenis_barang}
            </p>

            <h1 className="text-4xl font-extrabold text-gray-700">{product.name}</h1>

            {hasPromo && (
              <p className="line-through text-gray-400">
                Rp {original.toLocaleString("id-ID")}
              </p>
            )}
            <p className="text-5xl font-black text-orange-500">
              Rp {final.toLocaleString("id-ID")}
            </p>

            {hasPromo && (
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold text-sm">
                HEMAT {discount}%
              </span>
            )}

            <div className="flex gap-4 mt-4 ">
              <button
                onClick={() => addToCart(product)}
                className="flex-1 bg-[#234C6A] text-white py-4 rounded-xl font-bold flex justify-center gap-2"
              >
                <ShoppingCart /> Masukkan Keranjang
              </button>

              <button className="flex-1 border-2 border-orange-500 text-orange-500 py-4 rounded-xl font-bold">
                Beli Sekarang
              </button>
            </div>

            <p className="text-xs text-gray-500 flex gap-1">
              <Info size={14} /> Dikirim 1x24 jam
            </p>
          </div>
        </div>

        {/* FEATURE */}
        <div className="grid grid-cols-3 gap-4 mt-8 text-gray-500">
          <FeatureHighlight
            icon={ShieldCheck}
            title="Garansi Resmi"
            desc="100% original"
          />
          <FeatureHighlight
            icon={Truck}
            title="Gratis Ongkir"
            desc="S&K berlaku"
          />
          <FeatureHighlight
            icon={Zap}
            title="Ready Stock"
            desc="Kirim cepat"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white p-6 rounded-xl mt-8 text-gray-500">
          <h2 className="font-bold text-xl mb-3">Deskripsi</h2>
          <p className="whitespace-pre-wrap text-gray-700">
            {product.description}
          </p>
        </div>

        {/* REVIEW */}
        <div className="bg-white p-6 rounded-xl mt-8 text-gray-500">
          <h2 className="font-bold text-xl mb-4 flex gap-2">
            <MessageSquare /> Ulasan
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-gray-500">
            <ReviewCard name="Rizky" rating={5} comment="Barang mantap!" />
            <ReviewCard name="Siti" rating={4} comment="Sesuai deskripsi." />
            <ReviewCard name="Bambang" rating={5} comment="Pengiriman cepat!" />
          </div>
        </div>
      </div>
    </div>
  );
}
