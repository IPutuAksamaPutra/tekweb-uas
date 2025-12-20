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
  jenis_kendaraan: string | null;
  nama_kendaraan: string;
  jenis_service: string;
  booking_date: string;
  status: string | null;
  // Relasi User dari Laravel
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://tekweb-uas-production.up.railway.app";

  // ================= TOKEN HELPER =================
  const getTokenFromCookie = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : null;
  };

  // ================= FETCH BOOKINGS =================
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getTokenFromCookie();
      if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");

      const res = await fetch(`${apiUrl}/api/bookings/manage`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error: ${res.status}`);
      }

      const data = await res.json();
      // Laravel biasanya mengirim di properti 'bookings' atau 'data'
      const finalArray = data.bookings || data.data || (Array.isArray(data) ? data : []);

      setBookings([...finalArray].reverse());
    } catch (err: any) {
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

  // ================= UPDATE STATUS =================
  async function updateStatus(id: number, newStatus: string) {
    const previous = [...bookings];
    try {
      setBookings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );

      const token = getTokenFromCookie();
      const res = await fetch(`${apiUrl}/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal update ke server");
      alertSuccess(`Booking #${id} dikonfirmasi!`);
    } catch (err: any) {
      alertError(err.message);
      setBookings(previous);
    }
  }

  if (!isMount) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-800">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#234C6A] flex items-center gap-3">
            <span className="p-2 bg-[#FF6D1F] text-white rounded-xl shadow-lg">
              <ClipboardList size={28} />
            </span>
            Antrean Servis
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Monitoring pendaftaran pelanggan secara real-time</p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-2 bg-white border px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RotateCw size={18} className={loading ? "animate-spin" : ""} />
          {loading ? "Sinkron..." : "Refresh Data"}
        </button>
      </header>

      <div className="max-w-7xl mx-auto">
        {loading && bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6D1F] border-t-transparent mb-4" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Memuat Database...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
            <SearchX size={64} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-black text-slate-300 uppercase italic">Belum Ada Antrean Masuk</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-4xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group hover:border-[#FF6D1F] transition-all">
                <div className={`h-2.5 w-full ${b.status?.toLowerCase() === "confirmed" ? "bg-green-500" : "bg-amber-500"}`} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-slate-50 rounded-2xl group-hover:bg-orange-50 transition-colors">
                      {(b.jenis_kendaraan || "").toLowerCase().includes("mobil") ? (
                        <Car size={22} className="text-blue-500" />
                      ) : (
                        <Bike size={22} className="text-[#FF6D1F]" />
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${
                        b.status?.toLowerCase() === "confirmed" ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}>
                      {b.status || "Pending"}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#234C6A] mb-4 truncate italic uppercase">
                    {b.nama_kendaraan}
                  </h3>

                  <div className="space-y-4">
                    {/* 🔥 NAMA PELANGGAN (DIPERBAIKI) */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                        <User size={14} />
                      </div>
                      <p className="font-black text-slate-700 text-sm">
                        {b.user?.name || "Pelanggan Umum"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                        <Calendar size={14} />
                      </div>
                      <p className="font-bold text-slate-500 text-xs">
                        {new Date(b.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                      <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Layanan Servis</p>
                      <p className="font-black text-[#234C6A] text-sm uppercase">{b.jenis_service}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-dashed border-slate-200">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest italic">Update Status</label>
                    <select
                      value={b.status || "Pending"}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className="w-full bg-[#234C6A] text-white border-none p-3 rounded-xl font-black text-xs cursor-pointer focus:ring-4 focus:ring-orange-200 transition-all appearance-none"
                    >
                      <option value="Pending">🕒 MASIH PENDING</option>
                      <option value="Confirmed">✅ KONFIRMASI (OKE)</option>
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