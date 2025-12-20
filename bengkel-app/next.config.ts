/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 INI KUNCI HILANGKAN "LOOP PALSU" DI DEV
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
};

module.exports = nextConfig;
