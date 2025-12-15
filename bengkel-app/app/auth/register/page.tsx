"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from "lucide-react"; // 👁 added icon
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ===================== FUNGSI DAFTAR (TIDAK DIUBAH) ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg("Password dan konfirmasi tidak sama!");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alertError(data.message || "Registrasi gagal!");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alertSuccess("Registrasi Berhasil!");
      window.location.href = "/auth/login";
    } catch {
      alertError("Gagal terhubung ke server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-linear-to-br from-[#234C6A] to-[#102532] p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-300">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-[#FF6D1F] text-white rounded-xl shadow-md">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4">Buat Akun</h1>
          <p className="text-gray-600 text-sm mt-1">Daftar untuk mulai menggunakan layanan</p>
        </div>

        {errorMsg && <p className="text-red-600 text-center mb-3 font-medium">{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nama */}
          <InputField icon={<User size={18}/>} placeholder="Nama Lengkap" value={fullName} setValue={setFullName}/>

          {/* Email */}
          <InputField icon={<Mail size={18}/>} placeholder="Email" type="email" value={email} setValue={setEmail}/>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6D1F]">
              <Lock size={18}/>
            </span>

            <input
              type={showPass1 ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-3 border border-gray-400 rounded-xl
                bg-white text-gray-900 font-semibold placeholder:text-gray-400
                focus:ring-2 focus:ring-[#FF6D1F] focus:border-[#FF6D1F] outline-none transition"
            />

            <button type="button" onClick={()=>setShowPass1(!showPass1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FF6D1F]">
              {showPass1 ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          {/* Konfirmasi */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6D1F]">
              <Lock size={18}/>
            </span>

            <input
              type={showPass2 ? "text" : "password"}
              placeholder="Konfirmasi Password"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-3 border border-gray-400 rounded-xl
                bg-white text-gray-900 font-semibold placeholder:text-gray-400
                focus:ring-2 focus:ring-[#FF6D1F] focus:border-[#FF6D1F] outline-none transition"
            />

            <button type="button" onClick={()=>setShowPass2(!showPass2)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FF6D1F]">
              {showPass2 ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          <label className="flex items-center text-sm font-medium text-gray-700">
            <input type="checkbox" className="mr-2 accent-[#FF6D1F]" required/> Saya setuju dengan Syarat & Ketentuan
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white font-semibold py-3 rounded-xl
              shadow-md hover:shadow-xl transition text-base tracking-wide">
            {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
          </button>

        </form>

        <p className="text-center text-sm mt-6 text-gray-700">
          Sudah punya akun?
          <Link href="/auth/login" className="text-[#FF6D1F] font-semibold ml-1 hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}

const InputField = ({ icon, value, setValue, placeholder, type="text" }: any) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6D1F]">
      {icon}
    </span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e)=>setValue(e.target.value)}
      required
      className="w-full pl-12 pr-4 py-3 border border-gray-400 rounded-xl
        bg-white text-gray-900 font-semibold placeholder:text-gray-400
        focus:ring-2 focus:ring-[#FF6D1F] focus:border-[#FF6D1F] outline-none transition"
    />
  </div>
);
