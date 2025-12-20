"use client";

export default function ProductDetailClient({ product }: any) {
  console.log("CLIENT PRODUCT:", product);

  return (
    <div style={{ padding: 40 }}>
      <h1>DETAIL PRODUK</h1>
      <pre>{JSON.stringify(product, null, 2)}</pre>
    </div>
  );
}
