import { MetadataRoute } from 'next'

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://bengkelanda.com';

const API_URL = "http://localhost:8000/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // 1. Ambil data produk (Marketplace)
    const productRes = await fetch(`${API_URL}/products`, { next: { revalidate: 3600 } });
    const productData = await productRes.json();
    // Sesuaikan jika Laravel mengembalikan { products: [] }
    const products = productData.products || [];

    const marketplaceUrls = products.map((item: any) => ({
      url: `${BASE_URL}/marketplace/detailProduk/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // 2. Halaman Statis Utama
    const staticUrls: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/booking`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/auth/login`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      },
    ];

    return [...staticUrls, ...marketplaceUrls];
    
  } catch (error) {
    console.error("Sitemap error:", error);
    // Jika API gagal, tetap kembalikan halaman statis agar tidak 404
    return [
      { url: BASE_URL, lastModified: new Date() }
    ];
  }
}