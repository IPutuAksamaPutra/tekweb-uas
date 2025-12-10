"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/user/ProductCard";
import { addToCart } from "@/lib/cart";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id:number;
  name:string;
  price:number;
  stock:number;
  jenis_barang:string;
  img_url:string;
}

interface Promotion {
  id: number;
  name: string;
  discount_type: "percentage"|"fixed";
  discount_value: number;
  products: Product[];
}

export default function MarketplacePage(){

  const [products,setProducts]=useState<Product[]>([]);
  const [filtered,setFiltered]=useState<Product[]>([]);
  const [promotions,setPromotions]=useState<Promotion[]>([]);
  const [cartCount,setCartCount]=useState(0);

  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("all");

  // =================== PROMO SLIDER ====================
  const promoImages = ["/promo/promo1.jpg","/promo/promo2.jpg","/promo/promo3.jpg"];
  const [slide,setSlide] = useState(0);

  const nextSlide = ()=> setSlide((p)=>(p+1)%promoImages.length);
  const prevSlide = ()=> setSlide((p)=>(p-1+promoImages.length)%promoImages.length);
  useEffect(()=>{ const auto=setInterval(nextSlide,3000); return()=>clearInterval(auto); },[]);


  // =================== FETCH PRODUK ====================
  const fetchProducts=async()=>{
    const res=await fetch("http://localhost:8000/api/products");
    const data=await res.json();
    setProducts(data.products);
    setFiltered(data.products);
  };

  // =================== FETCH PROMO (PUBLIC) ====================
 const fetchPromotions = async () => {
    const res = await fetch("http://localhost:8000/api/promotions"); // <-- penting
    const data = await res.json();
    console.log("PROMO PUBLIC => ", data);
    setPromotions(data.promotions ?? []); 
};

  // =================== CART COUNT ====================
  const updateCartCount=async()=>{
    const token=document?.cookie.match(/token=([^;]+)/)?.[1];
    if(!token) return;
    const res=await fetch("http://localhost:8000/api/cart",{headers:{Authorization:`Bearer ${token}`}});
    const data=await res.json();
    setCartCount(data.cart_items?.length||0);
  };

  useEffect(()=>{ fetchProducts(); fetchPromotions(); updateCartCount(); },[]);

  // =================== FILTER ====================
  useEffect(()=>{
    let result=[...products];

    if(category!=="all") result=result.filter(p=>p.jenis_barang.toLowerCase()===category.toLowerCase());
    if(search.trim()!=="") result=result.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));

    setFiltered(result);
  },[search,category,products]);


  const handleAddToCart=async(id:number)=>{
    const ok=await addToCart(id);
    if(ok){ updateCartCount(); alert("Produk ditambahkan ke keranjang!"); }
  };


  return(
    <div className="max-w-6xl mx-auto p-6">

{/* ================= HEADER ================= */}
<div className="flex justify-between mb-6 items-center">
  <h1 className="text-3xl font-bold text-[#234C6A]">Marketplace Produk</h1>

  <div className="flex items-center gap-4">
    <a href="/marketplace/pesanan" className="px-4 py-2 bg-[#234C6A] text-white rounded-lg hover:bg-[#17374f] transition font-semibold shadow">Pesanan</a>

    <a href="/cart" className="relative">
      <ShoppingCart size={32} className="text-[#FF6D1F] hover:scale-110 transition"/>
      {cartCount>0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2">
          {cartCount}
        </span>
      )}
    </a>
  </div>
</div>


{/* ================= PROMO SLIDER ================= */}
<div className="relative w-full h-40 sm:h-56 rounded-xl overflow-hidden mb-6 shadow-lg">
  <img src={promoImages[slide]} className="w-full h-full object-cover transition-all duration-700"/>
  <button onClick={prevSlide} className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 p-2 rounded-full"><ChevronLeft size={22}/></button>
  <button onClick={nextSlide} className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 p-2 rounded-full"><ChevronRight size={22}/></button>

  <div className="absolute bottom-3 w-full flex justify-center gap-2">
    {promoImages.map((_,i)=>(
      <span key={i} className={`w-3 h-3 rounded-full ${i===slide?"bg-[#FF6D1F]":"bg-white/60"}`}/>
    ))}
  </div>
</div>



{/* ==================== PROMO SECTION ==================== */}
{promotions.length>0 && (
  <div className="mb-10">
    <h2 className="text-2xl font-bold text-[#234C6A] mb-4">🔥 Promo Tersedia</h2>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {promotions.map(promo=> promo.products.map(product=>(

         <ProductCard
           key={`promo-${product.id}`}
           product={{
             ...product,
             price: promo.discount_type==="percentage"
                 ? product.price-(product.price*(promo.discount_value/100))
                 : product.price-promo.discount_value
           }}
           onAdd={handleAddToCart}
           onClick={()=>{
             localStorage.setItem("selectedProduct",JSON.stringify(product));
             window.location.href="/marketplace/detailProduk";
           }}
         />

      )))}
    </div>
  </div>
)}



{/* ================= PRODUCT GRID NORMAL ================= */}
<h2 className="text-xl font-bold text-[#234C6A] mb-3">Semua Produk</h2>

<div className="flex flex-col sm:flex-row gap-3 mb-6">
  <input placeholder="Cari produk..." value={search} onChange={(e)=>setSearch(e.target.value)}
    className="w-full border p-3 rounded-xl outline-none text-gray-700 focus:ring-2 focus:ring-[#FF6D1F]"/>
  <select value={category} onChange={(e)=>setCategory(e.target.value)}
    className="w-full sm:w-48 border p-3 rounded-xl text-gray-700">
    <option value="all">Semua Produk</option>
    <option value="sparepart">Sparepart</option>
    <option value="aksesoris">Aksesoris</option>
  </select>
</div>

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {filtered.length>0 ? filtered.map(p=>(

    <ProductCard
      key={p.id}
      product={p}
      onAdd={handleAddToCart}
      onClick={()=>{localStorage.setItem("selectedProduct",JSON.stringify(p)); window.location.href="/marketplace/detailProduk";}}
    />

  )): <p className="text-gray-500 col-span-full text-center">Produk tidak ditemukan...</p>}
</div>

</div>
  );
}
