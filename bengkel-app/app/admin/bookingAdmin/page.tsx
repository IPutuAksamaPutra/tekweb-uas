"use client";

import { useEffect, useState, useCallback } from "react";
import { alertSuccess, alertError } from "@/components/Alert";
import {
  User,
  Calendar,
  RotateCw,
  Car,
  Bike,
  ClipboardList,
  SearchX,
} from "lucide-react";

interface Booking {
  id: number;
  jenis_kendaraan: string;
  nama_kendaraan: string;
  jenis_service: string;
  booking_date: string;
  status: string | null;
  user?: {
    id: number;
    name: string;
  };
  user_id: number;
}

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMount, setIsMount] = useState(false);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://tekweb-uas-production.up.railway.app";

  // 🔥 AMBIL TOKEN DARI COOKIE (VERCEL DOMAIN)
  const getTokenFromCookie = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : null;
  };

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getTokenFromCookie();

      const res = await fetch(`${apiUrl}/api/bookings/manage`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // 🔥 FIX UTAMA
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server Error: ${res.status}`);
      }

      const data = await res.json();

      const finalArray =
        data.bookings || data.data || (Array.isArray(data) ? data : []);

      setBookings([...finalArray].reverse());
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message);
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    setIsMount(true);
    fetchBookings();
  }, [fetchBookings]);

  async function updateStatus(id: number, newStatus: string) {
    const previous = [...bookings];
    try {
      setBookings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

      const token = getTokenFromCookie();

      const res = await fetch(`${apiUrl}/api/bookings/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // 🔥 FIX UTAMA
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan perubahan ke server");

      alertSuccess(`Status Booking #${id} diperbarui.`);
    } catch (err: any) {
      alertError(err.message || "Gagal update status.");
      setBookings(previous);
    }
  }

  if (!isMount) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-800">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200">
              <ClipboardList size={28} />
            </span>
            Admin Booking Panel
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Kelola antrean servis bengkel
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl font-bold hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
        >
          <RotateCw size={18} className={loading ? "animate-spin" : ""} />
          {loading ? "Memuat..." : "Refresh"}
        </button>
      </header>

      <div className="max-w-7xl mx-auto">
        {loading && bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed">
            <RotateCw size={48} className="animate-spin text-amber-500 mb-4" />
            <p className="font-bold text-slate-400">
              Menyinkronkan data antrean...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl text-red-700">
            <p className="font-bold">Gagal Memuat Data:</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-3 text-xs underline font-bold"
            >
              Coba Lagi
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-20 rounded-4xl text-center border-2 border-dashed">
            <SearchX size={64} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">
              Belum ada booking hari ini.
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* UI TETAP */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
