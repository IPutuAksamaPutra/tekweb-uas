import ProductDetailClient from "./ProductDetailClient";

// Interface untuk params yang bersifat Promise (Next.js 15+)
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  // 1. Resolve promise params
  const resolvedParams = await params;
  
  // 2. Ambil slug-nya
  const slug = resolvedParams.slug;

  // 3. Kirim ke Client Component
  return <ProductDetailClient slug={slug} />;
}