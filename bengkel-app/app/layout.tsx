import "./globals.css";


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body className="bg-gray-100 text-gray-900">
<header className="w-full bg-blue-600 text-white p-4 shadow-md">
<div className="container mx-auto text-xl font-semibold">Bengkel App</div>
</header>


<main className="container mx-auto p-4">{children}</main>


<footer className="w-full text-center p-4 text-sm text-gray-600">
© {new Date().getFullYear()} Bengkel App
</footer>
</body>
</html>
);
}