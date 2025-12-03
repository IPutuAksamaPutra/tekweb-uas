export default async function MarketplacePage() {
  // API Laravel langsung (tanpa env)
  const API_URL = "http://localhost:8000/api"; // ubah jika port berbeda

  let products = [];

  try {
    const res = await fetch(`${API_URL}/products`, {
      method: "GET",
      cache: "no-store",      // ambil terbaru
      credentials: "include", // kalau pakai sanctum
    });

    if (res.ok) {
      products = await res.json();
    }
  } catch (e) {
    console.log("Fetch error:", e);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Marketplace</h1>

      {products.length === 0 && (
        <p className="text-gray-600">Belum ada produk.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p: any) => (
          <a
            key={p.id}
            href={`/marketplace/${p.id}`}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={p.image_url || "/no-image.jpg"}
              alt={p.name}
              className="w-full h-40 object-cover"
            />

            <div className="p-4">
              <h2 className="text-lg font-semibold">{p.name}</h2>

              <p className="text-sm text-gray-500">{p.category?.name}</p>

              <p className="font-bold text-blue-600 mt-2">
                Rp {Number(p.price).toLocaleString("id-ID")}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
