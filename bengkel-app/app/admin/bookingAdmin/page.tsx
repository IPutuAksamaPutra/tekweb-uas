"use client";

import { useEffect, useState } from "react";

interface Booking {
  id: number;
  jenis_kendaraan: string;
  nama_kendaraan: string;
  jenis_service: string;
  booking_date: string;
  status: string;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
  user_id: number;
}

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8000/api/bookings", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        // Pastikan data.bookings ada
        setBookings(data.bookings || []);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Daftar Booking</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <table className="w-full border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Nama User</th>
              <th className="border px-4 py-2">Jenis Kendaraan</th>
              <th className="border px-4 py-2">Nama Kendaraan</th>
              <th className="border px-4 py-2">Jenis Service</th>
              <th className="border px-4 py-2">Tanggal Booking</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((b) => (
                <tr key={b.id}>
                  {/* Tampilkan nama user dari relasi, fallback ke user_id jika null */}
                  <td className="border px-4 py-2">{b.user?.name || `User ID: ${b.user_id}`}</td>
                  <td className="border px-4 py-2">{b.jenis_kendaraan}</td>
                  <td className="border px-4 py-2">{b.nama_kendaraan}</td>
                  <td className="border px-4 py-2">{b.jenis_service}</td>
                  <td className="border px-4 py-2">{b.booking_date}</td>
                  <td className="border px-4 py-2">{b.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="border px-4 py-2 text-center text-gray-500">
                  Belum ada data booking
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
