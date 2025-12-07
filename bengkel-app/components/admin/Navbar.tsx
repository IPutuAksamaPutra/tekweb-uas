"use client";

import { Bell, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Fungsi utilitas untuk menghapus cookie
const deleteCookie = (name: string) => {
    // Menghapus cookie dengan mengatur tanggal kadaluwarsa ke masa lalu
    // PENTING: Path=/ memastikan cookie dihapus di seluruh domain
    document.cookie = `${name}=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
};

export default function AdminNavbar() {
    const router = useRouter(); 
    // ⚠️ GANTI DENGAN URL API LARAVEL ANDA YANG SEBENARNYA
    const API_LOGOUT_URL = "http://your-laravel-api.com/api/logout"; 

    // --- FUNGSI PEMBERSIH KLIEN ---
    const cleanUpClientState = () => {
        console.log('Membersihkan state klien secara AGRESIF...');
        
        // 1. Hapus Token Bearer dari Local Storage
        localStorage.removeItem('authToken');
        
        // 2. HAPUS SEMUA COOKIE YANG BERPOTENSI MENYANGKUT
        
        // a) Cookie Sesi Laravel Default (Paling Sering Jadi Masalah)
        deleteCookie('laravel_session'); 
        
        // b) Cookie CSRF Token
        deleteCookie('XSRF-TOKEN');
        
        // c) Cookie Token Kustom (Jika ada)
        deleteCookie('authToken'); 
        deleteCookie('user_session_id'); // Contoh cookie lain jika ada

        // 3. Redirect ke Halaman Login Admin
        router.replace('/auth/login'); 
    };

    // --- FUNGSI LOGOUT UTAMA ---
    const handleLogout = async () => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            console.warn('Token tidak ditemukan, langsung cleanup.');
            cleanUpClientState(); 
            return;
        }

        try {
            // PANGGIL ENDPOINT LOGOUT LARAVEL (Mencabut token di server)
            await axios.post(API_LOGOUT_URL, {}, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            console.log('Server merespons OK. Melakukan cleanup klien.');
            cleanUpClientState();

        } catch (error) {
            // Jika API gagal (Token Invalid/Expired), kita tetap harus membersihkan cookie di klien.
            console.error('Logout API gagal. Memaksa cleanup klien.');
            cleanUpClientState();
        }
    };

    return (
        <nav className="h-16 flex items-center justify-between bg-white px-6 shadow-sm rounded-md">
            {/* ... */}
            <div className="flex items-center gap-5">
                {/* ... */}
                <div className="flex items-center gap-4">
                    
                    {/* Tombol Logout */}
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                    {/* ... */}
                </div>
            </div>
        </nav>
    );
}