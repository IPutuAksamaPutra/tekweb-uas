"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

// URL API Laravel Anda
const API_URL = "http://localhost:8000/api"; 

/* ===============================
   INTERFACE
================================ */
interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  is_promo?: boolean;
  stock: number;
  jenis_barang: string;
  description: string;
  img_url: string[]; // Menggunakan img_url (tunggal)
}

// 🔥 INTERFACE REVIEW
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
   PRICE HELPER (MENGATASI ERROR: getPriceInfo)
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
   ADD TO CART (MENGATASI ERROR: addToCart)
================================ */
const addToCart = async (product: Product) => {
  const token = document.cookie.match(/token=([^;]+)/)?.[1];
  
  if (!token) {
    alert("Silakan login untuk menambahkan ke keranjang.");
    return;
  } 

  await fetch(`${API_URL}/cart`, {
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
   IMAGE CAROUSEL (MENGATASI ERROR: DetailImageCarousel)
================================ */
const DetailImageCarousel = ({ urls, alt }: { urls: string[]; alt: string }) => {
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
        className="flex h-full transition-transform duration-300"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="w-full h-full shrink-0">
            <img
              src={
                src.startsWith("http")
                  ? src
                  : `${API_URL}/images/${src}` // Menggunakan API_URL
              }
              alt={`${alt} ${i + 1}`}
              className="w-full h-full object-contain"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => setIndex((i) => (i + 1) % images.length)}
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
   MAIN PAGE (SLUG BASED)
================================ */
export default function ProductDetailPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);

  /* ===============================
     FETCH PRODUCT BY SLUG (FIX 404)
  ================================ */
  useEffect(() => {
    if (!slug) return;

    // 🔥 URL FETCH FINAL DENGAN PREFIX BARU 'slug/'
    fetch(`${API_URL}/products/slug/${slug}`)
      .then((res) => {
        if (res.status === 404) return null; 
        if (!res.ok) throw new Error("Gagal memuat data produk.");
        return res.json();
      })
      .then((data) => {
        if (!data || !data.product) {
            setProduct(null);
            return;
        }
        const p = data.product;

        setProduct({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          original_price: p.original_price,
          is_promo: p.is_promo,
          stock: p.stock,
          jenis_barang: p.jenis_barang,
          description: p.description,
          img_url: Array.isArray(p.img_urls) ? p.img_urls : [], // Mapping img_urls -> img_url
        });
      })
      .catch((error) => {
          console.error("Fetch Error:", error);
          setProduct(null); 
        });
  }, [slug]);

  /* ===============================
     FETCH REVIEW
  ================================ */
  useEffect(() => {
    if (!product) return;

    fetch(`${API_URL}/reviews?product_id=${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.average_rating || "0.0");
        setTotalReviews(data.total_reviews || 0);
      });
  }, [product]);

  if (!product) {
    return <div className="text-center py-20">Produk tidak ditemukan</div>;
  }

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

        {/* Tampilan Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow-lg">
            
            {/* Bagian Kiri: Gambar Carousel */}
            <div className="lg:h-[500px] h-[350px]">
                <DetailImageCarousel urls={product.img_url} alt={product.name} />
            </div>

            {/* Bagian Kanan: Detail & Aksi */}
            <div className="space-y-6">
                
                {/* Nama Produk */}
                <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
                
                {/* Rating & Penjualan (Mock data atau dari Review API) */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                        <span className="text-yellow-500 font-bold mr-1">{avgRating} ★</span>
                        <span>({totalReviews} Ulasan)</span>
                    </div>
                    <span>|</span>
                    <span>Terjual: 100+</span>
                </div>

                {/* Harga */}
                <div className="bg-gray-100 p-4 rounded-lg">
                    {hasPromo && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm line-through text-gray-500">
                                Rp {original.toLocaleString('id-ID')}
                            </span>
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                                {discount}% OFF
                            </span>
                        </div>
                    )}
                    <p className="text-4xl font-bold text-[#FF6D1F]">
                        Rp {final.toLocaleString('id-ID')}
                    </p>
                </div>
                
                {/* Stok & Jenis */}
                <div className="space-y-2 text-gray-700">
                    <div className="flex items-center gap-3">
                        <Zap size={20} className="text-green-500" />
                        <span>Stok: <span className="font-semibold">{product.stock}</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Tag size={20} className="text-blue-500" />
                        <span>Kategori: <span className="font-semibold">{product.jenis_barang}</span></span>
                    </div>
                </div>

                {/* Aksi Beli */}
                <div className="flex space-x-4 pt-4">
                    <button
                        onClick={() => addToCart(product)}
                        className="flex items-center justify-center gap-2 bg-[#FF6D1F] hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto"
                        disabled={product.stock === 0}
                    >
                        <ShoppingCart size={20} /> Tambah ke Keranjang
                    </button>
                </div>
                
                {/* Keunggulan Toko */}
                <div className="border-t pt-4 mt-6 text-gray-600 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-green-500"/>
                        Garansi Resmi & Keaslian Produk Terjamin
                    </div>
                    <div className="flex items-center gap-2">
                        <Truck size={18} className="text-indigo-500"/>
                        Siap Kirim ke Seluruh Indonesia
                    </div>
                </div>

            </div>
        </div>

        {/* Deskripsi & Ulasan */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Deskripsi Produk */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
                <h2 className="text-2xl font-bold text-[#234C6A] mb-4 border-b pb-2">Deskripsi Produk</h2>
                <div 
                    className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }}
                />
            </div>

            {/* Ulasan Pelanggan */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-2xl font-bold text-[#234C6A] mb-4 border-b pb-2">Ulasan ({totalReviews})</h2>
                
                {totalReviews === 0 ? (
                    <p className="text-gray-500">Belum ada ulasan untuk produk ini.</p>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {reviews.slice(0, 5).map(review => (
                            <div key={review.id} className="border-b pb-3">
                                <p className="font-bold text-sm">{review.user.name}</p>
                                <div className="text-yellow-500 text-lg">
                                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                </div>
                                {review.comment && (
                                    <p className="text-gray-700 text-sm mt-1">{review.comment}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString('id-ID')}</p>
                            </div>
                        ))}
                        {totalReviews > 5 && (
                            <p className="text-center text-sm text-blue-500 pt-2 cursor-pointer hover:underline">
                                Lihat semua ulasan ({totalReviews})
                            </p>
                        )}
                    </div>
                )}
            </div>

        </div>

      </div>
    </div>
  );
}