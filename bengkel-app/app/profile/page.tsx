export default async function ProfilePage() {
  const API_URL = "http://localhost:8000/api"; // ubah kalau port Laravel beda

  let user = null;

  try {
    const res = await fetch(`${API_URL}/me`, {
      method: "GET",
      credentials: "include", // penting untuk Sanctum
      cache: "no-store",
    });

    if (res.ok) {
      user = await res.json();
    }
  } catch (e) {
    console.log("Fetch error:", e);
  }

  // Jika belum login
  if (!user) {
    return (
      <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-semibold mb-2">Profil Saya</h1>
        <p className="text-gray-600">Anda belum login.</p>
        <a
          href="/auth/login"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Login Sekarang
        </a>
      </div>
    );
  }

  // Jika user sudah login
  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">Profil Saya</h1>

      <div className="grid gap-3 text-gray-700">
        <p><span className="font-semibold">Nama:</span> {user.name}</p>
        <p><span className="font-semibold">Email:</span> {user.email}</p>

        {user.phone && (
          <p><span className="font-semibold">Telepon:</span> {user.phone}</p>
        )}

        {user.address && (
          <p><span className="font-semibold">Alamat:</span> {user.address}</p>
        )}
      </div>

      <a
        href="/"
        className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Kembali ke Beranda
      </a>
    </div>
  );
}
