"use client";

import { useEffect, useState } from "react";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

// --- Ambil token dari cookies ---
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

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

// Helper styling status
const getStatusClasses = (status: string | null) => {
  const currentStatus = (status || "Pending").toLowerCase();
  switch (currentStatus) {
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "confirmed":
      return "bg-green-100 text-green-700 border-green-300";
    case "canceled":
      return "bg-red-100 text-red-700 border-red-300";
    case "completed":
      return "bg-blue-100 text-blue-700 border-blue-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

// Helper ikon kendaraan
const getVehicleIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("mobil"))
    return <span className="text-2xl text-amber-600 drop-shadow-sm">🚗</span>;
  if (lowerType.includes("motor"))
    return <span className="text-2xl text-amber-600 drop-shadow-sm">🏍️</span>;
  return <span className="text-2xl text-amber-600 drop-shadow-sm">🔧</span>;
};

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch Data Booking ---
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = getCookie("token");

        const res = await fetch("http://localhost:8000/api/bookings", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const array = data.bookings || data.data || [];

        const cleaned = array.map((b: Booking) => ({
          ...b,
          status:
            b.status && typeof b.status === "string" ? b.status : "Pending",
        }));

        setBookings(cleaned);
      } catch (err: any) {
        alertError(err.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // --- Update Status Booking ---
  async function updateStatus(id: number, newStatus: string) {
    const allowed = ["Pending", "Confirmed"];

    if (!allowed.includes(newStatus)) {
      alertError("Status tidak valid! Hanya boleh Pending atau Confirmed.");
      return;
    }

    try {
      const previous = bookings;

      // Optimistic UI
      setBookings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

      const token = getCookie("token");

      const res = await fetch(`http://localhost:8000/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: newStatus,
        }),
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Laravel error:", data);
        alertError(`Gagal update status! HTTP ${res.status}`);
        setBookings(previous);
      }
    } catch (err) {
      alertError("Terjadi kesalahan saat update status.");
    }
  }

  // -- BOOKING CARD COMPONENT --
  const BookingCard = ({ b }: { b: Booking }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200 p-6 relative overflow-hidden">

      {/* Highlight strip */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-400 to-amber-600"></div>

      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
          {getVehicleIcon(b.jenis_kendaraan)}
          <span className="drop-shadow-sm">{b.nama_kendaraan}</span>
        </h3>

        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${getStatusClasses(
            b.status
          )}`}
        >
          {b.status}
        </span>
      </div>

      <div className="space-y-4 text-gray-600">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <span className="text-lg text-amber-500">👤</span>
          <p>
            <span className="font-semibold text-gray-700">User:</span>{" "}
            {b.user?.name || `User ID: ${b.user_id}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg text-amber-500">📅</span>
          <p>
            <span className="font-semibold text-gray-700">Tanggal:</span>{" "}
            {b.booking_date}
          </p>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 shadow-sm">
          <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
            🛠️
            <span className="text-gray-700 font-bold">{b.jenis_service}</span>{" "}
            <span className="text-gray-500">({b.jenis_kendaraan})</span>
          </p>
        </div>
      </div>

      <div className="mt-6 pt-3 border-t flex items-center justify-between">
        <p className="text-xs font-medium text-gray-400">#{b.id}</p>

        <select
          value={b.status || "Pending"}
          onChange={(e) => updateStatus(b.id, e.target.value)}
          className="border border-gray-300 p-2 text-sm rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
        >
          <option value="Pending">🟡 Pending</option>
          <option value="Confirmed">🟢 Konfirmasi</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 lg:p-10">
      <header className="mb-10 p-6 bg-white shadow-lg rounded-xl border-l-4 border-amber-500">
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          ⚙️ Admin Booking Panel
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Kelola dan konfirmasi seluruh booking service.
        </p>
      </header>

      {loading && (
        <div className="flex justify-center items-center h-48 bg-white rounded-lg shadow-md border">
          <span className="text-4xl text-amber-500 animate-spin">🔄</span>
          <p className="ml-4 text-gray-600 text-lg">Memuat data booking...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 flex gap-3 p-4 rounded-lg shadow-md">
          <span className="text-2xl">⚠️</span>
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6">
          {bookings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bookings.map((b) => (
                <BookingCard key={b.id} b={b} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-16 rounded-lg shadow-inner text-center border-2 border-dashed border-gray-300">
              <span className="text-6xl text-gray-400">✨</span>
              <p className="text-xl mt-4 font-semibold text-gray-700">
                Belum ada booking baru
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
