"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  LogOut,
  Save,
  XCircle,
  ShieldCheck,
  ShoppingCart,
  ClipboardList,
  CalendarClock,
  User as UserIcon,
} from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

/* ===============================
   INTERFACES
================================ */
interface UserData {
  id?: number;
  name: string;
  email: string;
  role?: string;
}

interface QuickMenuProps {
  icon: React.ReactNode;
  label: string;
  color: "orange" | "blue" | "green";
  onClick: () => void;
}

interface ProfileInputProps {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}

/* ===============================
   MAIN COMPONENT
================================ */
export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [isMount, setIsMount] = useState(false);

  const getCookie = useCallback((name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }, []);

  useEffect(() => {
    setIsMount(true);
    const token = getCookie("token");
    const cookieUser = getCookie("user");

    const fetchUserProfile = async () => {
      if (!token) {
        setUser({ name: "Guest User", email: "Belum Login" });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("https://tekweb-uas-production.up.railway.app/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          const userData = data.user || data;
          setUser(userData);
          setFormData(userData);
        } else {
          throw new Error();
        }
      } catch (err) {
        if (cookieUser) {
          try {
            const parsed = JSON.parse(cookieUser);
            setUser(parsed);
            setFormData(parsed);
          } catch (e) {
            setUser({ name: "Guest User", email: "Belum Login" });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [getCookie]);

  const handleSave = async () => {
    const token = getCookie("token");
    if (!token) return alertError("Sesi telah habis.");

    try {
      setUser(formData);
      document.cookie = `user=${JSON.stringify(formData)}; path=/; max-age=3600`;
      alertSuccess("Profil berhasil diperbarui!");
      setEditing(false);
    } catch (err) {
      alertError("Gagal memperbarui profil.");
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    alertSuccess("Logout berhasil!").then(() => {
      router.push("/auth/login");
    });
  };

  if (!isMount) return null;

  if (loading)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6D1F] border-t-transparent"></div>
        <p className="text-[#234C6A] font-bold">Memuat Profil...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center py-6 md:py-12 px-4">
      {/* Container dibuat Max-Width dan Responsif */}
      <div className="w-full max-w-[550px] bg-white rounded-4xl md:rounded-[2.5rem] shadow-xl md:shadow-2xl p-6 md:p-10 border-t-8 md:border-t-12 border-[#234C6A]">
        
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-linear-to-tr from-[#FF6D1F] to-orange-300 flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || <UserIcon size={32} />}
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mt-4 md:mt-5 tracking-tight text-center break-all">
            {user?.name}
          </h2>

          <div className={`mt-3 px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm
            ${user?.name === "Guest User" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}
          `}>
            <ShieldCheck size={14} />
            {user?.role || (user?.name === "Guest User" ? "Guest" : "Member")}
          </div>
        </div>

        {/* QUICK MENU - Grid tetap 3 namun dengan padding kecil di mobile */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8 md:mb-10">
          <QuickMenuButton 
            icon={<ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />} 
            label="Keranjang" 
            color="orange" 
            onClick={() => router.push("/cart")} 
          />
          <QuickMenuButton 
            icon={<ClipboardList className="w-5 h-5 md:w-6 md:h-6" />} 
            label="Pesanan" 
            color="blue" 
            onClick={() => router.push("/marketplace/pesanan")} 
          />
          <QuickMenuButton 
            icon={<CalendarClock className="w-5 h-5 md:w-6 md:h-6" />} 
            label="Booking" 
            color="green" 
            onClick={() => router.push("/booking/history")} 
          />
        </div>

        {/* INFO FORM */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b pb-2 mb-4 text-[#234C6A]">
            <UserIcon size={20} />
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter italic">Informasi Akun</h3>
          </div>

          <div className="grid gap-4 md:gap-5">
            <ProfileInput 
              label="Nama Lengkap" 
              value={formData.name} 
              disabled={!editing} 
              onChange={(v) => setFormData({ ...formData, name: v })} 
            />
            <ProfileInput 
              label="Alamat Email" 
              value={formData.email} 
              disabled={!editing} 
              onChange={(v) => setFormData({ ...formData, email: v })} 
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 md:mt-10 flex flex-col gap-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="w-full py-4 rounded-xl md:rounded-2xl font-black text-white bg-[#234C6A] hover:bg-[#1a384d] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
            >
              <Pencil size={18} /> EDIT PROFIL
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={handleSave}
                className="py-4 rounded-xl md:rounded-2xl font-black bg-green-600 text-white hover:bg-green-700 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-md"
              >
                <Save size={18} /> SIMPAN
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(user || formData);
                }}
                className="py-4 rounded-xl md:rounded-2xl font-black text-red-500 border-2 border-red-500 hover:bg-red-50 transition-all flex justify-center items-center gap-2 active:scale-95"
              >
                <XCircle size={18} /> BATAL
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center justify-center gap-2 text-gray-400 font-bold hover:text-red-600 transition-colors uppercase text-[10px] md:text-xs tracking-widest py-2"
          >
            <LogOut size={16} /> Keluar dari Akun
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   SUB-COMPONENTS
================================ */
function QuickMenuButton({ icon, label, color, onClick }: QuickMenuProps) {
  const colors = {
    orange: "text-orange-600 border-gray-100 hover:border-orange-500 hover:bg-orange-50",
    blue: "text-[#234C6A] border-gray-100 hover:border-[#234C6A] hover:bg-blue-50",
    green: "text-green-600 border-gray-100 hover:border-green-600 hover:bg-green-50"
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 md:gap-2 border-2 rounded-xl md:rounded-2xl p-3 md:p-4 transition-all duration-300 transform active:scale-90 ${colors[color]}`}
    >
      <div className="mb-0.5">{icon}</div>
      <span className="font-black text-[8px] md:text-[10px] uppercase tracking-wider text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

function ProfileInput({ label, value, disabled, onChange }: ProfileInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase ml-1 tracking-widest leading-none">
        {label}
      </label>
      <input
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3.5 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all outline-none font-bold text-sm md:text-base
          ${disabled 
            ? "bg-gray-50 border-transparent text-slate-500 cursor-not-allowed" 
            : "bg-white border-[#FF6D1F] text-slate-800 shadow-sm focus:shadow-md"}`}
      />
    </div>
  );
}