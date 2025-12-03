"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// -------- IKON -------- //
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const MailIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size}
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size}
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LogInIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size}
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </svg>
);

// -------- LOGIN PAGE -------- //
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("LOGIN DATA:", { email, password });
  };

  // Tilt effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normalizedX = x / rect.width - 0.5;
      const normalizedY = y / rect.height - 0.5;
      const maxTilt = 8;

      setTransformStyle({
        transform: `perspective(1000px) rotateX(${normalizedY * -maxTilt}deg) rotateY(${normalizedX * maxTilt}deg)`,
        transition: "transform 0.1s ease-out",
      });
    };

    const resetTilt = () => {
      setTransformStyle({
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
        transition: "transform 0.4s ease-in-out",
      });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", resetTilt);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", resetTilt);
    };
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4 sm:p-6">

      {/* CARD */}
      <div
        ref={cardRef}
        style={transformStyle}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-200 transition-all"
      >
        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-[#FF6D1F] text-white rounded-xl shadow">
            <LogInIcon size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mt-3">Selamat Datang</h1>
          <p className="text-sm text-gray-500">Masukkan akun kamu untuk melanjutkan</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div className="relative group">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-[#FF6D1F] focus:border-[#FF6D1F]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-[#FF6D1F] focus:border-[#FF6D1F]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-right text-sm">
            <Link href="/auth/forgot-password" className="text-[#FF6D1F] hover:underline">
              Lupa Password?
            </Link>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white py-3 rounded-xl font-semibold shadow-md transition"
          >
            <LogInIcon className="inline mr-2" />
            Masuk
          </button>
        </form>

        {/* LINK REGISTER */}
        <p className="text-center text-sm mt-5 text-gray-600">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-[#FF6D1F] font-semibold hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
