"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { alertSuccess, alertError, alertLoginRequired, alertConfirmDelete, alertValidation, alertValidate } from "@/components/Alert";

interface Promotion {
  id: number;
  name: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  products: { id: number; name: string; price: number }[];
}

export default function PromotionPage() {
  const [list, setList] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= GET PROMO (PUBLIK BISA AMBIL) =================
  const getPromo = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/promotions");

      const data = await res.json();
      console.log("PROMO RESPONSE =>", data);

      setList(Array.isArray(data.promotions) ? data.promotions : []);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    getPromo();
  }, []);

  // ================= DELETE (HANYA ADMIN) =================
  const deletePromo = async (id: number) => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];

    if (!token) return alert("Login admin dulu!");
  const validate = await alertValidate("Yakin hapus promo?");
  if (!validate.isConfirmed) return;

    const res = await fetch(`http://localhost:8000/api/promotions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alertSuccess("Promo berhasil dihapus");
      getPromo();
    } else {
      alertError("Tidak punya akses hapus!");
    }
  };

  // ================= UI =================
  if (loading)
    return <p className="text-center p-10 text-gray-500">Memuat promo...</p>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#234C6A]">📢 Daftar Promo</h1>

        <a
          href="/admin/promotion/create"
          className="flex items-center gap-2 bg-[#FF6D1F] hover:bg-[#e55f19] text-white px-4 py-2 rounded-lg font-semibold shadow"
        >
          <Plus size={18} /> Tambah Promo
        </a>
      </div>

      {list.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-xl shadow text-gray-500">
          Belum ada promo tersedia
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg border-l-4 border-[#FF6D1F] transition"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="font-bold text-xl text-[#234C6A]">{p.name}</h2>

                  <p className="text-gray-700 text-sm">
                    {p.discount_type === "percentage"
                      ? `Diskon ${p.discount_value}%`
                      : `Potongan Rp ${p.discount_value.toLocaleString(
                          "id-ID"
                        )}`}
                  </p>

                  <p className="text-xs mt-1 text-gray-500">
                    {new Date(p.start_date).toLocaleDateString("id-ID")} -{" "}
                    {new Date(p.end_date).toLocaleDateString("id-ID")}
                  </p>

                  <div className="mt-2 text-sm">
                    Produk Terkait:
                    <ul className="list-disc ml-6 text-gray-700">
                      {p.products?.map((pr) => (
                        <li key={pr.id}>{pr.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-2 justify-center">
                  <a
                    href={`/admin/promotion/${p.id}/edit`}
                    className="px-3 py-1 border rounded-lg text-blue-700 hover:bg-blue-50 flex items-center gap-1"
                  >
                    <Edit size={16} /> Edit
                  </a>

                  <button
                    onClick={() => deletePromo(p.id)}
                    className="px-3 py-1 border rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
