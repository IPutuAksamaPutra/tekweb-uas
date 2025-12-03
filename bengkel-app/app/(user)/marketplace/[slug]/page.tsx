export default async function ProductDetailPage({ params }: any) {
  const API_URL = "http://localhost:8000/api"; // ubah jika Laravel berbeda port

  let product = null;

  try {
    const res = await fetch(`${API_URL}/products/${params.slug}`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });

    if (res.ok) {
      product = await res.json();
    }
  } catch (e) {
    console.log("Fetch error:", e);
  }

  if (!product) {
    return (
      <div className="bg-white p-6 rounded-xl shadow max-w-xl mx-auto mt-10">
        <h1 className="text-xl font-semibold">Produk tidak ditemukan</h1>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-xl mx-auto mt-10">
      <img
        src={product.image_url || "/no-image.jpg"}
        alt={product.name}
        className="w-full h-60 object-cover rounded-lg"
      />

      <h1 className="text-3xl font-bold mt-4">{product.name}</h1>

      <p className="text-gray-600 mt-2">{product.category?.name}</p>

      <p className="text-blue-600 text-2xl font-bold mt-4">
        Rp {Number(product.price).toLocaleString("id-ID")}
      </p>

      {product.description && (
        <p className="text-gray-700 mt-4 leading-relaxed">{product.description}</p>
      )}

      <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
        Tambahkan ke Keranjang
      </button>
    </div>
  );
}
