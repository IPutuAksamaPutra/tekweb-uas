"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Sedang memverifikasi email Anda...");

  useEffect(() => {
    const verifyEmail = async () => {
      // Ambil token verifikasi dari URL yang dikirim Laravel via Mailtrap
      const id = searchParams.get("id");
      const hash = searchParams.get("hash");
      const expires = searchParams.get("expires");
      const signature = searchParams.get("signature");

      if (!id || !hash || !signature) {
        setStatus("error");
        setMessage("Link verifikasi tidak valid.");
        return;
      }

      try {
        // Panggil API Laravel yang sudah kita buat di routes/api.php
        const response = await fetch(
          `http://localhost:8000/api/verify-email/${id}/${hash}?expires=${expires}&signature=${signature}`,
          {
            method: "GET",
            headers: { "Accept": "application/json" },
          }
        );

        if (response.ok) {
          setStatus("success");
          setMessage("Email berhasil diverifikasi! Mengalihkan ke halaman login...");
          // Tunggu 3 detik lalu pindah ke login
          setTimeout(() => router.push("/auth/login?verified=true"), 3000);
        } else {
          setStatus("error");
          setMessage("Verifikasi gagal. Link mungkin sudah kadaluwarsa.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Terjadi kesalahan koneksi ke server.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#FF6D1F]" size={48} />
            <h2 className="text-xl font-bold text-[#234C6A]">{message}</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="text-green-500" size={60} />
            <h2 className="text-2xl font-bold text-[#234C6A]">Berhasil!</h2>
            <p className="text-gray-500">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="text-red-500" size={60} />
            <h2 className="text-2xl font-bold text-[#234C6A]">Gagal</h2>
            <p className="text-gray-500">{message}</p>
            <button 
              onClick={() => router.push("/auth/login")}
              className="mt-4 text-[#FF6D1F] font-bold hover:underline"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Komponen Utama dengan Suspense (Wajib untuk Build Next.js)
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}