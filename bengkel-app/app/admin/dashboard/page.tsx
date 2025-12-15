"use client";

import { useEffect, useState, useMemo } from "react";
import { Package, CalendarCheck, Users, DollarSign, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

// --- Utility: Ambil token dari cookie ---
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// --- Interface untuk membantu TypeScript memahami struktur data ---
interface CashierTransaction {
    total: string;
    transaction_date: string; // YYYY-MM-DD HH:MM:SS
}

interface Booking {
    // Asumsi ini adalah field tanggal yang akan digunakan
    start_time?: string; 
    booking_date?: string; 
}


export default function AdminDashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  
  // STATE BARU UNTUK GRAFIK
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<number[]>([]);
  const [monthlyBookingData, setMonthlyBookingData] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = "http://localhost:8000/api";
  const token = useMemo(() => getCookie("token"), []);

  // --- Utility: Format Rupiah ---
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // --- Helper Component untuk tampilan loading ---
  const LoadingPlaceholder = () => (
    <Loader2 size={20} className="animate-spin inline mr-1 text-[#FF6D1F]" />
  );

  // --- Helper: Mendapatkan Nama Bulan ---
  const getMonthName = (monthIndex: number) => {
    const date = new Date(new Date().getFullYear(), monthIndex, 1);
    return date.toLocaleString('id-ID', { month: 'short' });
  };
  
  // ================= FETCH DATA & AGGREGASI PARALLEL =================
  async function loadDashboard() {
    if (!token) {
      alertError("Token otorisasi tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }

    try {
      const authHeader = { Authorization: `Bearer ${token}` };
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-11
      
      // Menjalankan semua fetch secara paralel
      const [productRes, bookingRes, userRes, cashierRes] = await Promise.all([
        fetch(`${API}/products`, { headers: authHeader }),
        fetch(`${API}/bookings`, { headers: authHeader }),
        fetch(`${API}/staff`, { headers: authHeader }),
        fetch(`${API}/cashier`, { headers: authHeader }),
      ]);
      
      // --- 1. Produk ---
      const productData = await productRes.json();
      setProductCount(productData?.products?.length ?? 0);

      // --- 2. Booking (Agregasi) ---
      const bookingData = await bookingRes.json();
      const bookingArray: Booking[] = bookingData?.bookings ?? bookingData?.data ?? [];
      setBookingCount(Array.isArray(bookingArray) ? bookingArray.length : 0);

      const monthlyBookingCounts: { [key: string]: number } = {};
      bookingArray.forEach((b) => {
        // Ambil tanggal dari field yang ada (prioritas start_time)
        const dateString = b.start_time || b.booking_date; 
        if (!dateString) return;

        const date = new Date(dateString);
        
        // Filter untuk 6 bulan terakhir
        if (date.getFullYear() === currentYear) {
            const monthDiff = currentMonth - date.getMonth();
            if (monthDiff >= 0 && monthDiff <= 5) {
               const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
               monthlyBookingCounts[key] = (monthlyBookingCounts[key] || 0) + 1;
            }
        }
      });
      
      const chartBookingData = [];
      for (let i = 5; i >= 0; i--) { // Hitung dari 5 bulan lalu hingga bulan ini (6 bulan total)
          const monthIndex = currentMonth - i;
          const year = currentYear;
          const month = (monthIndex % 12 + 12) % 12; // Normalisasi bulan 0-11
          const key = `${year}-${String(month + 1).padStart(2, '0')}`;
          chartBookingData.push(monthlyBookingCounts[key] || 0);
      }
      setMonthlyBookingData(chartBookingData);


      // --- 3. User (Staff List) ---
      const userData = await userRes.json();
      const userCountValue = userData?.total_users ?? (Array.isArray(userData?.data) ? userData.data.length : 0);
      setUserCount(userCountValue);

      // --- 4. Income (Agregasi) ---
      const cashierData = await cashierRes.json();
      const transaksi: CashierTransaction[] = cashierData?.transactions ?? [];

      let totalIncome = 0;
      const monthlyRevenue: { [key: string]: number } = {};
      
      transaksi.forEach((t) => {
        const amount = parseFloat(t.total ?? 0);
        totalIncome += amount;

        const date = new Date(t.transaction_date);

        // Filter untuk 6 bulan terakhir
        if (date.getFullYear() === currentYear) {
            const monthDiff = currentMonth - date.getMonth();
            if (monthDiff >= 0 && monthDiff <= 5) {
               const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
               monthlyRevenue[key] = (monthlyRevenue[key] || 0) + amount;
            }
        }
      });
      
      setIncomeTotal(totalIncome);

      const chartRevenueData = [];
      for (let i = 5; i >= 0; i--) { // Hitung dari 5 bulan lalu hingga bulan ini (6 bulan total)
          const monthIndex = currentMonth - i;
          const year = currentYear;
          const month = (monthIndex % 12 + 12) % 12; // Normalisasi bulan 0-11
          const key = `${year}-${String(month + 1).padStart(2, '0')}`;
          chartRevenueData.push(monthlyRevenue[key] || 0);
      }
      setMonthlyRevenueData(chartRevenueData);

    } catch (err: any) {
      console.error("Dashboard load error:", err);
      alertError("Gagal memuat data dashboard. Pastikan API server berjalan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [token]);

  // Data dan perhitungan untuk rendering grafik
  const maxRevenue = Math.max(...monthlyRevenueData, 1);
  const maxBooking = Math.max(...monthlyBookingData, 1);
  
  // Menghasilkan label bulan untuk 6 bulan terakhir
  const chartLabels = useMemo(() => {
    const labels = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const monthIndex = new Date(now.getFullYear(), now.getMonth() - i, 1).getMonth();
        labels.push(getMonthName(monthIndex));
    }
    return labels;
  }, []);


  // --- Helper Component untuk Bar Chart ---
  const BarChart = ({ data, maxVal, title, color, isRupiah, labels }: { data: number[], maxVal: number, title: string, color: string, isRupiah: boolean, labels: string[] }) => (
    <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-bold text-lg text-[#234C6A] mb-4">{title}</h3>
        <div className="w-full h-48 flex items-end gap-3 pt-6 relative">
            {/* Sumbu Y (Max Value) */}
            <div className="absolute -top-1 left-0 text-xs text-gray-500">
                {isRupiah ? formatRupiah(maxVal) : maxVal}
            </div>

            {data.map((val, i) => {
                const heightPercentage = (val / maxVal) * 90; // Scaling bar agar tidak menyentuh batas atas
                return (
                    <div key={i} className="flex flex-col items-center w-full max-w-[50px] h-full justify-end">
                        <div className={`${color} w-8 rounded-t-lg relative group transition-all duration-300`} style={{ height: `${heightPercentage}%` }}>
                            {/* Tooltip */}
                            <span className="absolute -top-7 text-xs bg-gray-700 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {isRupiah ? formatRupiah(val) : val}
                            </span>
                        </div>
                        <span className="text-xs text-gray-600 mt-1">{labels[i]}</span>
                    </div>
                );
            })}
        </div>
        <p className="text-gray-500 text-sm mt-4">*Data 6 Bulan Terakhir.</p>
    </div>
  );


  return (
    <div className="p-8 space-y-8">
      
      <h1 className="text-3xl font-bold text-[#234C6A]">Dashboard Admin</h1>
      <p className="text-gray-600">Selamat datang kembali! Berikut ringkasan aktivitas sistem.</p>

      {/* Tampilan Notifikasi Error */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
        </div>
      )}

      {/* ================= STATS CARD ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Produk */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex items-center gap-4 border-l-4 border-[#FF6D1F]">
          <Package size={40} className="text-[#234C6A]" />
          <div>
            <h3 className="font-bold text-lg">
              {loading ? <LoadingPlaceholder /> : productCount} Produk
            </h3>
            <p className="text-gray-500 text-sm">Tersedia di marketplace</p>
          </div>
        </div>

        {/* Card 2: Booking */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex items-center gap-4 border-l-4 border-[#FF6D1F]">
          <CalendarCheck size={40} className="text-[#234C6A]" />
          <div>
            <h3 className="font-bold text-lg">
              {loading ? <LoadingPlaceholder /> : bookingCount} Booking
            </h3>
            <p className="text-gray-500 text-sm">Belum diproses</p>
          </div>
        </div>

        {/* Card 3: Staff */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex items-center gap-4 border-l-4 border-[#FF6D1F]">
          <Users size={40} className="text-[#234C6A]" />
          <div>
            <h3 className="font-bold text-lg">
              {loading ? <LoadingPlaceholder /> : userCount} Staff
            </h3>
            <p className="text-gray-500 text-sm">Terdaftar dalam sistem</p>
          </div>
        </div>

        {/* Card 4: Pendapatan */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex items-center gap-4 border-l-4 border-[#FF6D1F]">
          <DollarSign size={40} className="text-[#234C6A]" />
          <div>
            <h3 className="font-bold text-lg">
              {loading ? <LoadingPlaceholder /> : formatRupiah(incomeTotal)}
            </h3>
            <p className="text-gray-500 text-sm">Pendapatan total</p>
          </div>
        </div>
      </div>
      
      {/* ================= CHART AREA ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CHART 1: PENDAPATAN */}
        <BarChart 
            title="Pendapatan Bulanan"
            data={monthlyRevenueData}
            maxVal={maxRevenue}
            color="bg-green-600"
            isRupiah={true}
            labels={chartLabels}
        />

        {/* CHART 2: BOOKING */}
        <BarChart 
            title="Jumlah Booking Bulanan"
            data={monthlyBookingData}
            maxVal={maxBooking}
            color="bg-[#FF6D1F]"
            isRupiah={false}
            labels={chartLabels}
        />

      </div>

      {/* ================= SHORTCUT MENU ================= */}
      <div>
        <h2 className="text-xl font-bold text-[#234C6A] mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/produk" className="bg-[#234C6A] hover:bg-[#1a3a52] text-white p-6 rounded-xl shadow flex justify-between items-center transition">
            Kelola Produk <ArrowRight />
          </Link>
          <Link href="/admin/bookingAdmin" className="bg-[#FF6D1F] hover:bg-orange-600 text-white p-6 rounded-xl shadow flex justify-between items-center transition">
            Lihat Booking <ArrowRight />
          </Link>
          <Link href="/admin/kasir/transaksi" className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow flex justify-between items-center transition">
            Riwayat Transaksi <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}