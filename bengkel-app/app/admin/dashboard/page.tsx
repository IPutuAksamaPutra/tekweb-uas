"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Package, 
  CalendarCheck, 
  Users, 
  DollarSign, 
  ArrowRight, 
  Loader2, 
  AlertTriangle,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { alertError } from "@/components/Alert";

/* ======================= TYPES ======================= */
interface Transaction {
    total: string | number;
    total_amount?: string | number;
    transaction_date?: string;
    updated_at?: string;
    created_at?: string;
}

interface Booking {
    start_time?: string; 
    booking_date?: string; 
}

/* ======================= HELPER ======================= */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [isMount, setIsMount] = useState(false);
    
    const [productCount, setProductCount] = useState(0);
    const [bookingCount, setBookingCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [incomeTotal, setIncomeTotal] = useState(0);
    
    const [monthlyRevenueData, setMonthlyRevenueData] = useState<number[]>([]);
    const [monthlyBookingData, setMonthlyBookingData] = useState<number[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API = process.env.NEXT_PUBLIC_API_URL || "https://tekweb-uas-production.up.railway.app/api";
    
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const LoadingPlaceholder = () => (
        <Loader2 size={16} className="animate-spin inline mr-1 text-[#FF6D1F]" />
    );

    const getMonthName = (monthIndex: number) => {
        const date = new Date(new Date().getFullYear(), monthIndex, 1);
        return date.toLocaleString('id-ID', { month: 'short' });
    };

    /* ================= FETCH DATA ================= */
    async function loadDashboard() {
        const token = getCookie("token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        try {
            const authHeader = { Authorization: `Bearer ${token}` };
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            const [productRes, bookingRes, userRes, cashierRes, ordersRes] = await Promise.all([
                fetch(`${API}/products`, { headers: authHeader }),
                fetch(`${API}/bookings`, { headers: authHeader }),
                fetch(`${API}/staff`, { headers: authHeader }),
                fetch(`${API}/cashier`, { headers: authHeader }),
                fetch(`${API}/admin/orders`, { headers: authHeader }),
            ]);
            
            // 1. Produk
            const productData = await productRes.json();
            setProductCount(productData?.products?.length ?? 0);

            // 2. Booking Aggregation
            const bookingData = await bookingRes.json();
            const bookingArray: Booking[] = bookingData?.bookings ?? bookingData?.data ?? [];
            setBookingCount(Array.isArray(bookingArray) ? bookingArray.length : 0);

            const monthlyBookingCounts: { [key: string]: number } = {};
            bookingArray.forEach((b) => {
                const dateString = b.start_time || b.booking_date; 
                if (!dateString) return;
                const date = new Date(dateString);
                if (date.getFullYear() === currentYear) {
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    monthlyBookingCounts[key] = (monthlyBookingCounts[key] || 0) + 1;
                }
            });
            
            const chartBData = [];
            for (let i = 5; i >= 0; i--) { 
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                chartBData.push(monthlyBookingCounts[key] || 0);
            }
            setMonthlyBookingData(chartBData);

            // 3. User Count
            const userData = await userRes.json();
            setUserCount(userData?.total_users ?? (Array.isArray(userData?.data) ? userData.data.length : 0));

            // 4. Income (POS + Orders)
            const cashierData = await cashierRes.json();
            const ordersData = await ordersRes.json();
            const posTransactions: Transaction[] = cashierData?.transactions ?? [];
            const orderPelunasan: Transaction[] = ordersData?.orders ?? ordersData?.data ?? [];
            
            const combined: Transaction[] = [
                ...posTransactions,
                ...orderPelunasan.map(o => ({
                    total: o.total_amount || o.total || 0,
                    transaction_date: o.updated_at || o.created_at || new Date().toISOString(),
                }))
            ];

            let totalIncome = 0;
            const monthlyRevenue: { [key: string]: number } = {};
            
            combined.forEach((t) => {
                const amount = parseFloat(String(t.total || t.total_amount || '0')); 
                if (isNaN(amount) || amount <= 0) return;

                totalIncome += amount;
                const date = new Date(t.transaction_date || t.updated_at || t.created_at || ""); 
                if (date.getFullYear() === currentYear) {
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + amount;
                }
            });
            
            setIncomeTotal(totalIncome);

            const chartRData = [];
            for (let i = 5; i >= 0; i--) { 
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                chartRData.push(monthlyRevenue[key] || 0);
            }
            setMonthlyRevenueData(chartRData);

        } catch (err) {
            setError("Gagal memuat data dashboard.");
            alertError("Terjadi kesalahan sinkronisasi data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setIsMount(true);
        loadDashboard();
    }, []);

    const maxRevenue = Math.max(...monthlyRevenueData, 1);
    const maxBooking = Math.max(...monthlyBookingData, 1);
    
    const chartLabels = useMemo(() => {
        const labels = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(getMonthName(d.getMonth()));
        }
        return labels;
    }, []);

    if (!isMount) return null;

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#234C6A] tracking-tighter uppercase">Dashboard Overview</h1>
                    <p className="text-gray-500 font-medium">Laporan statistik performa bengkel & marketplace.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                    <Activity className="text-green-500" size={18} />
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">Live System</span>
                </div>
            </header>

            {error && (
                <div className="p-4 bg-red-50 border-l-8 border-red-500 text-red-700 rounded-xl flex items-center gap-3 animate-pulse">
                    <AlertTriangle size={24} />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            {/* ================= STATS CARDS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={<Package size={30}/>} 
                  title="Produk" 
                  value={loading ? <LoadingPlaceholder /> : productCount} 
                  desc="Total di etalase" 
                />
                <StatCard 
                  icon={<CalendarCheck size={30}/>} 
                  title="Booking" 
                  value={loading ? <LoadingPlaceholder /> : bookingCount} 
                  desc="Jadwal servis" 
                />
                <StatCard 
                  icon={<Users size={30}/>} 
                  title="Staff" 
                  value={loading ? <LoadingPlaceholder /> : userCount} 
                  desc="Pengelola sistem" 
                />
                <StatCard 
                  icon={<DollarSign size={30}/>} 
                  title="Pendapatan" 
                  value={loading ? <LoadingPlaceholder /> : formatRupiah(incomeTotal)} 
                  desc="POS & Marketplace" 
                />
            </div>
            
            {/* ================= CHARTS ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-4xl shadow-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-8">
                        <TrendingUp className="text-green-500" />
                        <h3 className="font-black text-xl text-[#234C6A] uppercase tracking-tighter">Tren Pendapatan</h3>
                    </div>
                    <BarChartComponent 
                        data={monthlyRevenueData} 
                        maxVal={maxRevenue} 
                        color="bg-green-500" 
                        isRupiah={true} 
                        labels={chartLabels} 
                        formatRupiah={formatRupiah}
                    />
                </div>

                <div className="bg-white p-8 rounded-4xl shadow-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-8">
                        <Activity className="text-orange-500" />
                        <h3 className="font-black text-xl text-[#234C6A] uppercase tracking-tighter">Volume Booking</h3>
                    </div>
                    <BarChartComponent 
                        data={monthlyBookingData} 
                        maxVal={maxBooking} 
                        color="bg-[#FF6D1F]" 
                        isRupiah={false} 
                        labels={chartLabels} 
                        formatRupiah={formatRupiah}
                    />
                </div>
            </div>

            {/* ================= QUICK LINKS ================= */}
            <div className="space-y-4">
                <h2 className="text-2xl font-black text-[#234C6A] uppercase tracking-tighter">Manajemen Cepat</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickLink 
                        href="/admin/produk" 
                        title="Produk" 
                        color="bg-[#234C6A]" 
                    />
                    <QuickLink 
                        href="/admin/bookingAdmin" 
                        title="Booking" 
                        color="bg-[#FF6D1F]" 
                    />
                    <QuickLink 
                        href="/admin/transaksi" 
                        title="Transaksi" 
                        color="bg-green-600" 
                    />
                </div>
            </div>
        </div>
    );
}

/* ================= SUB-COMPONENTS ================= */

function StatCard({ icon, title, value, desc }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-8 border-[#FF6D1F] hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-xl text-[#234C6A]">
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
                    <h3 className="text-xl font-black text-slate-800 leading-tight">{value}</h3>
                    <p className="text-[10px] text-gray-400 font-bold">{desc}</p>
                </div>
            </div>
        </div>
    );
}

function BarChartComponent({ data, maxVal, color, isRupiah, labels, formatRupiah }: any) {
    return (
        <div className="w-full h-64 flex items-end gap-2 md:gap-4 pt-4">
            {data.map((val: number, i: number) => {
                const height = (val / maxVal) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                        <div 
                          className={`${color} w-full rounded-t-xl transition-all duration-500 relative group-hover:brightness-110`} 
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                                {isRupiah ? formatRupiah(val) : val}
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 mt-3 uppercase">{labels[i]}</span>
                    </div>
                );
            })}
        </div>
    );
}

function QuickLink({ href, title, color }: any) {
    return (
        <Link href={href} className={`${color} group p-6 rounded-2xl shadow-lg flex justify-between items-center transition-all hover:scale-[1.02] active:scale-95`}>
            <span className="text-white font-black uppercase tracking-widest text-lg">Kelola {title}</span>
            <div className="bg-white/20 p-2 rounded-full group-hover:translate-x-2 transition-transform">
                <ArrowRight className="text-white" />
            </div>
        </Link>
    );
}