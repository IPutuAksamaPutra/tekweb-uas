"use client";

import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import Footer from "@/components/admin/Footer";
import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-[#234C6A] text-white shadow-lg">
        <Sidebar />
      </aside>

      {/* CONTENT */}
      <div className="ml-64 flex flex-col flex-1">

        <Navbar />

        <main className="flex-1 p-6">
          {children}
        </main>

        <Footer />

      </div>

    </div>
  );
}
