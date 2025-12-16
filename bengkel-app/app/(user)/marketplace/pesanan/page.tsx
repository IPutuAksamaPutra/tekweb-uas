"use client";

import Link from "next/link";
import { Truck, CheckCircle, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

interface Order {
  id: number;
  items: {
    product_id: number;
    quantity: number;
    subtotal: number;
  }[];
  name: string;
  total: number;
  status: string;
  created_at: string;
}

interface ProductImageMap {
  [key: number]: string | null;
}

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productImages, setProductImages] = useState<ProductImageMap>({});
  const [loading, setLoading] = useState(true);

  // ================= GET DATA ORDER =================
  const fetchOrders = async () => {
    try {
      const token = getCookie("token");
      if (!token) return alertError("Silahkan login dulu!");

      const res = await fetch("http://localhost:8000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data);

      setOrders(data.orders);
      await fetchProductImages(data.orders);
    } catch (e) {
      console.error(e);
      alert("Gagal memuat daftar pesanan!");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH PRODUCT IMAGES =================
  const fetchProductImages = async (orders: Order[]) => {
    const productIds = Array.from(
      new Set(orders.flatMap((o) => o.items.map((i) => i.product_id)))
    );

    if (productIds.length === 0) return;

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
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500">
        Memuat pesanan...
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* TITLE */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-[#234C6A]">
            Pesanan Saya
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Riwayat dan status pesanan kamu
          </p>
        </div>

        {/* LIST PESANAN */}
        <div className="space-y-5">
          {orders.length > 0 ? (
            orders.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center px-5 py-4 border-b">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </p>
                    <p className="font-bold text-[#234C6A]">
                      Pesanan #{item.id}
                    </p>
                  </div>

                  <span
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full
                      ${
                        item.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                  >
                    {item.status === "completed" ? (
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

                {/* BODY */}
                <div className="px-5 py-4 space-y-3">
                  {item.items.map((i, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border">
                        {productImages[i.product_id] ? (
                          <img
                            src={productImages[i.product_id] as string}
                            className="w-full h-full object-cover"
                            alt="Produk"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-sm text-gray-600">
                        <Package size={14} className="inline mr-1" />
                        Produk #{i.product_id} × {i.quantity}
                      </div>
                    </div>
                  ))}

                  <p className="text-lg font-bold text-[#FF6D1F] mt-2">
                    Rp {item.total.toLocaleString("id-ID")}
                  </p>
                </div>

                {/* FOOTER */}
                <div className="border-t px-5 py-3 flex justify-end bg-gray-50 rounded-b-2xl">
                  <Link
                    href={`/marketplace/pesanan/${item.id}`}
                    className="px-5 py-2 rounded-full bg-[#234C6A] text-white text-sm font-semibold
                               hover:bg-[#1A374A] transition"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border shadow-sm">
              <p className="text-gray-500">
                Belum ada pesanan yang tercatat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
