// app/cashier/layout.tsx
'use client'; 

import React, { ReactNode, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation'; 
import { LogOut, Menu, X } from 'lucide-react'; // Import Menu dan X

interface CashierLayoutProps {
    children: ReactNode;
}

const deleteCookie = (name: string) => {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
};

const CashierLayout: React.FC<CashierLayoutProps> = ({ children }) => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State untuk mengontrol menu hamburger

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        deleteCookie('token'); 
        router.push('/auth/login');
    };

    return (
        <>
            <title>Sistem POS & Kasir | Bengkel Anda</title>
            
            <div className="min-h-screen bg-gray-50">
                
                {/* Header minimalis dan responsif */}
                <header className="w-full bg-white shadow-lg p-3 lg:p-4 sticky top-0 z-20">
                    <div className="mx-auto max-w-screen-2xl flex justify-between items-center">
                        
                        {/* Judul Utama */}
                        <h1 className="text-lg lg:text-xl font-bold text-indigo-700">
                            POS Transaksi Cepat
                        </h1>
                        
                        {/* Tombol Hamburger (Hanya tampil di layar kecil/mobile) */}
                        <button
                            className="sm:hidden p-1 text-gray-700 hover:text-indigo-600"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        {/* Konten Menu Desktop (Selalu terlihat di layar besar) */}
                        <div className="hidden sm:flex items-center text-sm text-gray-600">
                            <span className="mr-2">Kasir: John Doe</span> 
                            <div className="h-4 border-l border-gray-300 mx-2"></div>
                            <button 
                                onClick={handleLogout} 
                                className="flex items-center text-red-500 hover:text-red-700 transition duration-150 font-semibold"
                            >
                                <LogOut size={16} className="mr-1" />
                                Logout
                            </button>
                        </div>
                    </div>
                    
                    {/* 👇 Menu Mobile (Tampil ketika isMenuOpen TRUE) */}
                    {isMenuOpen && (
                        <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
                            <div className="flex flex-col space-y-2 text-gray-700">
                                
                                {/* Info Kasir (Tampil di Mobile Menu) */}
                                <span className="font-semibold">Kasir: John Doe</span> 
                                
                                {/* Tombol Logout (Tampil di Mobile Menu) */}
                                <button 
                                    onClick={handleLogout} 
                                    className="flex items-center text-red-500 hover:text-red-700 transition duration-150 font-semibold w-full justify-start"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                {/* Konten Halaman Kasir */}
                <main className="p-4 mx-auto max-w-screen-2xl">
                    {children}
                </main>
            </div>
        </>
    );
};

export default CashierLayout;