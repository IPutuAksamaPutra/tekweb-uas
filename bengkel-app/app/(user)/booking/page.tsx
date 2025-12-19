import { Metadata } from "next";
import BookingClient from "./BookingClient"; // Import kode booking Anda

export const metadata: Metadata = {
  title: "Booking Servis Motor Online | DEXAR",
  description: "Jadwalkan servis motor Matic atau Manual Anda secara online. Layanan ganti oli, tune up, servis berat, dan perbaikan rem dengan teknisi berpengalaman.",
  keywords: ["booking servis bengkel", "servis motor online", "bengkel motor matic", "ganti oli online"],
  openGraph: {
    title: "Booking Servis Motor Online - Bengkel Pedia",
    description: "Rawat kendaraan Anda tanpa antre. Booking sekarang!",
    url: "https://bengkelanda.com/booking",
    siteName: "Bengkel Pedia",
    images: [
      {
        url: "/images/og-booking.jpg", // Pastikan gambar ini ada di folder public
        width: 1200,
        height: 630,
        alt: "Booking Servis Bengkel Pedia",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Booking Servis Motor Online",
    description: "Jadwalkan perawatan motor Anda dengan mudah di Bengkel Pedia.",
    images: ["/images/og-booking.jpg"],
  },
};

export default function Page() {
  return <BookingClient />;
}