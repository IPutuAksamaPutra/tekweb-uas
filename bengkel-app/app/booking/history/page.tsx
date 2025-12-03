export default async function BookingHistoryPage() {
  // GUNAKAN URL LARAVEL LANGSUNG (TANPA ENV)
  const API_URL = "http://localhost:8000/api"; // ← ubah kalau port berbeda

  let history = [];

  try {
    const res = await fetch(`${API_URL}/booking`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (res.ok) {
      history = await res.json();
    }
  } catch (e) {
    console.log("Fetch error:", e);
  }

  return (
    <div className="bg-white p-6 shadow rounded-xl max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Riwayat Booking</h1>

      {history.length === 0 && (
        <p className="text-gray-600">Belum ada riwayat booking.</p>
      )}

      <div className="grid gap-4 mt-4">
        {history.map((item: any) => (
          <div key={item.id} className="border p-4 rounded-lg">
            <p className="font-semibold text-lg">{item.vehicle}</p>
            <p className="text-sm text-gray-500">
              Tanggal: {new Date(item.booking_date).toLocaleString("id-ID")}
            </p>
            <p className="text-blue-600 font-medium capitalize">
              Status: {item.status}
            </p>
            {item.notes && (
              <p className="text-gray-700 text-sm mt-1">Catatan: {item.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
