import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;

  const res = await fetch(
    `${API_URL}/products/slug/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    console.error("FETCH PRODUCT FAILED:", res.status);
    notFound();
  }

  const json = await res.json();

  // 🔥 SESUAI BACKEND
  const product = json?.product;

  if (!product?.id) {
    console.error("PRODUCT INVALID:", json);
    notFound();
  }

  return (
    <ProductDetailClient product={product} />
  );
}
