import "./globals.css";
import NavbarUsr from "@/components/user/NavbarUsr";
import FooterUsr from "@/components/user/FooterUsr";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 flex flex-col">
        <NavbarUsr />

        <main className="container mx-auto p-4 grow">
          {children}
        </main>

        <FooterUsr />
      </body>
    </html>
  );
}
