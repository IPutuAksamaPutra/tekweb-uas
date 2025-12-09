"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/user/ProductCard";
import { addToCart } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";

interface Product {
  id:number;
  name:string;
  price:number;
  stock:number;
  jenis_barang:string;
  img_url:string;
}

export default function MarketplacePage(){

  const [products,setProducts]=useState<Product[]>([]);
  const [cartCount,setCartCount]=useState(0);

  const fetchProducts=async()=>{
    const res=await fetch("http://localhost:8000/api/products");
    const data=await res.json();
    setProducts(data.products);
  };

  const updateCartCount=async()=>{
    const token=document?.cookie.match(/token=([^;]+)/)?.[1];
    if(!token) return;
    const res=await fetch("http://localhost:8000/api/cart",{headers:{Authorization:`Bearer ${token}`}});
    const data=await res.json();
    setCartCount(data.cart_items?.length||0);
  };

  useEffect(()=>{ fetchProducts(); updateCartCount(); },[]);

  const handleAddToCart=async(id:number)=>{
    const ok=await addToCart(id);
    if(ok){
      updateCartCount();
      alert("Produk ditambahkan ke keranjang!");
    }
  };

  return(
    <div className="max-w-6xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-3xl font-bold text-[#234C6A]">Marketplace Produk</h1>

        <a href="/cart" className="relative">
          <ShoppingCart size={32} className="text-[#FF6D1F]"/>
          {cartCount>0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2">
              {cartCount}
            </span>
          )}
        </a>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p=>(
          <ProductCard 
            key={p.id}
            product={p}
            onAdd={handleAddToCart}
            onClick={()=>{
              localStorage.setItem("selectedProduct",JSON.stringify(p));
              window.location.href="/marketplace/detailProduk";
            }}
          />
        ))}
      </div>
    </div>
  );
}
