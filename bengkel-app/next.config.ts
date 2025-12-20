/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 Penting: Mencegah useEffect berjalan 2x agar fetch tidak boros
  reactStrictMode: false,

  images: {
    // Mengizinkan Next.js memuat gambar dari domain ini
    domains: [
      "localhost",
      "tekweb-uas-production.up.railway.app",
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "tekweb-uas-production.up.railway.app",
        pathname: "/storage/**",
      },
    ],
  },
  
  // Bagian rewrites dihapus sesuai permintaanmu agar fetch langsung di tiap halaman
};

module.exports = nextConfig;