"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Package, CheckCircle, Truck, Star } from "lucide-react";
import ReviewForm from "@/components/review/ReviewForm";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

interface Item {
  product_id: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  items: Item[];
  total: number;
  status: string;
}

interface ProductImageMap {
  [key: number]: string | null;
}

export default function DetailPesanan() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [productImages, setProductImages] = useState<ProductImageMap>({});
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () =>
    typeof document !== "undefined"
      ? document.cookie.match(/token=([^;]+)/)?.[1]
      : null;

  // ================= FETCH DETAIL ORDER =================
  useEffect(() => {
    const fetchDetail = async () => {
      const token = getToken();

      if (!token) {
        alertError("Silakan login terlebih dahulu");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8000/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Gagal memuat detail pesanan");
        }

        const parsedOrder: Order = {
          ...data.order,
          items: Array.isArray(data.order.items)
            ? data.order.items
            : JSON.parse(data.order.items),
        };

        setOrder(parsedOrder);
        fetchProductImages(parsedOrder.items);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchDetail();
  }, [id]);

  // ================= FETCH PRODUCT IMAGES =================
  const fetchProductImages = async (items: Item[]) => {
    try {
      const res = await fetch("http://localhost:8000/api/products");
      const data = await res.json();

      const map: ProductImageMap = {};
      data.products.forEach((p: any) => {
        map[p.id] =
          Array.isArray(p.img_urls) && p.img_urls.length > 0
            ? p.img_urls[0]
            : null;
      });

      setProductImages(map);
    } catch (err) {
      console.error("Gagal memuat gambar produk", err);
    }
  };

  if (error) {
    return (
      <p className="mt-10 text-center text-red-600">{error}</p>
    );
  }

  if (!order) {
    return (
      <p className="mt-10 text-center text-gray-500">
        Memuat detail pesanan...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6 text-black">

        {/* BACK */}
        <Link
          href="/marketplace/pesanan"
          className="inline-block text-sm text-[#234C6A] font-semibold hover:underline"
        >
          ← Kembali ke Pesanan
        </Link>

        {/* CARD */}
        <div className="bg-white rounded-2xl border shadow-sm">

          {/* HEADER */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <div>
              <h2 className="text-xl font-bold text-[#234C6A]">
                Detail Pesanan #{order.id}
              </h2>
              <p className="text-sm text-gray-500">
                Rincian produk yang kamu beli
              </p>
            </div>

            <span
              className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full
                ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
            >
              {order.status === "completed" ? (
                <>
                  <CheckCircle size={14} /> Selesai
                </>
              ) : (
                <>
                  <Truck size={14} /> Diproses
                </>
              )}
            </span>
          </div>

          {/* ITEMS */}
          <div className="px-6 py-4 space-y-4">
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b last:border-b-0 pb-3"
              >
                {/* IMAGE */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border">
                  {productImages[item.product_id] ? (
                    <img
                      src={productImages[item.product_id] as string}
                      alt="Produk"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    Produk #{item.product_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                </div>

                {/* PRICE */}
                <div className="font-semibold">
                  Rp {item.subtotal.toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50 rounded-b-2xl">
            <span className="font-semibold text-gray-700">
              Total Pembayaran
            </span>
            <span className="text-xl font-bold text-[#FF6D1F]">
              Rp {order.total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* REVIEW */}
        {order.status === "completed" && (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            {!showReview ? (
              <button
                onClick={() => setShowReview(true)}
                className="flex items-center gap-2 bg-[#FF6D1F]
                           hover:bg-[#E05B1B] text-white px-5 py-3
                           rounded-full font-semibold transition"
              >
                <Star size={18} /> Tulis Review Produk
              </button>
            ) : (
              <ReviewForm
                orderId={order.id}
                items={order.items}
                onSuccess={() => setShowReview(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
