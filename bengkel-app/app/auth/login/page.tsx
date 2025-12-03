"use client";



import { useState, useRef, useEffect } from "react";

import Link from "next/link";



// Definisikan tipe Props khusus untuk ikon (termasuk 'size')

interface IconProps extends React.SVGProps<SVGSVGElement> {

    size?: number | string;

}



// ----------------------------------------------------

// KOMPONEN SVG INLINE (Ikon Dasar)

// Menggunakan ikon yang sama dengan halaman Register

// ----------------------------------------------------



const MailIcon = ({ size = 24, ...props }: IconProps) => (

  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"/></svg>

);



const LockIcon = ({ size = 24, ...props }: IconProps) => (

  <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>

);



// Ikon untuk tombol/header Login

const LogInIcon = ({ size = 24, ...props }: IconProps) => (

    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>

);



// ----------------------------------------------------





export default function LoginPage() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

 

  // Hooks untuk Efek Tilt (Pergerakan Kursor)

  const cardRef = useRef<HTMLDivElement>(null);

  const [transformStyle, setTransformStyle] = useState({});



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    console.log("LOGIN DATA:", { email, password });

    // Logika Login akan ditambahkan di sini

  };



  // Logika Efek Tilt / Parallax (Disalin dari RegisterPage)

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



        {/* Kartu Login Utama (Target Tilt Effect) */}

      <div

            ref={cardRef}

            style={transformStyle}

            className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-purple-500/50 p-7 sm:p-8 rounded-3xl shadow-[0_0_60px_-15px_rgba(168,85,247,0.5)] transition-all duration-300 relative z-10 hover:shadow-[0_0_80px_-15px_rgba(168,85,247,0.8)]"

        >

       

        {/* Efek Glow di dalam Kartu (Warna ungu) */}

        <div className="absolute inset-0 rounded-3xl bg-purple-500 opacity-10 blur-2xl transition-opacity duration-500 z-10"></div>



        {/* HEADER (Compact) - Tetap z-20 */}

        <div className="text-center mb-5 relative z-20">

          <div className="inline-flex items-center justify-center p-3 bg-purple-600/80 text-white rounded-xl mb-2 shadow-xl shadow-purple-500/30">

            <LogInIcon size={28} className="h-7 w-7" />

          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-wider drop-shadow-lg">

            Selamat Datang Kembali

          </h1>

          <p className="text-sm text-purple-200 mt-1">

            Masuk untuk melanjutkan petualangan Anda

          </p>

        </div>



        {/* FORMULIR (Sangat Rapat: space-y-3) - Tetap z-20 */}

        <form onSubmit={handleSubmit} className="space-y-3 relative z-20">

           

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

         

          <div className="flex justify-end text-sm pt-1">

            <Link

                href="/auth/forgot-password"

                className="font-medium text-purple-300 hover:text-purple-200 transition duration-150 text-xs sm:text-sm"

            >

                Lupa Kata Sandi?

            </Link>

          </div>



          <button

            type="submit"

            className="w-full flex justify-center items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/40 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 transition duration-300 ease-in-out transform hover:scale-[1.02]"

          >

            <LogInIcon className="mr-2 h-5 w-5" />

            Masuk

          </button>

        </form>



        {/* Link Register */}

        <p className="text-sm text-center mt-5 text-purple-300 relative z-20">

          Belum punya akun?{" "}

          <Link

            href="/auth/register"

            className="font-semibold text-indigo-400 hover:text-indigo-300 transition duration-150 ease-in-out flex items-center justify-center mt-2"

          >

              Buat Akun Baru

          </Link>

        </p>

      </div>

     

      {/* Efek Latar Belakang (Statis) */}

      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-color-dodge filter blur-3xl opacity-30"></div>

      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full mix-blend-color-dodge filter blur-3xl opacity-30"></div>

    </div>

  );

} 