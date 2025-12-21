// app/layout.tsx
import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: {
    default: "Bengkel Dexar",
    template: "%s | Bengkel Dexar",
  },
  description:
    "Bengkel Dexar adalah aplikasi booking bengkel, servis kendaraan, dan pembelian sparepart secara online dengan mudah dan cepat.",
  verification: {
    google: "LB5mbgIAoSnXWJFkXZgX_wsg76j7ZqG1fQC3DL4Wmvk",
  },
  openGraph: {
    title: "Bengkel Dexar",
    description:
      "Aplikasi booking bengkel dan servis kendaraan online terpercaya.",
    url: "https://bengkeldexar.vercel.app",
    siteName: "Bengkel Dexar",
    type: "website",
    locale: "id_ID",
  },
};

// --- BAGIAN YANG TADI HILANG ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}