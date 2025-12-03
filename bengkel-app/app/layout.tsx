// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "BengkelApp",
  description: "Website Bengkel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* pastikan body class konsisten di sini */}
      <body className="min-h-screen bg-gray-100">
        {children}
      </body>
    </html>
  );
}
