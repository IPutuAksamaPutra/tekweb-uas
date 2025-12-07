"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Users,
  Settings,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  ReceiptText
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [openKasir, setOpenKasir] = useState(false);

  const menu = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Produk", href: "/admin/produk", icon: Package },
    { name: "Booking", href: "/admin/bookingAdmin", icon: CalendarCheck },
    
    
  ];

  return (
    <div className="p-5 flex flex-col h-full bg-[#234C6A] text-white select-none">

      {/* Judul brand */}
      <h2 className="text-xl font-bold mb-5 text-center tracking-wide">
        🛠 ADMIN PANEL
      </h2>

      {/* MENU LIST */}
      <ul className="space-y-2 flex-1">

        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${active ? "bg-white text-[#234C6A] shadow-md" : "hover:bg-white/20"}
              `}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            </li>
          );
        })}

        {/* ==================== KASIR DROPDOWN ==================== */}
        <li>
          <button
            onClick={() => setOpenKasir(!openKasir)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all
            ${pathname.startsWith("/admin/kasir") ? "bg-white text-[#234C6A] shadow-md" : "hover:bg-white/20"}
            `}
          >
            <span className="flex items-center gap-3">
              <ShoppingCart size={20} /> Kasir
            </span>

            {openKasir ? <ChevronDown size={18}/> : <ChevronRight size={18}/> }
          </button>

          {/* SUBMENU */}
          {openKasir && (
            <ul className="mt-1 ml-8 space-y-1 text-sm">
              <li>
                <Link
                  href="/admin/kasir/produk"
                  className={`block px-3 py-2 rounded hover:bg-white/20 ${
                    pathname.startsWith("/admin/kasir/produk") && "bg-white/30 font-semibold"
                  }`}
                >
                  • Produk
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/kasir/booking"
                  className={`block px-3 py-2 rounded hover:bg-white/20 ${
                    pathname.startsWith("/admin/kasir/booking") && "bg-white/30 font-semibold"
                  }`}
                >
                  • Booking
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/kasir/transaksi"
                  className={`block px-3 py-2 rounded hover:bg-white/20 ${
                    pathname.startsWith("/admin/kasir/transaksi") && "bg-white/30 font-semibold"
                  }`}
                >
                  • Riwayat Transaksi <ReceiptText size={14} className="inline ml-1"/>
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>

      <p className="text-center text-xs opacity-60">© Bengkel App 2025</p>
    </div>
  );
}