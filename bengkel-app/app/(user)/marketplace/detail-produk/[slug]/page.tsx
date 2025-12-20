// app/marketplace/[slug]/page.tsx
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

const BASE_URL = "https://tekweb-uas-production.up.railway.app";
const API_URL = `${BASE_URL}/api`;

interface PageProps {
  params: { slug: string };
}

export default async function ProductDetailPage({ params }: PageProps) {
  try {
    // 🔹 FETCH PRODUCT
    const productRes = await fetch(
      `${API_URL}/products/${params.slug}`,
      { cache: "force-cache" }
    );

    if (!productRes.ok) return notFound();
    const product = await productRes.json();

    // 🔹 FETCH REVIEW
    const reviewRes = await fetch(
      `${API_URL}/reviews?product_id=${product.id}`,
      { cache: "force-cache" }
    );

    const reviewData = reviewRes.ok
      ? await reviewRes.json()
      : { reviews: [], average_rating: "0.0", total_reviews: 0 };

    return (
      <ProductDetailClient
        product={product}
        reviews={reviewData.reviews}
        avgRating={reviewData.average_rating}
        totalReviews={reviewData.total_reviews}
      />
    );
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return notFound();
  }
}
