

import Navbar from "@/components/user/NavbarUsr";
import Footer from "@/components/user/FooterUsr";
import "../globals.css";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
