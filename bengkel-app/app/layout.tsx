// app/layout.tsx
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  );
}
