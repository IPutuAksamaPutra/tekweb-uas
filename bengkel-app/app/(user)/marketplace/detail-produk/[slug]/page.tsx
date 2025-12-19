import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

const API_URL = "https://tekweb-uas-production.up.railway.app/api";

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/slug/${slug}`, {
      next: { revalidate: 3600 } 
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch (error) {
    console.error("SEO Fetch Error:", error);
    return null;
  }
}

// 🔥 GENERATE METADATA DINAMIS
// Pastikan menambahkan async dan await params
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; // 👈 Wajib di-await di Next.js 15
  const product = await getProduct(slug);

  if (!product) return { title: 'Produk Tidak Ditemukan | Bengkel Pedia' };

  return {
    title: `${product.name} | Bengkel Pedia`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.img_urls?.[0] || '/images/default-og.jpg' }],
    },
  };
}

// 🔥 SERVER COMPONENT UTAMA
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // 👈 Perbaikan utama: await params sebelum digunakan
  const product = await getProduct(slug);
  
  return <ProductDetailClient initialProduct={product} initialSlug={slug} />;
}