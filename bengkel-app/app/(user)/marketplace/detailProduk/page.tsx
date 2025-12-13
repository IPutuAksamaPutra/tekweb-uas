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
    Clock,
    Zap,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

// ===============================
// Interface Produk
// ===============================
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

// ===============================
// RETURN DATA HARGA
// ===============================
function getPriceInfo(product: Product) {
    const hasPromo = product.is_promo && product.original_price && product.original_price > product.price;

    return {
        hasPromo,
        original: product.original_price ?? product.price,
        final: product.price,
        discount: hasPromo
            ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
            : 0
    };
}

// ===============================
// ADD TO CART LOCAL
// ===============================
const addToCart = (product: Product) => {
    const saved = localStorage.getItem("cart");
    const cartItems: any[] = saved ? JSON.parse(saved) : [];

    const exist = cartItems.findIndex((p) => p.id === product.id);

    if (exist > -1) cartItems[exist].qty += 1;
    else cartItems.push({ ...product, qty: 1, isSelected: true });

    localStorage.setItem("cart", JSON.stringify(cartItems));

    const msg = document.getElementById("message-box");
    if (msg) {
        msg.innerHTML = `
          <div class='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow'>
            <b>✔ Ditambahkan ke Keranjang</b>
          </div>
        `;
        msg.style.display = "block";
        setTimeout(() => (msg.style.display = "none"), 2000);
    }
};

// ===============================
// KOMPONEN CAROUSEL
// ===============================
interface DetailImageCarouselProps {
    urls: string[];
    alt: string;
}

const DetailImageCarousel = ({ urls, alt }: DetailImageCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const validUrls = urls.filter(url => url && typeof url === 'string');
    const totalImages = validUrls.length;
    
    if (totalImages === 0) {
        return (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-lg text-gray-500 rounded-xl">
                Gambar Tidak Tersedia
            </div>
        );
    }

    const nextImage = () => {
        setActiveIndex((current) => (current + 1) % totalImages);
    };

    const prevImage = () => {
        setActiveIndex((current) => (current - 1 + totalImages) % totalImages);
    };

    if (totalImages === 1) {
        return (
            <img 
                src={validUrls[0]} 
                alt={alt} 
                className="max-h-[450px] object-contain w-full h-full rounded-xl" 
            />
        );
    }

    return (
        <div className="relative max-h-[450px] w-full h-full">
            <div className="flex overflow-hidden w-full h-full rounded-xl">
                <div
                    className="flex transition-transform duration-300 ease-in-out h-full"
                    style={{ 
                        width: `${totalImages * 100}%`,
                        transform: `translateX(-${activeIndex * (100 / totalImages)}%)`, 
                    }}
                >
                    {validUrls.map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt={`${alt} ${i + 1}`}
                            className="max-h-[450px] object-contain shrink-0"
                            style={{ width: `${100 / totalImages}%` }} 
                        />
                    ))}
                </div>
            </div>

            {/* Tombol Kontrol */}
            <button
                onClick={prevImage}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 p-2 bg-black bg-opacity-40 text-white rounded-full hover:bg-opacity-70 transition-colors z-10"
                aria-label="Previous image"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextImage}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 bg-black bg-opacity-40 text-white rounded-full hover:bg-opacity-70 transition-colors z-10"
                aria-label="Next image"
            >
                <ChevronRight size={24} />
            </button>
            
            {/* Indikator Titik */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {validUrls.map((_, i) => (
                    <span 
                        key={i} 
                        className={`w-3 h-3 rounded-full transition-colors ${i === activeIndex ? 'bg-[#FF6D1F]' : 'bg-white bg-opacity-50'}`}
                    ></span>
                ))}
            </div>
        </div>
    );
};

// ===============================
// FEATURE COMPONENT
// ===============================
const FeatureHighlight = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <Icon size={24} className="text-[#234C6A]" />
        <div>
            <p className="font-semibold text-sm text-[#234C6A]">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
    </div>
);

// ===============================
// REVIEW COMPONENT
// ===============================
const ReviewCard = ({ name, rating, comment }: { name: string; rating: number; comment: string }) => (
    <div className="p-4 bg-white border rounded-xl shadow">
        <div className="flex items-center justify-between">
            <b className="text-gray-800">{name}</b>
            <div className="flex text-yellow-500">
                {[...Array(rating)].map((_, i) => <Star key={i} size={18} fill="gold" stroke="gold" />)}
                {[...Array(5-rating)].map((_, i) => <Star key={i} size={18} stroke="gold" />)}
            </div>
        </div>
        <p className="text-gray-600 text-sm italic mt-1">"{comment}"</p>
    </div>
);


