export default function Home() {
return (
<div className="grid gap-6">
<section className="bg-white p-6 rounded-xl shadow">
<h1 className="text-2xl font-semibold mb-2">Selamat datang di Bengkel</h1>
<p className="text-gray-600">Layanan cepat, mudah, dan terpercaya.</p>
</section>


<section className="grid grid-cols-1 md:grid-cols-2 gap-4">
<a href="/marketplace" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
<h2 className="text-xl font-semibold mb-1">Marketplace Produk</h2>
<p className="text-gray-600 text-sm">Lihat dan beli sparepart & perlengkapan bengkel.</p>
</a>


<a href="/booking" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
<h2 className="text-xl font-semibold mb-1">Booking Bengkel</h2>
<p className="text-gray-600 text-sm">Pesan jadwal servis kendaraan Anda.</p>
</a>
</section>
</div>
);
}