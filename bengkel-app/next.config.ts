/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"], // ⬅ wajib ada agar bisa load http://localhost:8000
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

module.exports = nextConfig;
