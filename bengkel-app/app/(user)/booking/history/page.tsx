"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, Wrench, Calendar, Tag, Car, Phone, BookOpen, User as UserIcon } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

// === Interface ===
interface Booking {
  id: number;
  jenis_kendaraan: string;
  nama_kendaraan: string;
  jenis_service: string;
  booking_date: string;
  no_wa: string;
  notes: string | null;
  status: "Pending" | "Diterima" | "Selesai";
  user_id: number;
}

export default function RiwayatBooking() {
  const [riwayat, setRiwayat] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMount, setIsMount] = useState(false); // Untuk cegah Hydration Error

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://tekweb-uas-production.up.railway.app/api";

  /* ================= HELPER: TOKEN ================= */
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  /* ================= DATA FETCHING ================= */
  useEffect(() => {
    setIsMount(true);

    async function fetchData() {
      const token = getCookie("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // 1. Get User Profile
        const userRes = await fetch(`${apiUrl}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();
        const uid = userData.id || userData.user?.id;

        if (!uid) throw new Error("User ID tidak ditemukan");

        // 2. Get All Bookings
        const bookingRes = await fetch(`${apiUrl}/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const bookingData = await bookingRes.json();

        const list = Array.isArray(bookingData) ? bookingData :
                     bookingData.bookings || bookingData.data || [];

        // 3. Filter by User Login
        const filtered = list.filter((b: Booking) => b.user_id === uid);
        
        setRiwayat(filtered.reverse()); // Reverse agar booking terbaru di atas
      } catch (err) {
        console.error(err);
        alertError("Gagal memuat data riwayat.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [apiUrl]);

  /* ================= UI Helpers ================= */
  const statusConfig = {
    Pending: {
      badge: "bg-yellow-100 text-yellow-700",
      border: "border-yellow-500",
      icon: <Clock size={18} />,
      iconBg: "bg-yellow-100 text-yellow-700"
    },
    Diterima: {
      badge: "bg-blue-100 text-blue-700",
      border: "border-blue-500",
      icon: <Wrench size={18} />,
      iconBg: "bg-blue-100 text-blue-700"
    },
    Selesai: {
      badge: "bg-green-100 text-green-700",
      border: "border-green-500",
      icon: <CheckCircle size={18} />,
      iconBg: "bg-green-100 text-green-700"
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  // Cegah Hydration Error
  if (!isMount) return null;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-[#FF6D1F]"></div>
        <p className="text-[#234C6A] font-bold animate-pulse">Memuat Riwayat Booking...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <header className="text-center mb-12">
          <h1 className="text-4xl font-black text-[#234C6A] mb-2">
            Riwayat Booking Anda 🗓️
          </h1>
          <p className="text-gray-500">Pantau status servis kendaraan Anda secara real-time</p>
        </header>

        {riwayat.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center shadow-sm border-2 border-dashed border-gray-200">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Belum Ada Riwayat</h3>
            <p className="text-gray-500 mt-2">Anda belum melakukan booking servis apapun.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {riwayat.map((item) => {
              const config = statusConfig[item.status] || statusConfig.Pending;
              return (
                <div
                  key={item.id}
                  className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border-l-8 ${config.border}`}
                >
                  {/* Header Card */}
                  <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-5 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`${config.iconBg} p-2.5 rounded-xl shadow-sm`}>
                        {config.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#234C6A] flex items-center gap-2">
                          {item.nama_kendaraan}
                        </h2>
                        <span className="text-xs font-mono text-gray-400">ID BOOKING: #{item.id}</span>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${config.badge}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Detail Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 text-gray-700">
                    <DetailItem icon={<Car size={18} />} title="Jenis Kendaraan" value={item.jenis_kendaraan} />
                    <DetailItem icon={<Tag size={18} />} title="Jenis Servis" value={item.jenis_service} />
                    <DetailItem icon={<Calendar size={18} />} title="Waktu Servis" value={formatDate(item.booking_date)} />
                    <DetailItem icon={<Phone size={18} />} title="No. WhatsApp" value={item.no_wa} />
                  </div>

                  {/* Notes Section */}
                  {item.notes && (
                    <div className="mt-6 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                      <p className="text-xs font-bold text-blue-600 uppercase flex items-center gap-2 mb-1">
                        <BookOpen size={14} /> Catatan Tambahan
                      </p>
                      <p className="text-gray-700 text-sm italic">"{item.notes}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENT: DETAIL ITEM ================= */
function DetailItem({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-orange-50 text-[#FF6D1F]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tight leading-none mb-1">{title}</p>
        <p className="font-semibold text-gray-800 wrap-break-word">{value}</p>
      </div>
    </div>
  );
}