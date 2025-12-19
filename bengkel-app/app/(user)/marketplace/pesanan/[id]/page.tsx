"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Package, CheckCircle, Truck, Star, ArrowLeft, CreditCard, MapPin } from "lucide-react";
import ReviewForm from "@/components/review/ReviewForm";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

/* ======================= TYPES ======================= */
interface Item {
  product_id: number;
  quantity: number;
  subtotal: number;
  product_name?: string; // Idealnya backend mengirimkan nama produk juga
}

interface Order {
  id: number;
  items: Item[];
  total: number;
  status: string;
  address?: string;
  payment?: string;
  created_at?: string;
}

interface ProductImageMap {
  [key: number]: string | null;
}

export default function DetailPesanan() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [productImages, setProductImages] = useState<ProductImageMap>({});
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMount, setIsMount] = useState(false);

  const getToken = useCallback(() => 
    typeof document !== "undefined" ? document.cookie.match(/token=([^;]+)/)?.[1] : null, 
  []);

  // ================= FETCH PRODUCT IMAGES (OPTIMIZED) =================
  const fetchProductImages = async (items: Item[]) => {
    try {
      // Hanya ambil data produk yang ada di order ini untuk efisiensi
      const res = await fetch("https://tekweb-uas-production.up.railway.app/api/products");
      const data = await res.json();
      
      const map: ProductImageMap = {};
      const productList = data.products || data.data || [];
      
      productList.forEach((p: any) => {
        if (items.some(item => item.product_id === p.id)) {
          const img = Array.isArray(p.img_urls) && p.img_urls.length > 0
            ? p.img_urls[0]
            : (typeof p.img_url === 'string' ? p.img_url : null);
          
          map[p.id] = img ? (img.startsWith('http') ? img : `https://tekweb-uas-production.up.railway.app/images/${img}`) : null;
        }
      });
      setProductImages(map);
    } catch (err) {
      console.error("Gagal memuat gambar produk", err);
    }
  };

  // ================= FETCH DETAIL ORDER =================
  useEffect(() => {
    setIsMount(true);
    const fetchDetail = async () => {
      const token = getToken();
      if (!token) return router.push("/auth/login");

      try {
        const res = await fetch(`https://tekweb-uas-production.up.railway.app/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Gagal memuat detail");

        const parsedOrder: Order = {
          ...data.order,
          items: typeof data.order.items === 'string' ? JSON.parse(data.order.items) : data.order.items,
        };

        setOrder(parsedOrder);
        await fetchProductImages(parsedOrder.items);
      } catch (err: any) {
        alertError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, getToken, router]);

  if (!isMount) return null;

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#FF6D1F] border-t-transparent"></div>
      <p className="mt-4 text-gray-500 font-medium">Memuat rincian pesanan...</p>
    </div>
  );

  if (!order) return <p className="mt-20 text-center">Pesanan tidak ditemukan.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BACK BUTTON */}
        <Link
          href="/marketplace/pesanan"
          className="flex items-center gap-2 text-sm text-[#234C6A] font-bold hover:text-[#FF6D1F] transition-colors w-fit"
        >
          <ArrowLeft size={18} /> Kembali ke Daftar Pesanan
        </Link>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="px-8 py-6 border-b bg-white flex flex-wrap justify-between items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#234C6A]">Invoice #{order.id}</h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Dipesan pada: {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </p>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-tighter shadow-sm
              ${order.status === "completed" ? "bg-green-50 text-green-600 border border-green-100" : "bg-orange-50 text-[#FF6D1F] border border-orange-100"}
            `}>
              {order.status === "completed" ? <CheckCircle size={16} /> : <Truck size={16} />}
              {order.status === "completed" ? "Selesai" : "Sedang Diproses"}
            </div>
          </div>

          {/* PRODUCT ITEMS */}
          <div className="px-8 py-6 space-y-6">
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Daftar Produk
            </h3>
            
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-5 p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                {/* PRODUCT IMAGE */}
                <div className="w-20 h-20 bg-white rounded-xl overflow-hidden border-2 border-gray-100 shrink-0">
                  {productImages[item.product_id] ? (
                    <img
                      src={productImages[item.product_id]!}
                      alt="Produk"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[10px] text-gray-300 font-bold">
                      NO IMAGE
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-lg">
                    {item.product_name || `Produk ID: #${item.product_id}`}
                  </p>
                  <p className="text-sm font-medium text-gray-400">
                    Jumlah: <span className="text-slate-800">{item.quantity} pcs</span>
                  </p>
                </div>

                {/* PRICE */}
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase">Subtotal</p>
                  <p className="font-black text-[#234C6A]">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* PAYMENT & ADDRESS INFO */}
          <div className="grid md:grid-cols-2 border-t border-gray-100 bg-gray-50/50">
            <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MapPin size={12}/> Alamat Pengiriman
              </p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {order.address || "Alamat tidak tersedia"}
              </p>
            </div>
            <div className="p-8">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CreditCard size={12}/> Metode Pembayaran
              </p>
              <p className="text-sm text-slate-800 font-bold capitalize">
                {order.payment || "Transfer Bank"}
              </p>
            </div>
          </div>

          {/* TOTAL FOOTER */}
          <div className="px-8 py-8 bg-[#234C6A] flex justify-between items-center">
            <span className="font-bold text-white/70 text-lg">Total Pembayaran</span>
            <span className="text-3xl font-black text-[#FF6D1F]">
              Rp {order.total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* REVIEW SECTION */}
        {order.status === "completed" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!showReview ? (
              <button
                onClick={() => setShowReview(true)}
                className="w-full bg-white border-2 border-[#FF6D1F] text-[#FF6D1F] hover:bg-[#FF6D1F] hover:text-white 
                           px-6 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
              >
                <Star size={20} className="fill-current" /> BERIKAN ULASAN PRODUK
              </button>
            ) : (
              <div className="bg-white rounded-3xl border-2 border-[#FF6D1F]/20 shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-[#234C6A]">Bagaimana Kualitas Produk Kami?</h3>
                  <button onClick={() => setShowReview(false)} className="text-gray-400 hover:text-red-500 font-bold">Batal</button>
                </div>
                <ReviewForm
                  orderId={order.id}
                  items={order.items}
                  onSuccess={() => {
                    setShowReview(false);
                    alertSuccess("Terima kasih atas ulasan Anda!");
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}