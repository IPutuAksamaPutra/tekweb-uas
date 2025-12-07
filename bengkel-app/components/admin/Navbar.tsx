"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

// Fungsi utilitas untuk menghapus cookie
const deleteCookie = (name: string) => {
  // Set cookie expired untuk menghapus
  document.cookie = `${name}=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
};

export default function AdminNavbar() {
  const router = useRouter();

  // ⚠️ Ganti dengan URL API Laravel kamu yang sebenarnya
  const API_LOGOUT_URL = "http://your-laravel-api.com/api/logout";

  // --- FUNGSI PEMBERSIH KLIEN ---
  const cleanUpClientState = () => {
    console.log("Membersihkan state klien secara AGRESIF...");

    // Hapus token dari localStorage
    localStorage.removeItem("authToken");

    // Hapus cookie yang mungkin terkait
    deleteCookie("laravel_session");
    deleteCookie("XSRF-TOKEN");
    deleteCookie("authToken");
    deleteCookie("user_session_id");

    // Redirect ke halaman login
    router.replace("/auth/login");
  };

  // --- FUNGSI LOGOUT UTAMA (menggunakan fetch, bukan axios) ---
  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("Token tidak ditemukan, langsung cleanup.");
      cleanUpClientState();
      return;
    }

    try {
      const res = await fetch(API_LOGOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        // Jika server logout berbasis cookie (sanctum), gunakan credentials: 'include'
        // credentials: 'include',
        body: JSON.stringify({}), // sesuaikan payload jika perlu
      });

      if (!res.ok) {
        // Response bukan 2xx -> anggap gagal di server, tapi tetap bersihkan klien
        console.error("Logout API merespon status:", res.status);
        cleanUpClientState();
        return;
      }

      // Berhasil di server
      console.log("Server merespons OK. Melakukan cleanup klien.");
      cleanUpClientState();
    } catch (err) {
      console.error("Terjadi error saat memanggil logout API:", err);
      // Meski error (CORS / network), tetap bersihkan state klien
      cleanUpClientState();
    }
  };

  return (
    <nav className="h-16 flex items-center justify-between bg-white px-6 shadow-sm rounded-md">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
