import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/api/route";

export function useBooking() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(() => apiFetch("/booking").then((r:any)=>setBookings(r)).finally(()=>setLoading(false)), []);

  useEffect(()=>{ fetchBookings(); }, [fetchBookings]);

  const createBooking = (payload:any) => apiFetch("/booking", { method: "POST", body: payload }).then(fetchBookings);
  const cancelBooking = (id:number) => apiFetch(`/booking/${id}`, { method: "PATCH", body: { status: "cancelled" } }).then(fetchBookings);

  return { bookings, loading, fetchBookings, createBooking, cancelBooking };
}
