"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { alertSuccess, alertError } from "@/components/Alert";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMount, setIsMount] = useState(false); // 🔥 State untuk cegah hydration error
  const router = useRouter();

  // Memastikan komponen sudah menempel di browser sebelum akses document/window
  useEffect(() => {
    setIsMount(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://tekweb-uas-production.up.railway.app/api/login", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Accept": "application/json" // 🔥 Penting agar Laravel kirim JSON, bukan redirect
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alertError(data.message || "Gagal login. Periksa email dan password.");
        setLoading(false);
        return;
      }

      // SIMPAN KE COOKIES (Hanya dieksekusi di Client Side)
      if (typeof document !== "undefined") {
        document.cookie = `token=${data.token}; path=/; max-age=86400; samesite=lax`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=86400; samesite=lax`;
      }

      const userRole = data.user.role;
      let redirectPath = "/";

      if (userRole === "super_admin" || userRole === "admin" || userRole === "kasir") {
        redirectPath = "/admin/dashboard";
      }

      alertSuccess("Login Berhasil! Mengalihkan...").then(() => {
          // Menggunakan router.push lebih baik daripada window.location untuk performa Next.js
          router.push(redirectPath);
          // Jika butuh refresh total state aplikasi:
          // window.location.assign(redirectPath);
      });

    } catch (err) {
      alertError("Gagal terhubung ke server. Pastikan API berjalan.");
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cegah render jika belum mount (Hydration Guard)
  if (!isMount) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-linear-to-br from-[#21435a] via-[#153140] to-[#0f2531]">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 transform transition duration-500 hover:scale-[1.01]">
        
        <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-orange-50 rounded-2xl mb-4">
                <Lock className="text-[#FF6D1F]" size={32} />
            </div>
            <h1 className="text-3xl font-black text-[#234C6A] text-center tracking-tighter uppercase">
            Login Sistem
            </h1>
            <p className="text-gray-400 text-center text-sm font-medium mt-1">
            Gunakan akun bengkel Anda untuk masuk
            </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Alamat Email</label>
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="email@contoh.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-700 font-bold focus:ring-2 focus:ring-[#FF6D1F] outline-none transition"
                />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-gray-700 font-bold focus:ring-2 focus:ring-[#FF6D1F] outline-none transition"
              />
              <button type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6D1F] transition">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6D1F] text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-orange-200 hover:bg-[#e45c14] hover:shadow-orange-300 transition-all duration-300 active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    Memproses...
                </>
            ) : "Masuk ke Akun"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mt-8">
          Belum punya akun? 
          <button 
            className="text-[#FF6D1F] hover:text-[#234C6A] ml-2 transition-colors"
            onClick={() => router.push("/auth/register")}
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </div>
  );
}