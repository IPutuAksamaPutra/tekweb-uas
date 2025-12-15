"use client";

import { useParams, useRouter } from "next/navigation";

export default function PromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <div className="max-w-xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">
        Detail Promotion #{id}
      </h1>

      <button
        onClick={() => router.push(`/admin/promotion/${id}/edit`)}
        className="bg-[#FF6D1F] text-white px-4 py-2 rounded"
      >
        Edit Promotion
      </button>
    </div>
  );
}
