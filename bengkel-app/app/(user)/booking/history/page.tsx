"use client";

import { useState, useEffect } from "react";
// Import ikon yang digunakan dari Lucide-React
import { CheckCircle, Clock, Wrench, Calendar, Tag, Car, Phone, BookOpen, User } from "lucide-react";

interface Booking {
  id: number;
  name: string;
  vehicle: string;
  service_type: string;
  booking_date: string;
  phone: string;
  notes: string | null;
  status: "Pending" | "Diterima" | "Selesai";
}

// ==========================================================
// KOMPONEN UTAMA RIWAYAT BOOKING
// ==========================================================
export default function RiwayatBooking() {
  // DATA DUMMY (sama seperti sebelumnya)
  const dummyData: Booking[] = [
    {
      id: 1,
      name: "Rian Pradana",
      vehicle: "Honda Beat (Matic)",
      service_type: "Servis Ringan",
      booking_date: "2025-01-03T09:30",
      phone: "081234567890",
      notes: "Mohon dicek bagian CVT ada suara berdecit saat akselerasi awal.",
      status: "Pending",
    },
    {
      id: 2,
      name: "Made Anton",
      vehicle: "Yamaha NMAX",
      service_type: "Ganti Oli",
      booking_date: "2025-01-02T14:00",
      phone: "081987654321",
      notes: null,
      status: "Diterima",
    },
    {
      id: 3,
      name: "Putri Ayu",
      vehicle: "Vario 125",
      service_type: "Tune Up",
      booking_date: "2025-01-01T10:00",
      phone: "085765421000",
      notes: "Tenaga motor terasa kurang saat gas awal dan RPM tinggi.",
      status: "Selesai",
    },
  ];

  const [riwayat, setRiwayat] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // simulasi loading data
    setTimeout(() => {
      setRiwayat(dummyData);
      setLoading(false);
    }, 800);
  }, []);

// ==========================================================
// FUNGSI UTILITY
// ==========================================================

  // Fungsi untuk mendapatkan style badge status
  function statusBadge(status: Booking["status"]) {
    let classes = "px-3 py-1 rounded-full text-sm font-bold tracking-wider";
    switch (status) {
      case "Pending":
        return (
          <span className={`${classes} bg-yellow-100 text-yellow-800 border border-yellow-300`}>
            {status}
          </span>
        );
      case "Diterima":
        return (
          <span className={`${classes} bg-blue-100 text-blue-800 border border-blue-300`}>
            {status}
          </span>
        );
      case "Selesai":
        return (
          <span className={`${classes} bg-green-100 text-green-800 border border-green-300`}>
            {status}
          </span>
        );
    }
  }

  // Fungsi untuk mendapatkan warna border status
  function statusBorder(status: Booking["status"]) {
    switch (status) {
      case "Pending":
        return "border-l-4 border-yellow-500";
      case "Diterima":
        return "border-l-4 border-blue-500";
      case "Selesai":
        return "border-l-4 border-green-500";
    }
  }

  // Fungsi untuk mendapatkan ikon status
  function statusIcon(status: Booking["status"]) {
    const defaultClasses = "text-xl";
    switch (status) {
      case "Pending":
        return <Clock className="text-yellow-600" size={24} />;
      case "Diterima":
        return <Wrench className="text-blue-600" size={24} />;
      case "Selesai":
        return <CheckCircle className="text-green-600" size={24} />;
    }
  }

  // Fungsi untuk format tanggal
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

// ==========================================================
// RENDER KOMPONEN
// ==========================================================

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="flex items-center text-[#234C6A] text-lg font-medium">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#FF6D1F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memuat riwayat booking...
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="text-4xl font-extrabold text-[#234C6A] mb-10 text-center">
          Daftar Riwayat Servis 🗓️
        </h1>

        <div className="space-y-6">
          {riwayat.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-xl shadow-md border border-gray-200">
                <p className="text-gray-500 text-lg">Belum ada riwayat booking yang tercatat.</p>
            </div>
          ) : (
            riwayat.map((item) => (
              <div
                key={item.id}
                className={`
                  bg-white rounded-xl shadow-lg
                  p-6 transition-all duration-300 transform hover:scale-[1.005] hover:shadow-xl
                  ${statusBorder(item.status)}
                `}
              >
                {/* === HEADER KARTU (NAMA & STATUS) === */}
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div className="flex items-center gap-4">
                    {statusIcon(item.status)}
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <User className="w-5 h-5 mr-2 text-gray-600" /> {item.name}
                    </h2>
                  </div>

                  {statusBadge(item.status)}
                </div>

                {/* === DETAIL BOOKING === */}
                <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-base">
                    
                    {/* Kendaraan */}
                    <div className="flex items-center">
                        <Car className="text-gray-400 mr-3 w-5 h-5" />
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Kendaraan</p>
                            <p className="font-semibold text-gray-700">{item.vehicle}</p>
                        </div>
                    </div>

                    {/* Jenis Servis */}
                    <div className="flex items-center">
                        <Tag className="text-gray-400 mr-3 w-5 h-5" />
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Jenis Servis</p>
                            <p className="font-semibold text-gray-700">{item.service_type}</p>
                        </div>
                    </div>

                    {/* Tanggal Booking */}
                    <div className="flex items-center">
                        <Calendar className="text-gray-400 mr-3 w-5 h-5" />
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Waktu Booking</p>
                            <p className="font-semibold text-gray-700">{formatDate(item.booking_date)}</p>
                        </div>
                    </div>

                    {/* Nomor WA */}
                    <div className="flex items-center">
                        <Phone className="text-gray-400 mr-3 w-5 h-5" />
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Kontak WA</p>
                            <p className="font-semibold text-gray-700">{item.phone}</p>
                        </div>
                    </div>
                </div>

                {/* === CATATAN (NOTES) === */}
                {item.notes && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm font-medium text-[#234C6A] mb-2">
                        <BookOpen className="w-4 h-4 mr-2" /> Catatan Tambahan:
                    </div>
                    <p className="text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {item.notes}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}