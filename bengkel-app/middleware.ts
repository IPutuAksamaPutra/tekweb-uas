import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value || null;
    const userData = req.cookies.get("user")?.value;

    const url = req.nextUrl.pathname;

    // Jika belum login dan coba masuk halaman yang butuh auth
    if (!token && url.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Jika user login, cek role
    if (token && userData) {
        const user = JSON.parse(userData);

        // Customer tidak boleh akses dashboard admin
        if (url.startsWith("/admin") && user.role === "customer") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Kasir boleh ke admin/cashier tapi tidak ke staff management
        if (url.startsWith("/admin/staff") && user.role !== "super_admin") {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
    }

    return NextResponse.next();
}

// Tentukan halaman mana yang di-protect oleh middleware
export const config = {
    matcher: [
        "/admin/:path*",     // semua halaman admin
        "/profile/:path*",   // profil butuh login
        "/pesanan/:path*",   // halaman pesanan user butuh login
    ],
};