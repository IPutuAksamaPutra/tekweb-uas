import "../globals.css";
import Sidebar from "@/components/admin/Sidebar";
import Footer from "@/components/admin/Footer";

export const metadata = {
  title: "Admin Panel",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#234C6A] text-white shadow-xl z-50">
        <Sidebar />
      </aside>

      {/* MAIN CONTENT */}
      <div className="ml-64 flex flex-col w-full">

        <main className="flex-1 p-6">
          {children}
        </main>

        <footer className="bg-white shadow p-4">
          <Footer />
        </footer>

      </div>
    </div>
  );
}
