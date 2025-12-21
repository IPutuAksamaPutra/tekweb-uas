import Navbar from "@/components/user/NavbarUsr";
import Footer from "@/components/user/FooterUsr";
import "../globals.css";

// WAJIB: Menggunakan 'export default' agar Next.js mengenalinya sebagai Layout
export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar tetap berfungsi interaktif selama di dalam file NavbarUsr.tsx ada "use client" */}
      <Navbar />

      <main className="flex-1 p-6">
        {children}
      </main>

      <Footer />
    </div>
  );
}