"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

// Hapus cookie manual di browser
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; path=/;`;
};

export default function AdminNavbar() {
  const router = useRouter();

  const API_LOGOUT_URL = "http://localhost:8000/api/auth/logout";

  const cleanUpClient = () => {
    console.log("Membersihkan semua session client...");

    // Hapus localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Hapus cookies yang mungkin tersisa
    deleteCookie("laravel_session");
    deleteCookie("XSRF-TOKEN");
    deleteCookie("token");
    deleteCookie("access_token");

    // Redirect ke login
    router.replace("/auth/login");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("Tidak ada token → langsung bersihkan client");
      cleanUpClient();
      return;
    }

    try {
      const res = await fetch(API_LOGOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // WAJIB
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Logout Server Error:", res.status);
      } else {
        console.log("Logout Server OK");
      }
    } catch (err) {
      console.error("Logout Network Error:", err);
    }

    // Tetap cleanup meskipun error
    cleanUpClient();
  };

  return (
    <nav className="h-16 flex items-center justify-between bg-white px-6 shadow-sm rounded-md">
      <div className="flex items-center gap-5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
}
