import ProductDetailPromoClient from "./ProductDetailPromoClient";

// Interface untuk menangkap params secara Async (Standar Next.js 15)
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  // 1. Tunggu params selesai di-resolve
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 2. Kirim slug ke komponen khusus promo
  return <ProductDetailPromoClient slug={slug} />;
}