"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Tag,
  Zap,
  ChevronLeft,
  ChevronRight,
  Star,
  Info,
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://tekweb-uas-production.up.railway.app/api";

/* ===============================
   TYPES
================================ */
interface Product {
  id: number;
  name: string;
  slug: string;
  price: any;
  original_price?: any;
  is_promo?: boolean;
  stock: number;
  jenis_barang: string;
  description: string;
  img_urls: string[];
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: { name: string };
}

interface Props {
  initialProduct: Product | null;
  initialSlug: string;
}

/* ===============================
   IMAGE CAROUSEL
================================ */
const DetailImageCarousel = ({
  urls,
  alt,
}: {
  urls: string[];
  alt: string;
}) => {
  const [index, setIndex] = useState(0);
  const images = urls?.filter(Boolean) || [];

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 rounded-2xl border-2 border-dashed">
        <Info size={40} />
        <p className="mt-2 font-medium">Tidak ada gambar produk</p>
      </div>
    );
  }

  return (
    <div className="relative group w-full h-full overflow-hidden rounded-2xl bg-white border shadow-inner">
      <div
        className="flex h-full transition-transform duration-500"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="w-full h-full shrink-0 flex items-center justify-center p-6"
          >
            <img
              src={
                src.startsWith("http")
                  ? src
                  : `https://tekweb-uas-production.up.railway.app/images/${src}`
              }
              alt={`${alt} ${i + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() =>
              setIndex((i) => (i - 1 + images.length) % images.length)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() =>
              setIndex((i) => (i + 1) % images.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow"
          >
            <ChevronRight />
          </button>
        </>
      )}
    </div>
  );
};

/* ===============================
   MAIN COMPONENT
================================ */
export default function ProductDetailClient({
  initialProduct,
}: Props) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(
    initialProduct
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  /* FETCH REVIEW */
  useEffect(() => {
    if (!product?.id) return;

    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.average_rating || "0.0");
        setTotalReviews(data.total_reviews || 0);
      })
      .catch(console.error);
  }, [product?.id]);

  /* ADD TO CART (TETAP ADA) */
  const handleAddToCart = async () => {
    if (!product) return;

    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      alertError("Silakan login terlebih dahulu");
      return router.push("/auth/login");
    }

    setLoadingCart(true);
    try {
      const res = await fetch(`${API_URL}/cart`, {
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

      if (!res.ok) throw new Error();
      alertSuccess("Produk berhasil masuk keranjang");
    } catch {
      alertError("Gagal menambahkan ke keranjang");
    } finally {
      setLoadingCart(false);
    }
  };

  /* ===============================
     BUY NOW (INISIASI KE CHECKOUT)
     TANPA CART
  ================================ */
  const handleBuyNow = () => {
    if (!product) return;

    const buyNowPayload = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock,
      img: product.img_urls?.[0] || null,
    };

    localStorage.setItem(
      "buy_now_product",
      JSON.stringify(buyNowPayload)
    );

    router.push("/checkout");
  };

  if (!product) return null;

  const p = parseFloat(product.price);
  const op = product.original_price
    ? parseFloat(product.original_price)
    : 0;
  const hasPromo = product.is_promo && op > p;
  const discount = hasPromo
    ? Math.round(((op - p) / op) * 100)
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 font-bold text-[#234C6A]"
        >
          <ArrowLeft size={20} /> Kembali ke Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="lg:sticky lg:top-24 h-[550px]">
            <DetailImageCarousel
              urls={product.img_urls}
              alt={product.name}
            />
          </div>

          <div className="flex flex-col gap-8">
            <span className="bg-blue-100 text-[#234C6A] px-4 py-1.5 rounded-full text-xs font-black uppercase">
              {product.jenis_barang}
            </span>

            <h1 className="text-4xl font-black text-slate-900">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <Star className="fill-yellow-500 text-yellow-500" />
              <span className="font-bold text-slate-900">
                {avgRating}
              </span>
              <span className="text-slate-900">
                ({totalReviews} ulasan)
              </span>
            </div>

            {/* PRICE */}
            <div className="bg-white p-6 rounded-3xl border">
              {hasPromo && (
                <div className="flex gap-3">
                  <span className="line-through text-gray-300">
                    Rp {op.toLocaleString("id-ID")}
                  </span>
                  <span className="bg-red-500 text-white text-xs px-2 rounded">
                    -{discount}%
                  </span>
                </div>
              )}
              <p className="text-5xl font-black text-[#FF6D1F]">
                Rp {p.toLocaleString("id-ID")}
              </p>
            </div>

            {/* STOK & KATEGORI */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border">
                <p className="text-xs text-slate-900">
                  Stok Produk
                </p>
                <p className="font-bold text-slate-900">
                  {product.stock} Unit
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border">
                <p className="text-xs text-slate-900">
                  Kategori
                </p>
                <p className="font-bold text-slate-900">
                  {product.jenis_barang}
                </p>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={loadingCart || product.stock === 0}
                className="bg-[#FF6D1F] text-white py-5 rounded-2xl font-black"
              >
                {product.stock === 0
                  ? "Stok Habis"
                  : "Masukkan Keranjang"}
              </button>

              {/* ⬇️ SEKARANG BUY NOW TANPA CART */}
              <button
                onClick={handleBuyNow}
                className="bg-slate-900 text-white py-5 rounded-2xl font-black"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>

        {/* DESKRIPSI */}
        <div className="mt-16 bg-white p-10 rounded-3xl border-2 border-dashed border-slate-200">
          <h2 className="text-2xl font-black mb-4 text-slate-900">
            Deskripsi Produk
          </h2>
          <div
            className="text-slate-900 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: product.description.replace(
                /\n/g,
                "<br/>"
              ),
            }}
          />
        </div>

        {/* REVIEW */}
        <div className="mt-20">
          <h2 className="text-2xl font-black mb-8 text-[#234C6A]">
            Ulasan Pembeli
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border text-slate-900">
              Belum ada ulasan untuk produk ini
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white p-6 rounded-xl border-2 border-slate-200"
                >
                  <div className="flex justify-between mb-2">
                    <p className="font-bold text-slate-900">
                      {r.user.name}
                    </p>
                    <span className="text-xs text-slate-900">
                      {new Date(
                        r.created_at
                      ).toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < r.rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>

                  {r.comment && (
                    <p className="text-slate-900">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
