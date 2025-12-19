"use client";

import { useEffect, useState } from "react";
import { LogOut, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { alertSuccess, alertError } from "@/components/Alert";

export default function AdminNavbar() {
  const router = useRouter();
  const [isMount, setIsMount] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const API_LOGOUT_URL = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/auth/logout` 
    : "https://tekweb-uas-production.up.railway.app/api/auth/logout";

  useEffect(() => {
    setIsMount(true);
  }, []);

  // Helper: Hapus cookie secara aman
  const deleteCookie = (name: string) => {
    if (typeof document !== "undefined") {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; Max-Age=0; path=/;`;
    }
  };

  const cleanUpClient = () => {
    console.log("Membersihkan semua session client...");

    // 1. Hapus localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.clear(); // Opsional: bersihkan semua jika perlu
    }

    // 2. Hapus cookies
    const cookiesToClear = ["token", "user", "laravel_session", "XSRF-TOKEN", "access_token"];
    cookiesToClear.forEach(deleteCookie);

    // 3. Beri notifikasi & Redirect
    alertSuccess("Anda telah keluar dari sistem").then(() => {
      router.replace("/auth/login");
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    // Coba ambil token dari localStorage atau Cookie
    let token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (!token && typeof document !== "undefined") {
      token = document.cookie.match(/token=([^;]+)/)?.[1] || null;
    }

    if (!token) {
      console.warn("Sesi sudah hilang, langsung cleanup.");
      cleanUpClient();
      return;
    }

    try {
      const res = await fetch(API_LOGOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Logout Server Error:", res.status);
      }
    } catch (err) {
      console.error("Logout Network Error:", err);
    } finally {
      setIsLoggingOut(false);
      cleanUpClient();
    }
  };

  if (!isMount) return null;

  return (
    <nav className="h-20 flex items-center justify-between bg-white px-8 shadow-sm border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="bg-[#234C6A] p-2 rounded-lg text-white">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Access Control</p>
          <p className="text-sm font-bold text-[#234C6A]">Administrator Panel</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all duration-300 disabled:opacity-50 shadow-sm shadow-red-100"
        >
          {isLoggingOut ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          )}
          {isLoggingOut ? "Keluar..." : "Logout"}
        </button>
      </div>
    </nav>
  );
}