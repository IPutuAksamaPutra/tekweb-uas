"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  Wrench,
  Shirt,
  PlusCircle,
  AlertTriangle,
  Package,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  jenis_barang: string;
  img_url: string;
  description?: string;
  isPromo?: boolean;
  discountPercent?: number;
  promoTag?: string;
  promoSubtitle?: string;
  promoImageUrl?: string;
}

// ===============================
// DISCOUNT HELPER
// ===============================
function getPriceInfo(product: { price: number; isPromo?: boolean; discountPercent?: number }) {
  const hasDiscount = product.isPromo && !!product.discountPercent && product.discountPercent > 0;

  const originalPrice = product.price;
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - (product.discountPercent as number) / 100))
    : product.price;

  return { hasDiscount, originalPrice, finalPrice };
}

// ===============================
// FIX — ADD TO CART SESUAI CART PAGE + CHECKOUT
// ===============================
const addToCart = (product: Product, updateCount: () => void) => {
  const saved = localStorage.getItem("cart");
  const cartItems = saved ? JSON.parse(saved) : [];

  const exist = cartItems.findIndex((i: any) => i.product_id === product.id);

  if (exist >= 0) cartItems[exist].quantity += 1;
  else {
    cartItems.push({
      product_id: product.id,
      quantity: 1,
      product: {
        name: product.name,
        price: product.price,
        image_url: product.img_url,
      },
      isSelected: true,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cartItems));
  updateCount();

  const box = document.getElementById("message-box");
  if (box) {
    box.innerHTML = `
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <strong class="font-bold">Sukses!</strong>
        <span> ${product.name} ditambahkan ke keranjang.</span>
      </div>`;
    box.style.display = "block";
    setTimeout(() => (box.style.display = "none"), 2000);
  }
};

// ===============================
// CARD COMPONENT
// ===============================
const ProductCardComponent = ({ product, addToCart, getCategoryIcon, updateCartCount, onProductClick }: any) => {
  const handleAdd = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, updateCartCount);
  };

  const handleCardClick = (e: any) => {
    const target = e.target as Element;
    if (target.closest("button")) return;
    onProductClick(product);
  };

  const { hasDiscount, originalPrice, finalPrice } = getPriceInfo(product);

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-[#FF6D1F] transition cursor-pointer"
    >
      <div className="relative">
        <img
          src={product.img_url}
          className="w-full h-44 object-cover group-hover:scale-[1.03] transition"
          onError={(e) => { e.currentTarget.src="https://placehold.co/200x200"; }}
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-[#FF6D1F] text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discountPercent}%
          </span>
        )}
      </div>

      <div className="p-4">
        <h2 className="font-bold text-lg text-[#234C6A] line-clamp-2">{product.name}</h2>
        <p className="text-xs text-gray-500 mt-1">{getCategoryIcon(product.jenis_barang)}{product.jenis_barang}</p>

        <div className="flex justify-between items-end mt-3">
          <div>
            {hasDiscount && <p className="text-xs line-through text-gray-500">Rp {originalPrice.toLocaleString("id-ID")}</p>}
            <p className="text-[#FF6D1F] font-extrabold text-xl">Rp {finalPrice.toLocaleString("id-ID")}</p>
          </div>

          <button onClick={handleAdd} className="bg-[#234C6A] text-white p-2 rounded-full hover:bg-[#1A374A] transition">
            <PlusCircle size={22}/>
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================
// MAIN PAGE
// ===============================
export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [hasLatestOrder, setHasLatestOrder] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/products");
      const data = await res.json();
      setProducts(
        data.products.map((p: any) => ({
          ...p,
          isPromo: p.discountPercent && p.discountPercent > 0,
          promoImageUrl: p.img_url
        }))
      );
    } catch { alert("API gagal terhubung"); }
  };

  const updateCartCount = () => {
    const saved = localStorage.getItem("cart");
    if (saved) setCartCount(JSON.parse(saved).length);
  };

  useEffect(() => {
    fetchProducts();
    updateCartCount();
    if (localStorage.getItem("latestOrder")) setHasLatestOrder(true);
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "all" || p.jenis_barang === filter)
  );

  const getCategoryIcon = (jenis: string) =>
    jenis === "Sparepart" ? <Wrench size={16} className="inline text-gray-500 mr-1"/> :
    jenis === "Aksesoris" ? <Shirt size={16} className="inline text-gray-500 mr-1"/> : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div id="message-box" className="fixed top-4 right-4 z-50 hidden"></div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between border-b pb-4">
          <h1 className="text-4xl font-extrabold text-[#234C6A]">Marketplace Produk 🛒</h1>

          <div className="flex gap-4">
            {hasLatestOrder && (
              <a href="/marketplace/pesanan" className="bg-[#234C6A] text-white px-3 py-2 rounded-full hover:bg-[#FF6D1F] flex items-center gap-2">
                <Package size={20}/> Pesanan Saya
              </a>
            )}

            <a href="/cart" className="relative">
              <ShoppingCart size={32} color="#FF6D1F"/>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 bg-white p-4 rounded-xl shadow">
          <div className="flex items-center border rounded-full px-4 w-full">
            <Search size={20} className="text-[#234C6A] mr-2"/>
            <input placeholder="Cari produk..." className="w-full outline-none"
              value={search} onChange={(e)=>setSearch(e.target.value)}/>
          </div>

          <select value={filter} onChange={(e)=>setFilter(e.target.value)}
            className="border p-2 rounded-full">
            <option value="all">Semua</option>
            <option value="Sparepart">Sparepart</option>
            <option value="Aksesoris">Aksesoris</option>
          </select>
        </div>

        {/* Produk */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-600 bg-white p-6 rounded-xl shadow">
              <AlertTriangle size={20} className="inline mr-1 text-red-500"/> Produk tidak ditemukan.
            </p>
          )}

          {filtered.map((p) => (
            <ProductCardComponent
              key={p.id} product={p} addToCart={addToCart}
              getCategoryIcon={getCategoryIcon} updateCartCount={updateCartCount}
              onProductClick={(x:any)=>{ localStorage.setItem("selectedProduct",JSON.stringify(x)); window.location.href="/marketplace/detailProduk"; }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
