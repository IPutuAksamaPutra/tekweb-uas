"use client";

import dynamic from "next/dynamic";

// 🔥 Perbaikan utama: Menggunakan Dynamic Import untuk MyMaps agar tidak error "window is not defined"
const MyMaps = dynamic(() => import("@/components/user/MyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center text-slate-500 font-medium">
      Memuat Peta Bengkel...
    </div>
  ),
});

export default function Home() {
  return (
    <div className="grid gap-10">
      {/* HERO SECTION */}
      <section
        className="rounded-xl shadow text-white p-10"
        style={{ backgroundColor: "#234C6A" }}
      >
        {/* GRID HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* ================= KIRI (KONTEN HERO) ================= */}
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Selamat Datang di Bengkel Dexar
            </h1>

            <p className="text-lg opacity-90 leading-relaxed max-w-2xl">
              Solusi mudah untuk booking bengkel, membeli sparepart, dan
              mengelola kebutuhan perawatan kendaraan Anda dalam satu aplikasi.
            </p>

            <div className="mt-6 flex gap-4">
              {/* TOMBOL BOOKING */}
              <a
                href="/booking"
                className="text-white font-semibold px-5 py-2 rounded-lg shadow transition hover:brightness-110"
                style={{ backgroundColor: "#FF6D1F" }}
              >
                Booking Sekarang
              </a>

              {/* TOMBOL LIHAT PRODUK */}
              <a
                href="/marketplace"
                className="font-semibold px-5 py-2 rounded-lg transition hover:bg-white/10"
                style={{
                  color: "#FF6D1F",
                  border: "2px solid #FF6D1F",
                  backgroundColor: "transparent",
                }}
              >
                Lihat Produk
              </a>
            </div>
          </div>

          {/* ================= KANAN (MAP) ================= */}
          <div className="w-full h-[280px] lg:h-[260px] rounded-xl overflow-hidden shadow-lg border border-white/20">
            <MyMaps />
          </div>
        </div>
      </section>

      {/* FITUR SECTION (SEMUA CARD DIKEMBALIKAN) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1 */}
        <div
          className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border-t-4"
          style={{ borderColor: "#234C6A" }}
        >
          <h2 className="text-xl font-semibold mb-2 text-[#234C6A]">
            Marketplace Produk
          </h2>
          <p className="text-gray-600 mb-4">
            Cari dan beli sparepart berkualitas dengan mudah.
          </p>
          <a
            href="/marketplace"
            className="text-[#234C6A] font-semibold hover:underline"
          >
            Lihat Produk →
          </a>
        </div>

        {/* CARD 2 */}
        <div
          className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border-t-4"
          style={{ borderColor: "#234C6A" }}
        >
          <h2 className="text-xl font-semibold mb-2 text-[#234C6A]">
            Booking Bengkel
          </h2>
          <p className="text-gray-600 mb-4">
            Pilih jadwal servis tanpa harus mengantri lama.
          </p>
          <a
            href="/booking"
            className="text-[#234C6A] font-semibold hover:underline"
          >
            Booking Sekarang →
          </a>
        </div>

        {/* CARD 3 */}
        <div
          className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border-t-4"
          style={{ borderColor: "#234C6A" }}
        >
          <h2 className="text-xl font-semibold mb-2 text-[#234C6A]">
            Riwayat Servis
          </h2>
          <p className="text-gray-600 mb-4">
            Lihat catatan servis kendaraan Anda kapan saja.
          </p>
          <a
            href="/booking/history"
            className="text-[#234C6A] font-semibold hover:underline"
          >
            Lihat Riwayat →
          </a>
        </div>
      </section>
    </div>
  );
}
