export default function Home() {
  return (
    <div className="grid gap-10">

      {/* HERO SECTION */}
      <section
        className="rounded-xl shadow text-white p-10"
        style={{ backgroundColor: "#234C6A" }}
      >
        <h1 className="text-4xl font-bold mb-4">Selamat Datang di BengkelApp</h1>
        <p className="text-lg opacity-90 leading-relaxed max-w-2xl">
          Solusi mudah untuk booking bengkel, membeli sparepart, dan mengelola kebutuhan
          perawatan kendaraan Anda dalam satu aplikasi.
        </p>

        <div className="mt-6 flex gap-4">

          {/* TOMBOL BOOKING #FF6D1F */}
          <a
            href="/booking"
            className="text-white font-semibold px-5 py-2 rounded-lg shadow transition"
            style={{ backgroundColor: "#FF6D1F" }}
          >
            Booking Sekarang
          </a>

          {/* TOMBOL LIHAT PRODUK OUTLINE #FF6D1F */}
          <a
            href="/marketplace"
            className="font-semibold px-5 py-2 rounded-lg transition"
            style={{
              color: "#FF6D1F",
              border: "2px solid #FF6D1F",
              backgroundColor: "transparent",
            }}
          >
            Lihat Produk
          </a>

        </div>
      </section>

      {/* FITUR SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CARD 1 */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border-t-4"
          style={{ borderColor: "#234C6A" }}>
          <h2 className="text-xl font-semibold mb-2 text-[#234C6A]">Marketplace Produk</h2>
          <p className="text-gray-600 mb-4">
            Cari dan beli sparepart berkualitas dengan mudah.
          </p>
          <a href="/marketplace" className="text-[#234C6A] font-semibold hover:underline">
            Lihat Produk →
          </a>
        </div>

        {/* CARD 2 */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border-t-4"
          style={{ borderColor: "#234C6A" }}>
          <h2 className="text-xl font-semibold mb-2 text-[#234C6A]">Booking Bengkel</h2>
          <p className="text-gray-600 mb-4">
            Pilih jadwal servis tanpa harus mengantri lama.
          </p>
          <a href="/booking" className="text-[#234C6A] font-semibold hover:underline">
            Booking Sekarang →
          </a>
        </div>

        {/* CARD 3 */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border-t-4"
          style={{ borderColor: "#234C6A" }}>
          <h2 className="text-xl font-semibold mb-2 text-[#234C6A]">Riwayat Servis</h2>
          <p className="text-gray-600 mb-4">
            Lihat catatan servis kendaraan Anda kapan saja.
          </p>
          <a href="/booking/history" className="text-[#234C6A] font-semibold hover:underline">
            Lihat Riwayat →
          </a>
        </div>

      </section>

    </div>
  );
}
