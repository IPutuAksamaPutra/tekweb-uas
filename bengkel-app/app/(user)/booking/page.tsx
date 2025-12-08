"use client";

import { useState, useEffect } from "react";
import React from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

export default function BookingPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false); // State untuk Client-Side rendering
  const [user, setUser] = useState<User | null>(null);

  // Ambil user + token dari localStorage saat komponen mount
  useEffect(() => {
    // Tandai bahwa kita ada di sisi klien
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && typeof parsedUser.email === 'string') {
                setUser({ ...parsedUser, token: storedToken });
                console.log("User + token berhasil dimuat.");
            } else {
                console.warn("Data user di localStorage tidak valid.");
            }
          } catch (e) {
            console.error("Gagal parse JSON 'user' dari localStorage:", e);
          }
        } else {
          console.warn("User atau token tidak ditemukan di localStorage. Pengguna mungkin perlu login.");
        }
    }
  }, []);

  const BASE_INPUT_CLASSES =
    "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-150 focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F]";

  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // SOLUSI: Simpan form element sebelum operasi asynchronous
    const formElement = e.currentTarget; 
    let bookingSuccess = false; // Flag untuk menandai keberhasilan booking

    if (!user || !user.token) {
      alert("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    setLoading(true);

    const form = new FormData(formElement); // Gunakan formElement yang stabil
    const payload = {
      jenis_kendaraan: form.get("jenis_kendaraan"),
      nama_kendaraan: form.get("nama_kendaraan"),
      booking_date: form.get("booking_date"),
      jenis_service: form.get("jenis_service"),
      no_wa: form.get("no_wa"),
      notes: form.get("notes"),
    };

    console.log("Payload booking:", payload);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        alert("Token tidak valid. Silakan login ulang.");
        return;
      }

      if (!res.ok) {
        console.log("Respons Laravel:", data);
        alert(data?.message || "Booking gagal. Pastikan data sudah benar.");
        return;
      }

      alert("Booking berhasil! Admin akan segera menghubungi Anda.");
      bookingSuccess = true; // Set sukses
      
    } catch (err) {
      console.error("Booking error:", err);
      alert("Terjadi kesalahan server. Cek console untuk detail.");
    } finally {
      setLoading(false);
      
      // SOLUSI: Reset hanya jika bookingSuccess adalah true, menggunakan form element yang disimpan.
      if (bookingSuccess) {
          formElement.reset(); 
      }
    }
  }

  // Tampilkan loading saat komponen sedang mengambil data di sisi klien
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-[#234C6A]">Memuat data...</p>
      </div>
    );
  }

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
          {/* Form Booking */}
          <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-[#FF6D1F]">
            <h2 className="text-2xl font-bold mb-6 text-[#234C6A]">
              Isi Detail Booking
            </h2>
            <form onSubmit={handleBooking} className="grid gap-5">
              <input
                name="nama_kendaraan"
                type="text"
                required
                placeholder="Nama Kendaraan (Ex: Vario, Scoopy)"
                className={`${BASE_INPUT_CLASSES} text-gray-800 placeholder-gray-600`}
              />
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
              <input
                name="booking_date"
                type="date"
                required
                className={`${BASE_INPUT_CLASSES} text-gray-800`}
              />
              <select
                name="jenis_service"
                required
                className={`${BASE_INPUT_CLASSES} text-gray-800 appearance-none`}
              >
                <option value="" disabled>
                  Pilih Jenis Servis
                </option>
                <option value="Service Ringan">🔧 Servis Ringan</option>
                <option value="Service Berat">🔩 Servis Berat</option>
                <option value="Ganti Oli">💧 Ganti Oli</option>
                <option value="Perbaikan Rem">🛑 Perbaikan Rem</option>
                <option value="Tune Up">⚡ Tune Up</option>
              </select>
              <input
                name="no_wa"
                type="text"
                required
                placeholder="Nomor WhatsApp Aktif"
                className={`${BASE_INPUT_CLASSES} text-gray-800 placeholder-gray-600`}
              />
              <textarea
                name="notes"
                placeholder="Catatan khusus (opsional)"
                rows={3}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-150 focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] text-gray-800 placeholder-gray-600"
              />
              <button
                disabled={loading || !user} // Dinonaktifkan jika loading atau user belum dimuat
                className="w-full py-3 rounded-lg text-white font-bold tracking-wider bg-[#FF6D1F] hover:bg-[#E05B1B] shadow-lg shadow-[#FF6D1F]/50 transition duration-300 transform hover:scale-[1.01] disabled:bg-gray-400 disabled:shadow-none"
              >
                {loading ? "Memproses Booking..." : "Jadwalkan Booking Sekarang"}
              </button>
            </form>
          </div>

          {/* Info Layanan */}
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