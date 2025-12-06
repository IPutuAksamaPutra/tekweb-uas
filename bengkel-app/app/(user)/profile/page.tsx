"use client";

import { useState, useEffect } from "react";
import { User, Mail, Pencil, LogOut, Camera, Save, XCircle, ShieldCheck, ShoppingCart } from "lucide-react";

interface UserData {
    name: string;
    email: string;
}

// =======================================================
// FUNGSI INISIALIZER UNTUK MENGHINDARI HYDRATION ERROR
// Next.js akan memanggil fungsi ini hanya di klien (browser)
// =======================================================
const getInitialUserData = (): UserData => {
    // Pastikan kita berada di lingkungan browser sebelum mengakses window/localStorage
    if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem("profileUser");
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                return {
                    name: parsedUser.name || "Pengguna Baru",
                    email: parsedUser.email || "user@example.com",
                };
            } catch (e) {
                console.error("Gagal parse data profil dari localStorage:", e);
            }
        }
    }
    // Nilai default yang konsisten (Digunakan di SSR dan jika localStorage kosong/error)
    return { name: "Pengguna Baru", email: "user@example.com" };
};


export default function ProfilePage() {
    // MENGGUNAKAN FUNGSI INISIALIZER PADA useState
    // Logika pembacaan localStorage tidak lagi di dalam useEffect
    const [user, setUser] = useState<UserData>(getInitialUserData); 
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<UserData>(user);
    
    // useEffect lama dihilangkan karena logikanya sudah dipindahkan ke getInitialUserData.
    // Jika Anda ingin melakukan sesuatu setelah data dimuat, Anda bisa menggunakan useEffect.

    // PERHATIAN: useEffect ini hanya dijalankan untuk memastikan formData sinkron
    // jika user diubah oleh logic di atas (walaupun seharusnya tidak perlu lagi)
    useEffect(() => {
        setFormData(user); 
    }, [user]); 

    const handleSave = () => {
        if (!formData.name || !formData.email) {
            window.alert("Nama dan Email tidak boleh kosong!");
            return;
        }
        
        // Simpan data ke state dan localStorage
        setUser(formData);
        localStorage.setItem("profileUser", JSON.stringify(formData));
        setEditing(false);
    };

    const handleCancel = () => {
        // Kembalikan formData ke data user asli
        setFormData(user); 
        setEditing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center py-8 sm:py-12 px-2 sm:px-4">

            {/* CARD PROFILE */}
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 border-t-8 border-[#234C6A]">

                {/* PROFILE TOP (HEADER & AVATAR) */}
                <div className="flex flex-col items-center border-b pb-4 sm:pb-6 mb-4 sm:mb-6">
                    
                    {/* Avatar */}
                    <div className="relative mb-3 sm:mb-4">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#FF6D1F] text-white flex items-center justify-center text-4xl sm:text-5xl font-extrabold shadow-lg ring-2 sm:ring-4 ring-[#FF6D1F]/50 ring-offset-2">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <button 
                            className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition border"
                            title="Ubah Foto Profil"
                        >
                            <Camera size={18} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Info Utama */}
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#234C6A]">{user.name}</h2>
                        
                        {/* Status Akun */}
                        <div className="inline-flex items-center justify-center gap-2 mt-1 text-xs sm:text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                            <ShieldCheck size={14} /> Akun Terverifikasi
                        </div>
                    </div>
                </div>

                {/* FORM INPUT / DETAIL LIST */}
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-[#234C6A] flex items-center gap-2">
                    <Pencil size={20} /> Detail Akun {editing && <span className="text-xs sm:text-sm font-normal text-red-500">(Mode Edit Aktif)</span>}
                </h3>
                
                <div className="space-y-4">
                    {[
                        { label: "Nama Lengkap", icon: User, key: "name", type: "text" },
                        { label: "Email", icon: Mail, key: "email", type: "email" },
                    ].map((item: any) => (
                        <div key={item.key} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4"> 
                            <div className="w-full sm:w-1/4 flex items-center gap-2 text-gray-700 font-medium whitespace-nowrap text-sm">
                                <item.icon size={18} className="text-[#234C6A]" /> {item.label}
                            </div>
                            
                            <input
                                type={item.type}
                                disabled={!editing}
                                placeholder={`Masukkan ${item.label}`}
                                className={`w-full sm:w-3/4 p-3 rounded-xl border transition duration-200 text-gray-800 text-sm ${
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
                <div className="mt-6 sm:mt-8 flex flex-col gap-4 border-t pt-4 sm:pt-6">

                    {/* KELOMPOK NAVIGASI E-COMMERCE */}
                    <div className="flex justify-center border-b pb-4">
                        
                        {/* LIHAT KERANJANG - Primary Action */}
                        <a
                            href="/cart"
                            className="flex items-center justify-center gap-2 bg-[#FF6D1F] hover:bg-[#E05B1B] text-white
                                        font-semibold px-4 py-2 rounded-full transition shadow-md w-full sm:w-1/2 transform hover:scale-[1.02]"
                        >
                            <ShoppingCart size={20} /> Lihat Keranjang
                        </a>
                    </div>


                    {/* KELOMPOK AKSI UTAMA & LOGOUT */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start items-center">
                        {!editing ? (
                            <button
                                onClick={() => {
                                    setEditing(true);
                                    setFormData(user);
                                }}
                                className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2.5 sm:px-6 sm:py-3 rounded-full transition shadow-lg w-full sm:w-auto text-sm"
                            >
                                <Pencil size={18} /> Edit Profil
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 sm:px-6 sm:py-3 rounded-full transition shadow-lg shadow-green-500/30 w-full sm:w-auto text-sm"
                                >
                                    <Save size={18} /> Simpan Perubahan
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center justify-center gap-2 border border-red-400 text-red-600 hover:bg-red-50 font-semibold px-4 py-2.5 sm:px-6 sm:py-3 rounded-full transition w-full sm:w-auto text-sm"
                                >
                                    <XCircle size={18} /> Batal
                                </button>
                            </>
                        )}
                        
                        <button className="flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 font-semibold px-4 py-2.5 sm:py-3 transition w-full sm:w-auto text-sm">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}