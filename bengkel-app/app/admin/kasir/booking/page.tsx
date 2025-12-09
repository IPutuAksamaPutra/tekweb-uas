"use client";

import { useEffect, useState } from "react";

export default function KasirBookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8000/api";

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "GET",
        credentials: "include", // WAJIB untuk Sanctum
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="p-4">
      <h1>Daftar Booking</h1>

      {loading && <p>Loading...</p>}

      {!loading && bookings.length === 0 && (
        <p>Tidak ada booking yang bisa diproses.</p>
      )}

      <ul>
        {bookings.map((b: any) => (
          <li key={b.id} className="border p-3 my-2">
            <p><b>Nama:</b> {b.user?.name}</p>
            <p><b>Service:</b> {b.jenis_service}</p>
            <p><b>Status:</b> {b.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
