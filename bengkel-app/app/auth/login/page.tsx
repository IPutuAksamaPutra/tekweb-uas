"use client";

import { useState } from "react";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

// --- MOCK IKON LUCID ---
const EyeIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a1.8 1.8 0 0 1 .32-.69M14.93 11.23a3 3 0 1 1-3.6-3.6M12 9a3 3 0 0 0-3 3M1 1l22 22"/></svg>;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alertError(data.message || "Gagal login. Periksa email dan password.");
        return;
      }

      // ============================
      //   SIMPAN TOKEN KE COOKIES
      // ============================
      document.cookie = `token=${data.token}; path=/;`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/;`;

      // ============================
      //       PENENTUAN ROLE
      // ============================
      const userRole = data.user.role;
      let redirectPath = "/";

      if (userRole === "super_admin" || userRole === "admin") {
        redirectPath = "/admin/dashboard";
      }

      // ============================
      //       REDIRECT PAKSA
      // ============================
      setTimeout(() => {
        window.location.assign(redirectPath);
      }, 50);

    } catch (err) {
      alertError("Terjadi kesalahan jaringan. Pastikan Laravel berjalan.");
      console.error("Login Error:", err);
    }
  };

    return (
    <div className="min-h-screen flex items-center justify-center px-6 
    bg-linear-to-br from-[#21435a] via-[#153140] to-[#0f2531]">

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-200
        transform transition duration-500 hover:scale-[1.015]">

        <h1 className="text-3xl font-extrabold text-[#234C6A] text-center mb-1 tracking-wide">
          Login Sistem
        </h1>
        <p className="text-gray-500 text-center mb-7 text-sm">
          Masukkan email & password untuk masuk
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 p-3 mb-5 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="text-gray-700 font-medium text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 mt-1 border rounded-lg text-gray-700 
              focus:ring-2 focus:ring-[#FF6D1F] focus:border-[#FF6D1F] outline-none transition"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-gray-700 font-medium text-sm">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword?"text":"password"}
                value={password}
                onChange={e=>setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg text-gray-700 pr-11 
                focus:ring-2 focus:ring-[#FF6D1F] focus:border-[#FF6D1F] outline-none transition"
              />
              <button type="button"
                onClick={()=>setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FF6D1F] transition">
                {showPassword?<EyeOffIcon/>:<EyeIcon/>}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button type="submit"
            className="w-full bg-[#FF6D1F] text-white font-bold py-3 rounded-lg 
            shadow-md hover:shadow-xl hover:bg-[#e45c14] transition-all duration-300 active:scale-[.97]">
            Masuk
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Belum punya akun? 
          <span className="text-[#FF6D1F] font-semibold cursor-pointer hover:underline ml-1">
            Daftar sekarang
          </span>
        </p>
      </div>
    </div>
  );
}
