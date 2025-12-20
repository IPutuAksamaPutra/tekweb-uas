"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

export default function ProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  /* ================= FETCH PRODUCT (ANTI LOOP) ================= */
  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/slug/${slug}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Fetch gagal");

        const data = await res.json();
        const p = data.product || data.data || data;

        // 🔥 NORMALISASI WAJIB
        setProduct({
          ...p,
          img_urls: Array.isArray(p.img_urls)
            ? p.img_urls
            : Array.isArray(p.image_urls)
            ? p.image_urls
            : [],
        });
      } catch (e) {
        console.error("FETCH PRODUCT ERROR:", e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  /* ================= FETCH REVIEW (AMAN) ================= */
  useEffect(() => {
    if (!product?.id) return;

    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {});
  }, [product?.id]);

  /* ================= HELPERS ================= */
  const getImageUrl = (index: number) => {
    const img = product?.img_urls?.[index];
    if (!img) return "https://placehold.co/600x600?text=No+Image";
    if (img.startsWith("http")) return img;
    return `${BASE_URL}/storage/products/${img}`;
  };

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

  /* ================= UI STATE ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#FF6D1F]" size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-gray-400">
        Produk tidak ditemukan
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 font-black text-[#234C6A]"
        >
          <ArrowLeft size={18} /> Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* IMAGE */}
          <div className="relative bg-white rounded-3xl border h-[500px] flex items-center justify-center">
            <img
              src={getImageUrl(currentImgIndex)}
              className="max-h-full max-w-full object-contain p-8"
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
                  className="absolute left-4 top-1/2 bg-white p-3 rounded-full"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() =>
                    setCurrentImgIndex(
                      (i) => (i + 1) % product.img_urls.length
                    )
                  }
                  className="absolute right-4 top-1/2 bg-white p-3 rounded-full"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>

          {/* INFO */}
          <div className="space-y-8">
            <h1 className="text-5xl font-black">{product.name}</h1>

            <div className="bg-white p-8 rounded-3xl border">
              <p className="text-6xl font-black text-[#FF6D1F]">
                Rp {Number(product.price).toLocaleString("id-ID")}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={loadingCart || product.stock === 0}
              className="w-full bg-[#FF6D1F] text-white py-6 rounded-3xl font-black flex justify-center gap-3"
            >
              {loadingCart ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <ShoppingCart /> Masukkan Keranjang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
