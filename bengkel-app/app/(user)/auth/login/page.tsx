"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("LOGIN:", { email, password });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-200">

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-[#FF6D1F] text-white rounded-xl shadow">
            <LogIn size={26} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mt-3">Masuk Akun</h1>
          <p className="text-sm text-gray-600">Silahkan login untuk melanjutkan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email" required placeholder="Email"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50 focus:ring-[#FF6D1F]"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="password" required placeholder="Password"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50 focus:ring-[#FF6D1F]"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-[#FF6D1F] text-white py-3 rounded-xl hover:bg-orange-600 font-semibold">
            <LogIn className="inline mr-2" /> Login
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-gray-600">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-[#FF6D1F] font-semibold hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
