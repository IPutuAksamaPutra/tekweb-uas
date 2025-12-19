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
  SearchX
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

  // URL API (env / fallback)
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://tekweb-uas-production.up.railway.app";

  // Ambil token
  const getAuthToken = useCallback(() => {
    if (typeof document === "undefined") return null;
    const cookieToken = document.cookie.match(/token=([^;]+)/)?.[1];
    if (cookieToken) return cookieToken;
    return localStorage.getItem("token");
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      // 🔥 FIX FINAL (PAKSA /api)
      const res = await fetch(`${apiUrl}/api/bookings/manage`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Data Booking diterima:", data);

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
  }, [apiUrl, getAuthToken]);

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

      const token = getAuthToken();

      // 🔥 FIX FINAL (PAKSA /api)
      const res = await fetch(`${apiUrl}/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
                <div
                  className={`h-2 w-full ${
                    b.status?.toLowerCase() === "confirmed"
                      ? "bg-green-500"
                      : "bg-amber-500"
                  }`}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      {b.jenis_kendaraan
                        .toLowerCase()
                        .includes("mobil") ? (
                        <Car size={20} className="text-blue-500" />
                      ) : (
                        <Bike size={20} className="text-orange-500" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                        b.status?.toLowerCase() === "confirmed"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}
                    >
                      {b.status || "Pending"}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-800 mb-4 truncate">
                    {b.nama_kendaraan}
                  </h3>

                  <div className="space-y-3 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-slate-400" />
                      {b.user?.name || `User ID: ${b.user_id}`}
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-slate-400" />
                      {b.booking_date}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">
                        Jenis Servis
                      </p>
                      <p className="font-black text-[#234C6A]">
                        {b.jenis_service}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
                      Aksi Petugas
                    </p>
                    <select
                      value={b.status || "Pending"}
                      onChange={(e) =>
                        updateStatus(b.id, e.target.value)
                      }
                      className="w-full bg-slate-100 border-none p-3 rounded-xl font-bold text-sm cursor-pointer focus:ring-2 focus:ring-amber-500 transition-all"
                    >
                      <option value="Pending">🕒 Pending</option>
                      <option value="Confirmed">✅ Konfirmasi</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
