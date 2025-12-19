import { Metadata } from "next";
import MarketplaceClient from "./MarketplaceClient"; // Komponen Client Anda

export const metadata: Metadata = {
  title: "Marketplace Sparepart & Aksesori Motor | DEXAR",
  description: "Beli sparepart motor original, ban, oli, dan aksesori motor terlengkap dengan harga terbaik. Melayani pengiriman ke seluruh Indonesia.",
  keywords: ["sparepart motor", "bengkel online", "toko aksesoris motor", "ban nmax", "oli mpx"],
  openGraph: {
    title: "Marketplace Bengkel Pedia - Solusi Sparepart Motor Anda",
    description: "Cek koleksi produk suku cadang motor terlengkap kami di sini.",
    url: "https://bengkelanda.com/marketplace",
    siteName: "Bengkel Pedia",
    images: [
      {
        url: "/images/og-marketplace.jpg", // Gambar suasana toko atau banner promo
        width: 1200,
        height: 630,
        alt: "Marketplace Bengkel Pedia",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <MarketplaceClient />;
}