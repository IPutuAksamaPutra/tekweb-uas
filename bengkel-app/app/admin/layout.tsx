import "../globals.css";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import Footer from "@/components/admin/Footer";

export const metadata = {
  title: "Admin Panel",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">

      {/* ========== SIDEBAR ========== */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-[#1E3A5F] text-white shadow-2xl flex flex-col border-r border-white/10 z-50">
        <div className="text-center py-6 font-bold text-xl tracking-wide bg-[#1A3452]">
          Admin Panel
        </div>

        <div className="overflow-y-auto flex-1 py-4">
          <Sidebar />
        </div>

        
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="ml-64 w-full flex flex-col">

        {/* NAVBAR */}
        <header className="sticky top-0 bg-white shadow-md z-20 px-6 py-3 border-b border-gray-200">
          <Navbar />
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8">
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
