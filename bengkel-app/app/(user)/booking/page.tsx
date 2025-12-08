"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

export default function BookingPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Ambil user login dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) {
      alert("Anda harus login terlebih dahulu.");
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      jenis_kendaraan: form.get("jenis_kendaraan"),
      nama_kendaraan: form.get("nama_kendaraan"),
      booking_date: form.get("booking_date"),
      jenis_service: form.get("jenis_service"),
      no_wa: form.get("no_wa"),
      notes: form.get("notes"),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      // Cek content type sebelum parse
      const contentType = res.headers.get("content-type");
      let data: any;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Response bukan JSON:", text);
        alert("Terjadi error server. Silakan hubungi admin.");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Booking gagal! Mohon periksa data Anda.");
        return;
      }

      alert("Booking berhasil! Kami akan segera menghubungi Anda.");
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server saat memproses booking.");
    } finally {
      setLoading(false);
    }
  }

  const BASE_INPUT_CLASSES =
    "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-150 focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F]";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#234C6A]">
            Booking Servis Bengkel Online 🛠️
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Jadwalkan perawatan kendaraan Anda dengan mudah.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-[#FF6D1F]">
            <h2 className="text-2xl font-bold mb-6 text-[#234C6A]">
              Isi Detail Booking
            </h2>

            <form onSubmit={handleBooking} className="grid gap-5">
              <div className="relative">
                <input
                  name="nama_kendaraan"
                  type="text"
                  required
                  placeholder="Nama Kendaraan (Ex: Vario, Scoopy)"
                  className={`${BASE_INPUT_CLASSES} text-gray-800 placeholder-gray-600`}
                />
              </div>

              <div className="relative">
                <select
                  name="jenis_kendaraan"
                  required
                  className={`${BASE_INPUT_CLASSES} text-gray-800 appearance-none`}
                >
                  <option value="" disabled>
                    Pilih Jenis Kendaraan
                  </option>
                  <option value="Matic">🛵 Matic</option>
                  <option value="Manual">⚙️ Manual</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
              </div>

              <div className="relative">
                <input
                  name="booking_date"
                  type="datetime-local"
                  required
                  className={`${BASE_INPUT_CLASSES} text-gray-800`}
                />
              </div>

              <div className="relative">
                <select
                  name="jenis_service"
                  required
                  className={`${BASE_INPUT_CLASSES} text-gray-800 appearance-none`}
                >
                  <option value="" disabled>
                    Pilih Jenis Servis
                  </option>
                  <option value="Servis Ringan">🔧 Servis Ringan</option>
                  <option value="Servis Berat">🔩 Servis Berat</option>
                  <option value="Ganti Oli">💧 Ganti Oli</option>
                  <option value="Perbaikan Rem">🛑 Perbaikan Rem</option>
                  <option value="Tune Up">⚡ Tune Up</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
              </div>

              <div className="relative">
                <input
                  name="no_wa"
                  type="text"
                  required
                  placeholder="Nomor WhatsApp Aktif"
                  className={`${BASE_INPUT_CLASSES} text-gray-800 placeholder-gray-600`}
                />
              </div>

              <div className="relative">
                <textarea
                  name="notes"
                  placeholder="Catatan khusus (opsional): Keluhan utama, dll."
                  rows={3}
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-150 focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] text-gray-800 placeholder-gray-600"
                />
              </div>

              <button
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-bold tracking-wider bg-[#FF6D1F] hover:bg-[#E05B1B] shadow-lg shadow-[#FF6D1F]/50 transition duration-300 transform hover:scale-[1.01] disabled:bg-gray-400 disabled:shadow-none"
              >
                {loading ? "Memproses Booking..." : "Jadwalkan Booking Sekarang"}
              </button>
            </form>
          </div>

          <div className="bg-[#234C6A] text-white p-8 rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 border-b border-white/20 pb-3">
              Informasi Layanan Kami 🌟
            </h2>

            <p className="text-white/90 mb-8 leading-relaxed">
              Kami berkomitmen memberikan pelayanan terbaik untuk **Matic** dan **Manual**.
              Dapatkan perawatan ahli dari teknisi bersertifikasi kami.
            </p>

            <h3 className="text-xl font-semibold mb-4 text-[#FF6D1F]">
              Pilihan Servis Unggulan:
            </h3>

            <ul className="space-y-4">
              <li className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition">Servis Ringan 💨</li>
              <li className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition">Servis Berat 🏗️</li>
              <li className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition">Ganti Oli ⛽</li>
              <li className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition">Perbaikan Rem 🛑</li>
              <li className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition">Tune Up ✨</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
