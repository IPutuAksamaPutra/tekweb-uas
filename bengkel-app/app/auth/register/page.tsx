"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// Definisikan tipe Props khusus untuk ikon (termasuk 'size')
interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
}

// ----------------------------------------------------
// KOMPONEN SVG INLINE (Ikon Dasar)
// ----------------------------------------------------

const MailIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"/></svg>
);

const LockIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

const UserIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const UserPlusIcon = ({ size = 24, ...props }: IconProps) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
);

// ----------------------------------------------------


export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Hooks untuk Efek Tilt (Pergerakan Kursor)
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("REGISTER DATA:", { fullName, email, password });
    // Logika Registrasi akan ditambahkan di sini
  };

  // Logika Efek Tilt / Parallax
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normalizedX = (x / rect.width) - 0.5;
      const normalizedY = (y / rect.height) - 0.5;

      const maxTilt = 8; 
      
      const rotateX = normalizedY * maxTilt * -1; 
      const rotateY = normalizedX * maxTilt;
      
      setTransformStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out'
      });
    };

    const handleMouseLeave = () => {
      setTransformStyle({ 
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.5s ease-in-out'
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);


  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 p-4 sm:p-6 relative overflow-hidden">
        
        {/* Latar Belakang Gradien Statis */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#171717_0%,_#0a0a0a_70%)] opacity-80 z-0"></div>

        {/* Kartu Register Utama (Target Tilt Effect) */}
      <div 
            ref={cardRef}
            style={transformStyle}
            className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-purple-500/50 p-7 sm:p-8 rounded-3xl shadow-[0_0_60px_-15px_rgba(168,85,247,0.5)] transition-all duration-300 relative z-10 hover:shadow-[0_0_80px_-15px_rgba(168,85,247,0.8)]"
        >
        
        {/* Efek Glow di dalam Kartu (Warna ungu) */}
        {/* Tidak perlu diubah, biarkan z-index-nya lebih rendah dari konten */}
        <div className="absolute inset-0 rounded-3xl bg-purple-500 opacity-10 blur-2xl transition-opacity duration-500 z-10"></div> {/* Tambah z-10 untuk kejelasan */}

        {/* HEADER (Compact) - Tetap z-20 */}
        <div className="text-center mb-5 relative z-20">
          <div className="inline-flex items-center justify-center p-3 bg-purple-600/80 text-white rounded-xl mb-2 shadow-xl shadow-purple-500/30">
            <UserPlusIcon size={28} className="h-7 w-7" /> 
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wider drop-shadow-lg">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-purple-200 mt-1">
            Daftarkan diri Anda dan mulai petualangan
          </p>
        </div>

        {/* FORMULIR (Sangat Rapat: space-y-3) - Tetap z-20 */}
        <form onSubmit={handleSubmit} className="space-y-3 relative z-20">
            
            {/* Input Nama Lengkap */}
            <div className="relative group">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400 group-focus-within:text-purple-300 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Nama Lengkap"
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-purple-400/50 text-white rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition duration-150 ease-in-out placeholder-gray-400 text-sm focus:bg-white/20"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                aria-label="Nama Lengkap"
              />
            </div>

            {/* Input Email */}
          <div className="relative group">
            <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400 group-focus-within:text-purple-300 transition-colors duration-200" />
            <input
              type="email"
              placeholder="Alamat Email"
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-purple-400/50 text-white rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition duration-150 ease-in-out placeholder-gray-400 text-sm focus:bg-white/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
            />
          </div>

          {/* Input Password */}
          <div className="relative group">
            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400 group-focus-within:text-purple-300 transition-colors duration-200" />
            <input
              type="password"
              placeholder="Kata Sandi"
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-purple-400/50 text-white rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition duration-150 ease-in-out placeholder-gray-400 text-sm focus:bg-white/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
            />
          </div>

            {/* Input Konfirmasi Password */}
          <div className="relative group">
            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400 group-focus-within:text-purple-300 transition-colors duration-200" />
            <input
              type="password"
              placeholder="Konfirmasi Kata Sandi"
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-purple-400/50 text-white rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition duration-150 ease-in-out placeholder-gray-400 text-sm focus:bg-white/20"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-label="Konfirmasi Password"
            />
          </div>
          
          <div className="flex justify-end text-sm pt-1">
            <label className="flex items-center text-purple-300 text-xs sm:text-sm">
                <input type="checkbox" className="mr-2 h-4 w-4 text-purple-500 bg-gray-800 border-purple-500 rounded focus:ring-purple-500" required />
                Saya setuju dengan S&K
            </label>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/40 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 transition duration-300 ease-in-out transform hover:scale-[1.02]"
          >
            <UserPlusIcon className="mr-2 h-5 w-5" />
            Daftar Sekarang
          </button>
        </form>

        {/* Link Login - **Pastikan z-indexnya tinggi atau sama dengan konten lainnya** */}
        {/* Tambahkan `relative z-20` pada p/div pembungkus jika perlu. 
           Di sini kita tambahkan pada <p> untuk memastikan ia berada di atas lapisan glow.
        */}
        <p className="text-sm text-center mt-5 text-purple-300 **relative z-20**">
          Sudah punya akun?{" "}
          <Link 
            href="/auth/login" 
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition duration-150 ease-in-out flex items-center justify-center mt-2"
          >
              Kembali ke Login
          </Link>
        </p>
      </div>
      
      {/* Efek Latar Belakang (Statis) */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-color-dodge filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full mix-blend-color-dodge filter blur-3xl opacity-30"></div>
    </div>
  );
}