"use client";

import dynamic from "next/dynamic";

// Dynamic Import untuk MyMaps agar tidak error "window is not defined"
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
    <div className="grid gap-6 md:gap-10 px-4 md:px-0">
      {/* HERO SECTION */}
      <section
        className="rounded-2xl shadow-xl text-white p-6 md:p-10"
        style={{ backgroundColor: "#234C6A" }}
      >
        {/* GRID HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* ================= KIRI (KONTEN HERO) ================= */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Selamat Datang di <br className="hidden md:block" />
              <span style={{ color: "#FF6D1F" }}>Bengkel Dexar</span>
            </h1>

            <p className="text-base md:text-lg opacity-90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Solusi mudah untuk booking bengkel, membeli sparepart, dan
              mengelola kebutuhan perawatan kendaraan Anda dalam satu aplikasi.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {/* TOMBOL BOOKING */}
              <a
                href="/booking"
                className="text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition all hover:scale-105 active:scale-95 text-center"
                style={{ backgroundColor: "#FF6D1F" }}
              >
                Booking Sekarang
              </a>

              {/* TOMBOL LIHAT PRODUK */}
              <a
                href="/marketplace"
                className="font-semibold px-8 py-3 rounded-xl transition all hover:bg-white/10 border-2 text-center hover:scale-105 active:scale-95"
                style={{
                  color: "#FF6D1F",
                  borderColor: "#FF6D1F",
                  backgroundColor: "transparent",
                }}
              >
                Lihat Produk
              </a>
            </div>
          </div>

          {/* ================= KANAN (MAP) ================= */}
          {/* Di mobile map muncul di atas teks (order-1), di desktop di kanan */}
          <div className="w-full h-[250px] sm:h-[300px] lg:h-[350px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 order-1 lg:order-2">
            <MyMaps />
          </div>
        </div>
      </section>

      {/* FITUR SECTION */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* CARD 1 */}
        <div
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-t-4 flex flex-col justify-between"
          style={{ borderColor: "#234C6A" }}
        >
          <div>
            <h2 className="text-xl font-bold mb-3 text-[#234C6A]">
              Marketplace Produk
            </h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Cari dan beli sparepart berkualitas dengan mudah dan cepat dari mitra terpercaya.
            </p>
          </div>
          <a
            href="/marketplace"
            className="text-[#234C6A] font-bold hover:gap-3 transition-all flex items-center gap-2 group"
          >
            Lihat Produk <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {/* CARD 2 */}
        <div
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-t-4 flex flex-col justify-between"
          style={{ borderColor: "#234C6A" }}
        >
          <div>
            <h2 className="text-xl font-bold mb-3 text-[#234C6A]">
              Booking Bengkel
            </h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Atur jadwal servis kendaraan Anda secara online tanpa perlu antre di lokasi.
            </p>
          </div>
          <a
            href="/booking"
            className="text-[#234C6A] font-bold hover:gap-3 transition-all flex items-center gap-2 group"
          >
            Booking Sekarang <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {/* CARD 3 */}
        <div
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-t-4 flex flex-col justify-between"
          style={{ borderColor: "#234C6A" }}
        >
          <div>
            <h2 className="text-xl font-bold mb-3 text-[#234C6A]">
              Riwayat Servis
            </h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Pantau kondisi kesehatan kendaraan Anda melalui catatan riwayat servis digital.
            </p>
          </div>
          <a
            href="/booking/history"
            className="text-[#234C6A] font-bold hover:gap-3 transition-all flex items-center gap-2 group"
          >
            Lihat Riwayat <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </section>
    </div>
  );
}