import { Metadata } from "next";
import LoginPage from "./LoginClient";

export const metadata: Metadata = {
  title: "Login Akun | Bengkel Dexar",
  description: "Masuk ke sistem Bengkel Pedia untuk mengelola antrean servis, melihat riwayat transaksi, dan mengakses fitur eksklusif lainnya.",
  // 🔥 Mencegah halaman login muncul di hasil pencarian publik demi keamanan
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Login Sistem - Bengkel Dexar",
    description: "Akses dashboard pelanggan dan admin Bengkel Pedia.",
    url: "https://bengkeldexar.vercel.app/auth/login",
    siteName: "Bengkel Pedia",
    images: [
      {
        url: "/images/og-login.jpg", // Gambar branding bengkel Anda di folder public
        width: 1200,
        height: 630,
        alt: "Login Bengkel Dexar",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <LoginPage />;
}