import { use } from "react";
import ProductDetailPromoClient from "./ProductDetailPromoClient";

export default function Page(props: { params: Promise<{ slug: string }> }) {
  // Unwrap params
  const { slug } = use(props.params);

  // Jika TS masih protes, kita paksa komponen client menganggap ini benar
  const Client = ProductDetailPromoClient as any;

  return <Client slug={slug} />;
}