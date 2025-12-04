"use client";

import { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";

// LUCIDE ICONS
import { Mail, Lock, User, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<CSSProperties>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("REGISTER DATA:", { fullName, email, password, confirmPassword });
    // nanti tinggal ganti dengan fetch ke API Laravel
  };

  // Tilt Effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;

      setTransformStyle({
        transform: `perspective(1000px) rotateX(${y * -8}deg) rotateY(${x * 8}deg)`,
        transition: "transform 0.1s ease-out",
      });
    };

    const reset = () => {
      setTransformStyle({
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
        transition: "transform 0.4s ease-in-out",
      });
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", reset);

    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      {/* CARD */}
      <div
        ref={cardRef}
        style={transformStyle}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-200 transition"
      >
        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-[#FF6D1F] text-white rounded-xl shadow">
            <UserPlus size={28} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mt-3">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-gray-600">
            Isi data di bawah untuk membuat akun
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FULL NAME */}
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-[#FF6D1F] focus:border-[#FF6D1F] outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* EMAIL */}
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-[#FF6D1F] focus:border-[#FF6D1F] outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-[#FF6D1F] focus:border-[#FF6D1F] outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="password"
              placeholder="Konfirmasi Password"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-[#FF6D1F] focus:border-[#FF6D1F] outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* CHECKBOX */}
          <label className="flex items-center text-sm text-gray-700">
            <input type="checkbox" className="mr-2 accent-[#FF6D1F]" required />
            Saya setuju dengan Syarat & Ketentuan
          </label>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white font-semibold py-3 rounded-xl shadow-md transition"
          >
            <UserPlus className="inline mr-2" />
            Daftar Sekarang
          </button>
        </form>

        {/* LINK LOGIN */}
        <p className="text-center text-sm mt-5 text-gray-600">
          Sudah punya akun?{" "}
          <Link
            href="/auth/login"
            className="text-[#FF6D1F] font-semibold hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
