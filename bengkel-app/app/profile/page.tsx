"use client";

import { useState } from "react";
import { User, Mail, Phone, Pencil, LogOut } from "lucide-react";

export default function ProfilePage() {
  // Dummy user sementara
  const [user, setUser] = useState({
    name: "Pengguna Baru",
    email: "user@example.com",
    phone: "08xxxxxxxxxx",
  });

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState(user);

  const handleSave = () => {
    setUser(formData);
    setEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">

      <h1 className="text-3xl font-bold text-[#234C6A] mb-6">Profil Saya</h1>

      {/* PROFILE HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-[#234C6A] text-white rounded-full flex items-center justify-center text-3xl font-bold shadow">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#234C6A]">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600">{user.phone}</p>
        </div>
      </div>

      {/* INFORMASI PROFILE */}
      <div className="space-y-6">

        {/* Nama */}
        <div>
          <label className="font-semibold text-gray-700 flex items-center gap-2 mb-1">
            <User size={18} /> Nama
          </label>
          <input
            type="text"
            disabled={!editing}
            className={`w-full p-3 rounded-xl border ${
              editing
                ? "border-[#FF6D1F] bg-white"
                : "border-gray-300 bg-gray-100"
            }`}
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>

        {/* Email */}
        <div>
          <label className="font-semibold text-gray-700 flex items-center gap-2 mb-1">
            <Mail size={18} /> Email
          </label>
          <input
            type="email"
            disabled={!editing}
            className={`w-full p-3 rounded-xl border ${
              editing
                ? "border-[#FF6D1F] bg-white"
                : "border-gray-300 bg-gray-100"
            }`}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        {/* Nomor Telepon */}
        <div>
          <label className="font-semibold text-gray-700 flex items-center gap-2 mb-1">
            <Phone size={18} /> No Telepon
          </label>
          <input
            type="text"
            disabled={!editing}
            className={`w-full p-3 rounded-xl border ${
              editing
                ? "border-[#FF6D1F] bg-white"
                : "border-gray-300 bg-gray-100"
            }`}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
      </div>

      {/* BUTTONS */}
      <div className="mt-8 flex items-center gap-4">

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-[#FF6D1F] hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl shadow transition"
          >
            <Pencil size={20} /> Edit Profil
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#FF6D1F] hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl shadow transition"
          >
            Simpan Perubahan
          </button>
        )}

        <button
          className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold px-5 py-3"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
