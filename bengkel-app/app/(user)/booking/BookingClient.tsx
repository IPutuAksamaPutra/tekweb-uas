"use client";

import { useState, useEffect, useRef } from "react";
import { alertSuccess, alertError } from "@/components/Alert";
import { Wrench, Phone, ClipboardList, Info } from "lucide-react";

interface User {
  token: string;
}

export default function BookingPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMount, setIsMount] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // ===== HELPER AMBIL COOKIE =====
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  useEffect(() => {
    setIsMount(true);
    const token = getCookie("token");
    if (token) setUser({ token });
  }, []);

  const BASE_INPUT_CLASSES =
    "w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-150 focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] text-gray-800 bg-white shadow-sm";

  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user?.token) {
      alertError("Silakan login terlebih dahulu.");
      return;
    }

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
      // 🔥 BASE URL TANPA /api
      const BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://tekweb-uas-production.up.railway.app";

      const res = await fetch(`${BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        alertError("Sesi habis, silakan login ulang.");
        return;
      }

      if (!res.ok) {
        alertError(data?.message || "Terjadi kesalahan pada booking.");
        return;
      }

      alertSuccess(
        "Booking berhasil! Admin kami akan menghubungi Anda via WhatsApp."
      );
      formRef.current?.reset();
    } catch (err) {
      console.error("Booking error:", err);
      alertError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

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
            Hindari antrean panjang! Jadwalkan perawatan motor Anda sekarang.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* FORM */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-[#FF6D1F]">
            <div className="flex items-center gap-3 mb-8">
              <ClipboardList className="text-[#234C6A]" />
              <h2 className="text-2xl font-bold text-[#234C6A]">
                Detail Kendaraan & Jadwal
              </h2>
            </div>

            <form ref={formRef} onSubmit={handleBooking} className="grid gap-6">
              <input
                name="nama_kendaraan"
                required
                placeholder="Nama Kendaraan"
                className={BASE_INPUT_CLASSES}
              />

              <select
                name="jenis_kendaraan"
                required
                className={BASE_INPUT_CLASSES}
              >
                <option value="">Pilih Jenis</option>
                <option value="Matic">Matic</option>
                <option value="Manual">Manual</option>
                <option value="Sport">Sport</option>
              </select>

              <input
                type="date"
                name="booking_date"
                required
                min={new Date().toISOString().split("T")[0]}
                className={BASE_INPUT_CLASSES}
              />

              <select
                name="jenis_service"
                required
                className={BASE_INPUT_CLASSES}
              >
                <option value="">Pilih Servis</option>
                <option value="Service Ringan">Service Ringan</option>
                <option value="Service Berat">Service Berat</option>
                <option value="Ganti Oli">Ganti Oli</option>
              </select>

              <input
                name="no_wa"
                required
                placeholder="No WhatsApp"
                className={BASE_INPUT_CLASSES}
              />

              <textarea
                name="notes"
                placeholder="Catatan (opsional)"
                className={BASE_INPUT_CLASSES}
              />

              <button
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#FF6D1F] text-white font-black"
              >
                {loading ? "Mengirim..." : "Konfirmasi Booking"}
              </button>
            </form>
          </div>

          {/* INFO */}
          <div className="bg-[#234C6A] text-white p-8 rounded-3xl">
            <h2 className="text-xl font-bold flex gap-2 mb-4">
              <Info /> Kenapa Booking Online?
            </h2>
            <p className="text-sm">
              Booking lebih cepat, tercatat, dan diprioritaskan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
