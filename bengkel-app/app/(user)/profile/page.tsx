"use client";

import { useState } from "react";
import { User, Mail, Phone, Pencil, LogOut, Camera, Save, XCircle, ShieldCheck } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData>({
    name: "Pengguna Baru",
    email: "user@example.com",
    phone: "08xxxxxxxxxx",
  });

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserData>(user);

  const handleSave = () => {
    // Implementasi validasi dasar di sini jika diperlukan
    if (!formData.name || !formData.email) {
      alert("Nama dan Email tidak boleh kosong!");
      return;
    }
    
    // Simpan data
    setUser(formData);
    setEditing(false);
  };

  const handleCancel = () => {
    // Kembalikan formData ke data user asli
    setFormData(user);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center py-12 px-4">

      {/* CARD PROFILE */}
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-8 border-t-8 border-[#234C6A]">

        {/* PROFILE TOP (HEADER & AVATAR) */}
        <div className="flex flex-col items-center border-b pb-6 mb-6">
            
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full bg-[#FF6D1F] text-white flex items-center justify-center text-5xl font-extrabold shadow-lg ring-4 ring-[#FF6D1F]/50 ring-offset-2">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-1 right-1 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition border">
              <Camera size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Info Utama */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#234C6A]">{user.name}</h2>
            
            {/* Status Akun - Tambahan Informasi */}
            <div className="flex items-center justify-center gap-2 mt-1 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <ShieldCheck size={16} /> Akun Terverifikasi
            </div>
          </div>
        </div>

        {/* FORM INPUT / DETAIL LIST */}
        <h3 className="text-xl font-bold mb-4 text-[#234C6A] flex items-center gap-2">
            <Pencil size={20} /> Detail Akun {editing && <span className="text-sm font-normal text-red-500">(Mode Edit Aktif)</span>}
        </h3>
        
        <div className="space-y-4">
          {[
            { label: "Nama Lengkap", icon: User, key: "name", type: "text" },
            { label: "Email", icon: Mail, key: "email", type: "email" },
            { label: "Nomor WhatsApp", icon: Phone, key: "phone", type: "text" },
          ].map((item: any) => (
            <div key={item.key} className="flex items-center gap-4">
              <div className="w-1/4 flex items-center gap-2 text-gray-700 font-medium">
                <item.icon size={18} className="text-[#234C6A]" /> {item.label}
              </div>
              
              <input
                type={item.type}
                disabled={!editing}
                placeholder={`Masukkan ${item.label}`}
                className={`w-3/4 p-3 rounded-xl border transition duration-200 text-gray-800 ${
                  editing
                    ? "border-[#FF6D1F] bg-white ring-2 ring-[#FF6D1F]/30 focus:outline-none"
                    : "border-gray-300 bg-gray-100 cursor-default"
                }`}
                value={(formData as any)[item.key]}
                onChange={(e) =>
                  setFormData({ ...formData, [item.key]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex gap-4 justify-center md:justify-start flex-wrap border-t pt-6">

          {!editing ? (
            <button
              onClick={() => {
                setEditing(true);
                setFormData(user); // Pastikan formData adalah data user saat mulai edit
              }}
              className="flex items-center gap-2 bg-[#FF6D1F] hover:bg-[#E05B1B] text-white font-bold px-6 py-3 rounded-full transition shadow-lg shadow-[#FF6D1F]/40"
            >
              <Pencil size={20} /> Edit Profil
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-[#234C6A] hover:bg-[#1A374A] text-white font-bold px-6 py-3 rounded-full transition shadow-lg shadow-[#234C6A]/40"
              >
                <Save size={20} /> Simpan Perubahan
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 border border-gray-400 text-gray-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-full transition"
              >
                <XCircle size={20} /> Batal
              </button>
            </>
          )}

          <button className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold px-6 py-3 transition">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}