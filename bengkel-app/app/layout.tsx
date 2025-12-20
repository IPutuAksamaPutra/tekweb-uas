// app/layout.tsx
import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "BengkelApp",
  description: "Website Bengkel",
  verification: {
    google: "LB5mbgIAoSnXWJFkXZgX_wsg76j7ZqG1fQC3DL4Wmvk",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-100">
        {children}

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NC2K99PCDV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NC2K99PCDV');
          `}
        </Script>
      </body>
    </html>
  );
}
