import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params; // 🔥 INI KUNCINYA

  return <ProductDetailClient slug={slug} />;
}
