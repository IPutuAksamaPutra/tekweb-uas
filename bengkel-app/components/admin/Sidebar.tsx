"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  ShoppingCart,
  Users,
  Tag,
  ClipboardList,
  X,
} from "lucide-react";

/* ================= TYPES ================= */
interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Produk", href: "/admin/produk", icon: Package },
    { name: "Booking", href: "/admin/bookingAdmin", icon: CalendarCheck },
    { name: "Transaksi", href: "/admin/transaksi", icon: ShoppingCart },
    { name: "Manajemen User", href: "/admin/manage-user", icon: Users },
    { name: "Tambah Promosi", href: "/admin/promotion", icon: Tag },
    { name: "Management Order", href: "/admin/orders", icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col h-full bg-[#234C6A] text-white">

      {/* CLOSE BUTTON (MOBILE ONLY) */}
      {onClose && (
        <button
          onClick={onClose}
          className="md:hidden self-end p-4"
        >
          <X size={24} />
        </button>
      )}

      {/* TITLE */}
      <h2 className="text-xl font-bold text-center py-6 tracking-wide border-b border-white/10">
        Admin Panel
      </h2>

      {/* MENU */}
      <ul className="flex-1 px-3 space-y-2 mt-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onClose} // auto close on mobile
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${
                  active
                    ? "bg-white text-[#234C6A] shadow-md"
                    : "hover:bg-white/20"
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="text-center text-xs opacity-50 pb-4">
        © Admin Panel
      </p>
    </div>
  );
}
