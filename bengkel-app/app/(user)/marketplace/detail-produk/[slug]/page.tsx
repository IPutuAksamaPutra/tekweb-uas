import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function Page({ params }: PageProps) {
  return <ProductDetailClient slug={params.slug} />;
}
