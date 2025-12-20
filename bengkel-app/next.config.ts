/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 Mencegah useEffect jalan 2x di mode dev (menghindari loop fetch)
  reactStrictMode: false,

  images: {
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

  // 🔥 TAMBAHKAN INI UNTUK FIX CORS
  async rewrites() {
    return [
      {
        // Setiap kali kamu panggil /api/railway/ di frontend, 
        // Next.js akan mengambilkan datanya dari link asli di bawah
        source: '/api/railway/:path*',
        destination: 'https://tekweb-uas-production.up.railway.app/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;