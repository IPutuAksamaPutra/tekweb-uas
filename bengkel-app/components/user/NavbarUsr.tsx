"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function NavbarUsr() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Booking", href: "/booking" },
    { name: "History", href: "/booking/history" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <nav
      className="w-full text-white shadow-lg z-50 sticky top-0"
      style={{ backgroundColor: "#234C6A" }}
    >
      <div className="container mx-auto px-4 md:px-0 flex items-center justify-between h-16">
        {/* Logo/Brand */}
        <a href="/" className="text-xl font-bold tracking-wider">
          Bengkel Dexar
        </a>

        {/* =================================================== */}
        {/* 1. Desktop Menu (Selalu terlihat di layar medium/besar) */}
        {/* =================================================== */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="hover:text-gray-300 transition duration-150"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* =================================================== */}
        {/* 2. Mobile Menu Button (Hanya terlihat di layar kecil) */}
        {/* =================================================== */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-md hover:bg-[#1A374A] transition"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* =================================================== */}
      {/* 3. Mobile Dropdown Menu (Muncul ketika isMenuOpen TRUE) */}
      {/* =================================================== */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0"
        }`}
        style={{ backgroundColor: "#1A374A" }} // Warna yang sedikit lebih gelap untuk dropdown
      >
        <div className="flex flex-col px-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={toggleMenu} // Tutup menu setelah klik
              className="block py-2 text-sm font-medium hover:bg-[#234C6A] rounded-md transition duration-150 pl-3"
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
