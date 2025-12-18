"use client"; // Diperlukan karena kita menggunakan state untuk toggle sidebar

import { useState } from "react";
import "../globals.css";
import Navbar from "@/components/admin/Navbar";
import Footer from "@/components/admin/Footer";
import Sidebar from "@/components/admin/Sidebar"; // Pastikan path ini benar
import { Menu } from "lucide-react"; // Import icon menu untuk mobile

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      
      {/* SIDEBAR (DESKTOP & MOBILE) */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-[#234C6A] transition-transform duration-300 ease-in-out md:relative md:translate-x-0 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* OVERLAY (MOBILE ONLY) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* NAVBAR */}
        <header className="sticky top-0 bg-white shadow-md z-20 px-4 md:px-6 py-3 border-b border-gray-200 flex items-center gap-4">
          {/* Hamburger Button for Mobile */}
          <button 
            onClick={toggleSidebar} 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1">
            <Navbar />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-white shadow-inner p-4 border-t border-gray-200 text-sm text-center">
          <Footer />
        </footer>
      </div>
    </div>
  );
}