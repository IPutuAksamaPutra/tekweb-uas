"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

export default function RegisterPage() {
  const router = useRouter();
  const [isMount, setIsMount] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsMount(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg("Password dan konfirmasi tidak sama!");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("https://tekweb-uas-production.up.railway.app/api/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorDetail = data.errors 
          ? Object.values(data.errors).flat().join(", ") 
          : data.message;
          
        alertError(errorDetail || "Registrasi gagal!");
        setLoading(false);
        return;
      }

      // 🔥 LOGIKA BARU: Beritahu user untuk cek email (Mailtrap)
      alertSuccess("Registrasi Berhasil! Silakan cek email");
      
      // Kita arahkan ke login dengan membawa parameter email agar user tidak perlu ketik ulang
      router.push(`/auth/login?registered=true&email=${email}`);
      
    } catch (err) {
      alertError("Gagal terhubung ke server!");
      console.error("Register Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isMount) return null;

  return (
    <div className="min-h-screen flex justify-center items-center bg-linear-to-br from-[#234C6A] to-[#102532] p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 transform transition duration-500 hover:scale-[1.01]">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-orange-50 text-[#FF6D1F] rounded-2xl mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black text-[#234C6A] tracking-tighter uppercase">Buat Akun</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Satu langkah lagi menuju layanan terbaik</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 mb-6 rounded-xl text-xs font-bold text-center border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField 
            icon={<User size={18}/>} 
            placeholder="Nama Lengkap" 
            value={fullName} 
            setValue={setFullName}
          />

          <InputField 
            icon={<Mail size={18}/>} 
            placeholder="Alamat Email" 
            type="email" 
            value={email} 
            setValue={setEmail}
          />

          {/* Password Fields (Sama seperti kode asli Anda) */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18}/>
            </span>
            <input
              type={showPass1 ? "text" : "password"}
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-gray-700 font-bold focus:ring-2 focus:ring-[#FF6D1F] outline-none transition"
            />
            <button type="button" onClick={() => setShowPass1(!showPass1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6D1F]">
              {showPass1 ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18}/>
            </span>
            <input
              type={showPass2 ? "text" : "password"}
              placeholder="Ulangi Kata Sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-gray-700 font-bold focus:ring-2 focus:ring-[#FF6D1F] outline-none transition"
            />
            <button type="button" onClick={() => setShowPass2(!showPass2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6D1F]">
              {showPass2 ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-gray-300"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Daftar & Kirim Verifikasi"}
          </button>
        </form>

        <p className="text-center text-xs font-bold uppercase tracking-widest mt-8 text-gray-400">
          Sudah punya akun?
          <button onClick={() => router.push("/auth/login")} className="text-[#FF6D1F] hover:text-[#234C6A] ml-2 transition-colors">
            Masuk Disini
          </button>
        </p>
      </div>
    </div>
  );
}

const InputField = ({ icon, value, setValue, placeholder, type = "text" }: any) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-700 font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-[#FF6D1F] outline-none transition"
    />
  </div>
);