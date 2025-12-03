export default function HomeAboutPage() {
  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">
        Tentang Bengkel Kami
      </h1>

      <p className="text-gray-700 leading-relaxed mb-4">
        BengkelApp adalah platform layanan bengkel modern yang dirancang untuk
        memudahkan pelanggan melakukan booking servis, membeli sparepart, dan
        mendapatkan informasi penting tentang kendaraan secara online.
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        Dengan sistem yang user-friendly dan dukungan teknologi modern, kami
        memastikan pengalaman bengkel lebih cepat, teratur, dan nyaman.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Misi Kami</h2>
      <ul className="list-disc ml-6 text-gray-700 leading-relaxed">
        <li>Memberikan kemudahan servis kendaraan tanpa harus mengantri.</li>
        <li>Menyediakan marketplace sparepart yang lengkap dan terpercaya.</li>
        <li>Menciptakan sistem yang transparan dan aman bagi pelanggan.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Layanan Kami</h2>
      <ul className="list-disc ml-6 text-gray-700 leading-relaxed">
        <li>Booking servis kendaraan online.</li>
        <li>Marketplace sparepart & aksesoris.</li>
        <li>Riwayat booking, status servis, dan pengaturan profil.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Kenapa Memilih Kami?</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Karena kami hadir untuk memudahkan Anda. Tidak perlu menunggu lama di
        bengkel, cukup booking secara online dan kami akan siap melayani.
      </p>
    </div>
  );
}
