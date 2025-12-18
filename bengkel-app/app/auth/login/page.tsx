import { Metadata } from "next";
import LoginPage from "./LoginClient";

export const metadata: Metadata = {
  title: "Login Akun | Bengkel Pedia",
  description: "Masuk ke sistem Bengkel Pedia untuk mengelola antrean servis, melihat riwayat transaksi, dan mengakses fitur eksklusif lainnya.",
  // 🔥 Mencegah halaman login muncul di hasil pencarian publik demi keamanan
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Login Sistem - Bengkel Pedia",
    description: "Akses dashboard pelanggan dan admin Bengkel Pedia.",
    url: "https://bengkelanda.com/auth/login",
    siteName: "Bengkel Pedia",
    images: [
      {
        url: "/images/og-login.jpg", // Gambar branding bengkel Anda di folder public
        width: 1200,
        height: 630,
        alt: "Login Bengkel Pedia",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <LoginPage />;
}