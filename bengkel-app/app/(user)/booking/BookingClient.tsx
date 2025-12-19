"use client";

import { useState, useEffect, useRef } from "react";
import { alertSuccess, alertError } from "@/components/Alert";
import { Wrench, Calendar, Phone, ClipboardList, Info } from "lucide-react";

interface User {
  token: string;
}

export default function BookingPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMount, setIsMount] = useState(false); // 🔥 Penting untuk Next.js

  const formRef = useRef<HTMLFormElement>(null);

  // 1. Helper baca cookie yang aman untuk SSR
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  // 2. Ambil token setelah komponen nempel di browser (Mounting)
  useEffect(() => {
    setIsMount(true);
    const cookieToken = getCookie("token");
    if (cookieToken) {
      setUser({ token: cookieToken });
    }
  }, []);

  const BASE_INPUT_CLASSES =
    "w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-150 focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] text-gray-800 bg-white shadow-sm";

  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user?.token) return alertError("Silakan login terlebih dahulu.");

    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      jenis_kendaraan: form.get("jenis_kendaraan"),
      nama_kendaraan: form.get("nama_kendaraan"),
      booking_date: form.get("booking_date"),
      jenis_service: form.get("jenis_service"),
      no_wa: form.get("no_wa"),
      notes: form.get("notes") || "-",
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

      const res = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) return alertError("Sesi habis, silakan login ulang.");

      if (!res.ok) {
        alertError(data?.message || "Terjadi kesalahan pada data booking.");
        return;
      }

      alertSuccess("Booking berhasil! Admin kami akan menghubungi Anda melalui WhatsApp.");
      formRef.current?.reset(); 

    } catch (err) {
      console.error("Booking error:", err);
      alertError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  // Cegah render di server untuk menghindari mismatch UI
  if (!isMount) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#234C6A] flex items-center justify-center gap-3">
            <Wrench className="text-[#FF6D1F]" size={40} />
            Booking Servis
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Hindari antrean panjang! Jadwalkan perawatan motor Anda sekarang dan biarkan teknisi ahli kami bekerja.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* ================= FORM BOOKING ================= */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-[#FF6D1F]">
            <div className="flex items-center gap-3 mb-8">
              <ClipboardList className="text-[#234C6A]" />
              <h2 className="text-2xl font-bold text-[#234C6A]">Detail Kendaraan & Jadwal</h2>
            </div>

            <form ref={formRef} onSubmit={handleBooking} className="grid gap-6">
              
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Nama Kendaraan</label>
                <input
                  name="nama_kendaraan" type="text" required
                  placeholder="Contoh: Honda Vario 160"
                  className={BASE_INPUT_CLASSES}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Jenis Kendaraan</label>
                  <select name="jenis_kendaraan" required className={BASE_INPUT_CLASSES}>
                    <option value="">Pilih...</option>
                    <option value="Matic">🛵 Matic</option>
                    <option value="Manual">⚙ Manual / Bebek</option>
                    <option value="Sport">🏍 Sport</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Tanggal Booking</label>
                  <input
                    name="booking_date" type="date" required
                    className={BASE_INPUT_CLASSES}
                    min={new Date().toISOString().split("T")[0]} // 🔥 Tidak bisa pilih tanggal lampau
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Pilih Jenis Servis</label>
                <select name="jenis_service" required className={BASE_INPUT_CLASSES}>
                  <option value="">Pilih Layanan...</option>
                  <option value="Service Ringan">🔧 Servis Ringan (Pengecekan Rutin)</option>
                  <option value="Service Berat">🔩 Servis Berat (Turun Mesin/Cvt)</option>
                  <option value="Ganti Oli">💧 Ganti Oli Saja</option>
                  <option value="Perbaikan Rem">🛑 Sistem Pengereman</option>
                  <option value="Tune Up">⚡ Tune Up Performa</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Nomor WhatsApp Aktif</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-bold">+62</span>
                  <input
                    name="no_wa" type="tel" required
                    placeholder="85857336765"
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Keluhan / Catatan (Opsional)</label>
                <textarea
                  name="notes" rows={3} 
                  placeholder="Jelaskan masalah motor Anda di sini..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] text-gray-800"
                />
              </div>

              <button
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-black text-lg uppercase tracking-widest bg-[#FF6D1F] hover:bg-[#E05B1B] shadow-lg shadow-[#FF6D1F]/30 transition duration-300 active:scale-95 disabled:bg-gray-400"
              >
                {loading ? "Menghubungkan ke Server..." : "Konfirmasi Booking"}
              </button>
            </form>
          </div>

          {/* ================= INFO LAYANAN ================= */}
          <div className="space-y-6">
            <div className="bg-[#234C6A] text-white p-8 rounded-3xl shadow-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Info className="text-[#FF6D1F]" /> Kenapa Booking Online?
              </h2>
              <div className="space-y-4">
                {[
                  { t: "Prioritas Layanan", d: "User booking akan dilayani tepat waktu sesuai jadwal." },
                  { t: "Riwayat Servis", d: "Setiap servis tercatat rapi di akun Anda." },
                  { t: "Konsultasi Gratis", d: "Bisa tanya-tanya keluhan sebelum datang ke bengkel." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="bg-[#FF6D1F] text-white p-2 rounded-lg font-bold">{i+1}</div>
                    <div>
                      <h4 className="font-bold">{item.t}</h4>
                      <p className="text-sm text-gray-300">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-[#FF6D1F]/20 p-6 rounded-3xl">
               <h4 className="font-bold text-[#234C6A] mb-2 flex items-center gap-2">
                 <Phone size={18} /> Butuh Bantuan Cepat?
               </h4>
               <p className="text-sm text-gray-600 mb-4">Jika Anda mengalami kendala darurat di jalan, hubungi layanan darurat kami.</p>
               <a href="https://wa.me/628587336765" className="text-[#FF6D1F] font-bold hover:underline italic">
                 Hubungi WhatsApp Center &rarr;
               </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}