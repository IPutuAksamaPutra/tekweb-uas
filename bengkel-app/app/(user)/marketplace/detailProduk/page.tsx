"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
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

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    name: string;
  };
}

/* ===============================
   PRICE HELPER (TIDAK DIUBAH)
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
   ADD TO CART (TIDAK DIUBAH)
================================ */
const addToCart = async (product: Product) => {
  const token = document.cookie.match(/token=([^;]+)/)?.[1];
  if (!token) return;

  await fetch("http://localhost:8000/api/cart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: product.id,
      quantity: 1,
      price: product.price,
    }),
  });
};

/* ===============================
   IMAGE CAROUSEL (TIDAK DIUBAH)
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
      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => {
          const imgSrc = src.startsWith("http")
            ? src
            : `http://localhost:8000/images/${src}`;

          return (
            <div key={i} className="w-full h-full shrink-0">
              <img
                src={imgSrc}
                alt={`${alt} ${i + 1}`}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          );
        })}
      </div>

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
    </div>
  );
};

/* ===============================
   MAIN PAGE
================================ */
export default function ProductDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);

  /* ===============================
     INIT PRODUCT (TAMBAHAN AMAN)
  ================================ */
  useEffect(() => {
    // PRIORITAS 1: DARI URL
    if (productId) {
      fetch(`http://localhost:8000/api/products/${productId}`)
        .then(res => res.json())
        .then(data => {
          const p = data.product;
          p.img_url = Array.isArray(p.img_urls)
            ? p.img_urls
            : [p.img_urls];
          setProduct(p);
        })
        .catch(() => setProduct(null));
      return;
    }

    // FALLBACK: localStorage (KODE LAMA)
    const data = localStorage.getItem("selectedProduct");
    if (!data) return;

    const parsed = JSON.parse(data);
    parsed.img_url = Array.isArray(parsed.img_url)
      ? parsed.img_url
      : [parsed.img_url];

    setProduct(parsed);
  }, [productId]);

  /* ===============================
     FETCH REVIEW (TIDAK DIUBAH)
  ================================ */
  useEffect(() => {
    if (!product) return;

    fetch(`http://localhost:8000/api/reviews?product_id=${product.id}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setAvgRating(data.average_rating || "0.0");
        setTotalReviews(data.total_reviews || 0);
      })
      .catch(err => console.error(err));
  }, [product]);

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

        {/* ================= DETAIL ================= */}
        <div className="grid md:grid-cols-12 gap-8 bg-white p-8 rounded-3xl">

          <div className="md:col-span-5 bg-gray-100 p-4 rounded-xl">
            <div className="aspect-square w-full">
              <DetailImageCarousel
                urls={product.img_url}
                alt={product.name}
              />
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <p className="text-orange-500 font-bold flex gap-1">
              <Tag size={16} /> {product.jenis_barang}
            </p>

            <h1 className="text-3xl font-extrabold text-gray-800">
              {product.name}
            </h1>

            <div className="flex items-center gap-2">
              <span className="text-yellow-500">
                {"★".repeat(Math.round(Number(avgRating)))}
                {"☆".repeat(5 - Math.round(Number(avgRating)))}
              </span>
              <span className="text-sm text-gray-600">
                {avgRating} ({totalReviews} ulasan)
              </span>
            </div>

            {hasPromo && (
              <p className="line-through text-gray-400">
                Rp {original.toLocaleString("id-ID")}
              </p>
            )}

            <p className="text-4xl font-black text-orange-500">
              Rp {final.toLocaleString("id-ID")}
            </p>

            {hasPromo && (
              <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold text-sm">
                HEMAT {discount}%
              </span>
            )}

            <p
              className={`text-sm font-semibold ${
                product.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.stock > 0
                ? `Stok tersedia: ${product.stock}`
                : "Stok habis"}
            </p>

            <div className="flex gap-4 mt-6">
              <button
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart(product);
                  router.push("/cart");
                }}
                className={`flex-1 py-4 rounded-xl font-bold flex justify-center gap-2
                  ${
                    product.stock === 0
                      ? "bg-gray-300 text-gray-500"
                      : "bg-[#234C6A] text-white"
                  }`}
              >
                <ShoppingCart /> Masukkan Keranjang
              </button>

              <button
                disabled={product.stock === 0}
                onClick={() => router.push("/checkout")}
                className={`flex-1 py-4 rounded-xl font-bold
                  ${
                    product.stock === 0
                      ? "border-2 border-gray-300 text-gray-400"
                      : "border-2 border-orange-500 text-orange-500"
                  }`}
              >
                Beli Sekarang
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-orange-500" />
                Pengiriman cepat
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-600" />
                Garansi resmi
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-blue-500" />
                Proses instan
              </div>
            </div>

            <p className="text-xs text-gray-500 flex gap-1 mt-4">
              <Info size={14} /> Dikirim 1x24 jam
            </p>
          </div>
        </div>

        {/* ================= REVIEW ================= */}
        <div className="bg-white mt-10 p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6">Ulasan Pembeli</h2>

          {reviews.length === 0 && (
            <p className="text-gray-500">
              Belum ada ulasan untuk produk ini.
            </p>
          )}

          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="border rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{r.user.name}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>

                <div className="text-yellow-500 my-1">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>

                {r.comment && (
                  <p className="text-gray-700 text-sm">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
