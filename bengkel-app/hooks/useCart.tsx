import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/api/route";

export function useCart() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(() => apiFetch("/cart").then((r:any)=>setItems(r)).finally(()=>setLoading(false)), []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = (product_id:number, qty=1) => apiFetch("/cart", { method: "POST", body: { product_id, qty } }).then(fetchCart);
  const removeItem = (id:number) => apiFetch(`/cart/${id}`, { method: "DELETE" }).then(fetchCart);
  const updateItem = (id:number, qty:number) => apiFetch(`/cart/${id}`, { method: "PATCH", body: { qty } }).then(fetchCart);
  const checkout = (payload?:any) => apiFetch("/checkout", { method: "POST", body: payload }).then(fetchCart);

  return { items, loading, fetchCart, addToCart, removeItem, updateItem, checkout };
}
