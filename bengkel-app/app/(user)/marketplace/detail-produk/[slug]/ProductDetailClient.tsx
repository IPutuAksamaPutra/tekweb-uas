"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2,
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

/* ================= INTERFACE ================= */

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
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  /* ================= IMAGE ================= */

  const getImageUrl = (index: number) => {
    const img = product.img_urls?.[index];
    if (!img) return `${BASE_URL}/storage/products/default.png`;
    if (img.startsWith("http")) return img;
    return `${BASE_URL}/storage/products/${img}`;
  };

  /* ================= FETCH REVIEW (ANTI LOOP) ================= */

  useEffect(() => {
    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.average_rating || "0.0");
        setTotalReviews(data.total_reviews || 0);
      })
      .catch(() => {});
  }, [product.id]);

  /* ================= CART ================= */

  const handleAddToCart = async () => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      alertError("Silakan login terlebih dahulu");
      router.push("/auth/login");
      return;
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
      alertSuccess("Berhasil masuk keranjang");
    } catch {
      alertError("Gagal menambahkan ke keranjang");
    } finally {
      setLoadingCart(false);
    }
  };

  const p = parseFloat(product.price);
  const op = product.original_price ? parseFloat(product.original_price) : 0;
  const hasPromo = product.is_promo && op > p;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 font-bold text-[#234C6A]"
        >
          <ArrowLeft size={20} /> Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* IMAGE */}
          <div className="relative bg-white rounded-2xl border">
            <img
              src={getImageUrl(currentImgIndex)}
              alt={product.name}
              className="w-full h-[500px] object-contain p-6"
            />

            {product.img_urls.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImgIndex(
                      (i) =>
                        (i - 1 + product.img_urls.length) %
                        product.img_urls.length
                    )
                  }
                  className="absolute left-4 top-1/2 bg-white p-2 rounded-full"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() =>
                    setCurrentImgIndex(
                      (i) => (i + 1) % product.img_urls.length
                    )
                  }
                  className="absolute right-4 top-1/2 bg-white p-2 rounded-full"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>

          {/* INFO */}
          <div className="space-y-6">
            <h1 className="text-4xl font-black">{product.name}</h1>

            <div className="flex items-center gap-2">
              <Star className="text-yellow-500 fill-yellow-500" />
              <b>{avgRating}</b>
              <span className="text-gray-500">
                ({totalReviews} ulasan)
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border">
              {hasPromo && (
                <p className="line-through text-gray-400">
                  Rp {op.toLocaleString("id-ID")}
                </p>
              )}
              <p className="text-4xl font-black text-[#FF6D1F]">
                Rp {p.toLocaleString("id-ID")}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={loadingCart || product.stock === 0}
              className="w-full bg-[#FF6D1F] text-white py-4 rounded-xl font-black"
            >
              {loadingCart ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Masukkan Keranjang"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