// ====================================================================================
// =============================== MAIN PAGE =========================================
// ====================================================================================
export default function ProductDetailPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const reviews = [
        { name: "Rizky", rating: 5, comment: "Barang mantap, sesuai deskripsi!" },
        { name: "Siti", rating: 4, comment: "Harga oke, kualitas bagus." },
        { name: "Bambang", rating: 5, comment: "Pengiriman cepat!" },
    ];

    useEffect(() => {
        const data = localStorage.getItem("selectedProduct"); 
        if (data) {
            const parsedProduct = JSON.parse(data);
            let imgUrls = parsedProduct.img_url;

            // Logika Parsing yang sangat robust untuk memastikan imgUrls adalah Array of Strings
            if (typeof imgUrls === 'string') {
                if (imgUrls.startsWith('[')) {
                    try {
                        const parsedArray = JSON.parse(imgUrls);
                        if (Array.isArray(parsedArray)) {
                            imgUrls = parsedArray.filter(url => url && typeof url === 'string');
                        } else {
                            imgUrls = [imgUrls];
                        }
                    } catch (e) {
                        imgUrls = [imgUrls];
                    }
                } else {
                    imgUrls = [imgUrls];
                }
            } else if (!Array.isArray(imgUrls)) {
                 imgUrls = [];
            } else {
                 imgUrls = imgUrls.filter(url => url && typeof url === 'string');
            }

            parsedProduct.img_url = imgUrls;
            
            // Log data untuk membantu debugging
            console.log("Final URLs loaded:", parsedProduct.img_url);

            if (!parsedProduct.description) {
                parsedProduct.description = '';
            }

            setProduct(parsedProduct);
        }
        setLoading(false);
    }, []);

    if (loading) return <div className="text-center py-20 font-bold text-[#234C6A]">Memuat...</div>;
    if (!product) return <div className="text-center py-20 text-gray-500">Produk tidak ditemukan</div>;

    const { hasPromo, original, final, discount } = getPriceInfo(product);

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
            <div id="message-box" className="hidden fixed top-6 right-6 z-50" />

            <div className="max-w-6xl mx-auto">
                {/* ================= BACK BUTTON ================= */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#234C6A] font-bold hover:text-[#FF6D1F] transition mb-8"
                >
                    <ArrowLeft size={22} /> Kembali
                </button>

                {/* ================= PRODUCT AREA ================= */}
                <div className="grid md:grid-cols-12 gap-10 bg-white p-8 rounded-3xl shadow border">
                    <div className="md:col-span-5 flex justify-center bg-gray-100 rounded-xl p-6">
                        <DetailImageCarousel urls={product.img_url} alt={product.name} />
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="md:col-span-7 space-y-5">
                        <p className="text-sm font-semibold text-[#FF6D1F] flex gap-1">
                            <Tag size={16}/> {product.jenis_barang}
                        </p>

                        <h1 className="text-4xl font-extrabold text-[#234C6A]">{product.name}</h1>

                        {/* HARGA */}
                        <div className="space-y-1">
                            {hasPromo && <p className="text-xl text-gray-400 line-through">Rp {original.toLocaleString("id-ID")}</p>}
                            <p className="text-5xl font-black text-[#FF6D1F]">Rp {final.toLocaleString("id-ID")}</p>
                            {hasPromo && <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-sm">HEMAT {discount}%</span>}
                        </div>

                        {/* BUTTON */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => addToCart(product)}
                                className="flex-1 bg-[#234C6A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1b3a52]"
                            >
                                <ShoppingCart size={22}/> Masukkan Keranjang
                            </button>

                            <button
                                onClick={() => router.push("/checkout")}
                                className="flex-1 border-2 border-[#FF6D1F] text-[#FF6D1F] py-4 rounded-xl font-bold hover:bg-[#FF6D1F] hover:text-white"
                            >
                                Beli Sekarang
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 flex gap-1"><Info size={14}/> Barang dikirim dalam 1x24 jam.</p>
                    </div>
                </div>

                {/* ================= FITUR ================= */}
                <div className="mt-10 bg-white p-6 rounded-2xl shadow">
                    <h2 className="font-bold text-xl mb-3 text-[#234C6A]">Jaminan Produk</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FeatureHighlight icon={ShieldCheck} title="Garansi Resmi" desc="100% ori bergaransi" />
                        <FeatureHighlight icon={Truck} title="Gratis Ongkir" desc="Min belanja 100rb" />
                        <FeatureHighlight icon={Zap} title="Ready Stock" desc="Pengiriman cepat" />
                    </div>
                </div>

                {/* ================= DESKRIPSI ================= */}
                <div className="mt-10 bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-xl font-bold border-b pb-2 mb-3 text-[#234C6A]">Deskripsi Produk</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </div>

                {/* ================= REVIEW ================= */}
                <div className="mt-10 bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-xl font-bold flex gap-2 border-b pb-2 mb-5 text-[#234C6A]">
                        <MessageSquare size={22}/> Ulasan Pembeli
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {reviews.map((r,i)=> <ReviewCard key={i} {...r}/>)}
                    </div>
                </div>
            </div>
        </div>
    );
}