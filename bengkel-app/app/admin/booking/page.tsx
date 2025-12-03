"use client";

import { useEffect, useState } from "react";

interface Booking {
  id: number;
  vehicle: string;
  booking_date: string;
  notes: string | null;
  status: string;
}

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch booking dari Laravel
  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking`, {
        credentials: "include",
      });

      const data = await res.json();
      setBookings(data);
    } catch (err) {
      alert("Gagal memuat data booking");
    } finally {
      setLoading(false);
    }
  }

  // Update status booking
  async function updateStatus(id: number, status: string) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      fetchBookings();
    } catch (err) {
      alert("Gagal mengubah status");
    }
  }

  // Hapus booking
  async function deleteBooking(id: number) {
    if (!confirm("Yakin ingin menghapus booking ini?")) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      fetchBookings();
    } catch (err) {
      alert("Gagal menghapus booking");
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading)
    return <p className="text-center py-10 text-gray-500">Memuat data...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-5">Manajemen Booking Bengkel</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-3 text-left">Kendaraan</th>
            <th className="p-3 text-left">Tanggal Booking</th>
            <th className="p-3 text-left">Catatan</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{b.vehicle}</td>
              <td className="p-3">
                {new Date(b.booking_date).toLocaleString("id-ID")}
              </td>
              <td className="p-3">{b.notes || "-"}</td>
              <td className="p-3 font-medium">{b.status}</td>

              <td className="p-3 space-x-2">
                <select
                  className="border rounded p-1"
                  value={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                </select>

                <button
                  onClick={() => deleteBooking(b.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}

          {bookings.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                Tidak ada booking.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
