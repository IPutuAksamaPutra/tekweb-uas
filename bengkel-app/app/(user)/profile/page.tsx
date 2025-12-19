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

  // Helper baca cookie
  const getCookie = useCallback((name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }, []);

  // Load data user
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
      // Update local state
      setUser(formData);
      // Update cookie
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
    <div className="min-h-screen bg-gray-50 flex justify-center items-center py-12 px-4">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 border-t-12 border-[#234C6A]">
        
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full bg-linear-to-tr from-[#FF6D1F] to-orange-300 flex items-center justify-center text-white text-5xl font-black shadow-xl">
            {user?.name?.charAt(0).toUpperCase() || <UserIcon size={48} />}
          </div>

          <h2 className="text-3xl font-black text-slate-800 mt-5 tracking-tight">
            {user?.name}
          </h2>

          <div className={`mt-3 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-sm
            ${user?.name === "Guest User" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}
          `}>
            <ShieldCheck size={16} />
            {user?.role || (user?.name === "Guest User" ? "Guest" : "Member")}
          </div>
        </div>

        {/* QUICK MENU */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <QuickMenuButton 
            icon={<ShoppingCart size={24} />} 
            label="Keranjang" 
            color="orange" 
            onClick={() => router.push("/cart")} 
          />
          <QuickMenuButton 
            icon={<ClipboardList size={24} />} 
            label="Pesanan" 
            color="blue" 
            onClick={() => router.push("/marketplace/pesanan")} 
          />
          <QuickMenuButton 
            icon={<CalendarClock size={24} />} 
            label="Booking" 
            color="green" 
            onClick={() => router.push("/booking/history")} 
          />
        </div>

        {/* INFO FORM */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b pb-2 mb-4 text-[#234C6A]">
            <UserIcon size={20} />
            <h3 className="text-xl font-black uppercase tracking-tighter">Informasi Akun</h3>
          </div>

          <div className="grid gap-5">
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
        <div className="mt-10 flex flex-col gap-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="w-full py-4 rounded-2xl font-black text-white bg-[#234C6A] hover:bg-[#1a384d] transition-all flex items-center justify-center gap-2"
            >
              <Pencil size={18} /> EDIT PROFIL
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleSave}
                className="py-4 rounded-2xl font-black bg-green-600 text-white hover:bg-green-700 transition-all flex justify-center items-center gap-2"
              >
                <Save size={18} /> SIMPAN
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(user || formData);
                }}
                className="py-4 rounded-2xl font-black text-red-500 border-2 border-red-500 hover:bg-red-50 transition-all flex justify-center items-center gap-2"
              >
                <XCircle size={18} /> BATAL
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center justify-center gap-2 text-gray-400 font-bold hover:text-red-600 transition-colors uppercase text-sm tracking-widest"
          >
            <LogOut size={18} /> Keluar dari Akun
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
      className={`flex flex-col items-center gap-2 border-2 rounded-2xl p-4 transition-all duration-300 transform active:scale-95 ${colors[color]}`}
    >
      <div className="mb-1">{icon}</div>
      <span className="font-black text-[10px] uppercase tracking-wider">{label}</span>
    </button>
  );
}

function ProfileInput({ label, value, disabled, onChange }: ProfileInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">{label}</label>
      <input
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-4 rounded-2xl border-2 transition-all outline-none font-bold
          ${disabled 
            ? "bg-gray-50 border-transparent text-slate-500" 
            : "bg-white border-[#FF6D1F] text-slate-800 shadow-sm focus:shadow-md"}`}
      />
    </div>
  );
}