"use client";

import { useState } from "react";

export default function BookingPage() {
  const [loading, setLoading] = useState(false);

  async function handleBooking(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);
    const payload = {
      vehicle: form.get("vehicle"),
      booking_date: form.get("booking_date"),
      notes: form.get("notes"),
    };

    try {
      // WAJIB → ambil CSRF cookie dari Laravel Sanctum
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
        credentials: "include",
      });

      // POST ke API booking Laravel
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Booking gagal!");
        return;
      }

      alert("Booking berhasil!");
      e.target.reset();
    } catch (err) {
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Booking Bengkel</h1>

      <form onSubmit={handleBooking} className="grid gap-4">
        <input
          name="vehicle"
          type="text"
          required
          placeholder="Jenis Kendaraan"
          className="border p-2 rounded"
        />

        <input
          name="booking_date"
          type="datetime-local"
          required
          className="border p-2 rounded"
        />

        <textarea
          name="notes"
          placeholder="Catatan (opsional)"
          className="border p-2 rounded"
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Memproses..." : "Booking"}
        </button>
      </form>
    </div>
  );
}
