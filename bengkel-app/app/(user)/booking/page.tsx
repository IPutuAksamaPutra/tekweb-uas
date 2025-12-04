"use client";

import { useState } from "react";
// Catatan: Ikon di sini hanya sebagai placeholder visual dalam kode. 
// Anda perlu menginstal library ikon (misalnya, Lucide, React Icons) untuk menggunakannya.
// import { Calendar, Car, Wrench, Phone, User, Info, Loader } from 'lucide-react'; 

export default function BookingPage() {
  const [loading, setLoading] = useState<boolean>(false);

  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      vehicle: form.get("vehicle"),
      booking_date: form.get("booking_date"),
      service_type: form.get("service_type"),
      phone: form.get("phone"),
      notes: form.get("notes"),
    };

    try {
      // Langkah CSRF (asumsi backend Laravel Sanctum)
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
        credentials: "include",
      });

      // Langkah POST Booking
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Booking gagal! Mohon periksa kembali data Anda.");
        return;
      }

      alert("Booking berhasil! Kami akan segera menghubungi Anda.");
      e.currentTarget.reset();
    } catch {
      alert("Terjadi kesalahan server saat memproses booking.");
    } finally {
      setLoading(false);
    }
  }

  // Kelas dasar untuk input dan select agar konsisten
  const BASE_INPUT_CLASSES = "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-150 focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F]";

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
          {/* ================= FORM KIRI ================= */}
          <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-[#FF6D1F]">
            <h2 className="text-2xl font-bold mb-6 text-[#234C6A]">
              Isi Detail Booking
            </h2>

            <form onSubmit={handleBooking} className="grid gap-5">
              
              {/* === FIELD NAMA === */}
              <div className="relative">
                {/* <User className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  // DITINGKATKAN: Tambahkan text-gray-800 & placeholder-gray-600
                  className={`${BASE_INPUT_CLASSES} text-gray-800 placeholder-gray-600`} 
                />
              </div>

              {/* === FIELD JENIS KENDARAAN === */}
              <div className="relative">
                {/* <Car className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                <select
                  name="vehicle"
                  required
                  // DITINGKATKAN: Ubah text-gray-700 menjadi text-gray-800
                  className={`${BASE_INPUT_CLASSES} text-gray-800 appearance-none`}
                >
                  <option value="" disabled>
                    Pilih Jenis Kendaraan
                  </option>
                  <option value="Matic">🛵 Matic</option>
                  <option value="Manual">⚙️ Manual</option>
                </select>
                {/* Placeholder untuk ikon dropdown */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</span> 
              </div>

              {/* === FIELD TANGGAL BOOKING === */}
              <div className="relative">
                {/* <Calendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                <input
                  name="booking_date"
                  type="datetime-local"
                  required
                  // DITINGKATKAN: Ubah text-gray-700 menjadi text-gray-800
                  className={`${BASE_INPUT_CLASSES} text-gray-800`}
                />
              </div>

              {/* === FIELD JENIS SERVICE === */}
              <div className="relative">
                {/* <Wrench className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                <select
                  required
                  name="service_type"
                  // DITINGKATKAN: Ubah text-gray-700 menjadi text-gray-800
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
                {/* Placeholder untuk ikon dropdown */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</span>
              </div>

              {/* === FIELD NOMOR WHATSAPP === */}
              <div className="relative">
                {/* <Phone className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                <input
                  name="phone"
                  type="text"
                  required
                  placeholder="Nomor WhatsApp Aktif"
                  // DITINGKATKAN: Tambahkan text-gray-800 & placeholder-gray-600
                  className={`${BASE_INPUT_CLASSES} text-gray-800 placeholder-gray-600`}
                />
              </div>

              {/* === FIELD CATATAN === */}
              <div className="relative">
                {/* <Info className="absolute top-4 left-3 text-gray-400 w-5 h-5" /> */}
                <textarea
                  name="notes"
                  placeholder="Catatan khusus (opsional): Keluhan utama, dll."
                  rows={3}
                  // DITINGKATKAN: Gunakan padding yang normal (pl-4) untuk textarea
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-150 focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] text-gray-800 placeholder-gray-600"
                />
              </div>

              {/* === TOMBOL SUBMIT === */}
              <button
                disabled={loading}
                className="
                  w-full py-3 rounded-lg text-white font-bold tracking-wider 
                  bg-[#FF6D1F] 
                  hover:bg-[#E05B1B] 
                  shadow-lg shadow-[#FF6D1F]/50
                  transition duration-300 ease-in-out transform hover:scale-[1.01]
                  disabled:bg-gray-400 disabled:shadow-none disabled:transform-none
                "
              >
                {loading ? (
                    // {loading ? <Loader className="animate-spin inline mr-2" /> : null}
                    "Memproses Booking..."
                ) : (
                    "Jadwalkan Booking Sekarang"
                )}
              </button>
            </form>
          </div>

          {/* --- */}

          {/* ================= INFORMASI SERVIS KANAN ================= */}
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
              <li className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition duration-200 cursor-default">
                <strong className="text-lg">Servis Ringan 💨</strong>
                <p className="text-sm opacity-85 mt-1">
                  Pengecekan dan penyetelan dasar: filter, busi, karburator/injeksi ringan.
                </p>
              </li>

              <li className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition duration-200 cursor-default">
                <strong className="text-lg">Servis Berat 🏗️</strong>
                <p className="text-sm opacity-85 mt-1">
                  Perbaikan mesin kompleks, turun mesin, atau penggantian komponen utama.
                </p>
              </li>

              <li className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition duration-200 cursor-default">
                <strong className="text-lg">Ganti Oli Optimal ⛽</strong>
                <p className="text-sm opacity-85 mt-1">
                  Penggantian oli mesin dan gardan dengan pilihan pelumas berkualitas.
                </p>
              </li>

              <li className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition duration-200 cursor-default">
                <strong className="text-lg">Perbaikan Rem 🛑</strong>
                <p className="text-sm opacity-85 mt-1">
                  Perawatan komprehensif sistem pengereman (kampas, cakram, minyak).
                </p>
              </li>

              <li className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition duration-200 cursor-default">
                <strong className="text-lg">Tune Up Performa ✨</strong>
                <p className="text-sm opacity-85 mt-1">
                  Optimasi kinerja mesin, pembersihan ruang bakar, dan setelan presisi.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}