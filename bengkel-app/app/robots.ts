import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/", // Melarang Google mengindeks halaman admin Anda
    },
    sitemap: "https://bengkeldexar.vercel.app/sitemap.xml",
  };
}
