'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    CalendarCheck,
    ShoppingCart,
    Users,       // Icon untuk Manajemen Pengguna/Staff
    Tag,         // Icon untuk Promosi
    ClipboardList, // Icon untuk Manajemen Order
    Settings
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    const menu = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Produk", href: "/admin/produk", icon: Package },
        { name: "Booking", href: "/admin/bookingAdmin", icon: CalendarCheck },
        { name: "Transaksi", href: "/admin/transaksi", icon: ShoppingCart },
        { name: "Managemet User", href: "/admin/manage-user", icon: Users },         // 🔥 Diubah ke Users
        { name: "Tambah Promosi", href: "/admin/promotion", icon: Tag },              // 🔥 Diubah ke Tag
        { name: "Management Order", href: "/admin/orders", icon: ClipboardList },    // 🔥 Diubah ke ClipboardList
        // Anda bisa tambahkan Pengaturan di sini jika diperlukan
        // { name: "Pengaturan", href: "/admin/settings", icon: Settings }, 
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
                    // Logika active path agar path sub-halaman juga aktif (misal: /admin/produk/edit)
                    const active = pathname.startsWith(item.href); 

                    return (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${active ? "bg-white text-[#234C6A] shadow-md" : "hover:bg-white/20"}`}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Link>
                        </li>
                    );
                })}

            </ul>

            <p className="text-center text-xs opacity-60">© Bengkel App 2025</p>
        </div>
    );
}