"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  jenis_barang: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export default function KasirProduk() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8000/api";

  // Ambil data produk dari API
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data.products || []);
      if (data.products?.length) setSelected(data.products[0].id);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addItem = () => {
    const product = products.find(p => p.id === selected);
    if (!product) return;

    const exist = cart.find(c => c.id === selected);

    if (exist) {
      setCart(cart.map(c => c.id === selected ? { ...c, qty: c.qty + qty } : c));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, qty }]);
    }
  };

  const remove = (id: number) => setCart(cart.filter(c => c.id !== id));

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Versi final: hanya simpan cart ke localStorage dan redirect
  const handleCheckout = () => {
    if (cart.length === 0) return alert("Keranjang kosong!");

    // Simpan cart ke localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Redirect ke halaman pembayaran
    router.push(`/admin/kasir/pembayaran?type=produk&total=${total}`);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#234C6A]">🛍 Kasir - Produk</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <div className="flex gap-3">
          <select 
            className="border p-2 rounded-lg"
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} - Rp {p.price.toLocaleString()}</option>
            ))}
          </select>

          <input 
            type="number"
            value={qty}
            min={1}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-20 border p-2 rounded-lg"
          />

          <button 
            onClick={addItem}
            className="bg-[#FF6D1F] text-white px-4 flex items-center gap-2 rounded-lg hover:bg-orange-600"
          >
            <PlusCircle size={18}/>Tambah
          </button>
        </div>

        <table className="w-full text-left mt-4">
          <thead>
            <tr className="border-b">
              <th className="py-2">Produk</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map(c => (
              <tr key={c.id} className="border-b">
                <td>{c.name}</td>
                <td>{c.qty}</td>
                <td>Rp {(c.qty * c.price).toLocaleString()}</td>
                <td>
                  <button onClick={() => remove(c.id)} className="text-red-600">
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between text-xl font-bold mt-3">
          <span>Total:</span>
          <span className="text-[#FF6D1F]">Rp {total.toLocaleString()}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="w-full mt-4 bg-[#234C6A] text-white py-3 rounded-lg hover:bg-[#1A374A] disabled:bg-gray-400"
        >
          Proses Pembayaran
        </button>

      </div>
    </div>
  );
}
