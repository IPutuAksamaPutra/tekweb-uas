"use client";

import { useEffect, useState } from "react";

interface Promotion {
  id: number;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  start_date: string;
  end_date: string;
}

export default function PromoSlider() {
  const [promo, setPromo] = useState<Promotion[]>([]);
  const [slide, setSlide] = useState(0);

  const getPromo = async () => {
    const res = await fetch("http://localhost:8000/api/promotions/public");
    const data = await res.json();
    setPromo(data.promotions ?? []);
  };

  useEffect(() => {
    getPromo();
    const auto = setInterval(() => {
      setSlide((s) => (s + 1) % promo.length);
    }, 3000);
    return () => clearInterval(auto);
  }, [promo.length]);

  if (promo.length === 0) return null;

  const p = promo[slide];

  return (
    <div className="relative w-full h-44 sm:h-56 rounded-xl overflow-hidden shadow-xl mb-6 bg-[#ffedd5]">

      {/* Isi Promo */}
      <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
        <h2 className="text-2xl font-bold text-orange-600">{p.name}</h2>
        <p className="text-gray-700 mt-1">
          {p.discount_type === "percentage"
            ? `Diskon ${p.discount_value}%`
            : `Potongan Rp ${p.discount_value.toLocaleString()}`}
        </p>

        <small className="text-gray-600 mt-1 text-xs">
          {new Date(p.start_date).toLocaleDateString("id-ID")} -{" "}
          {new Date(p.end_date).toLocaleDateString("id-ID")}
        </small>
      </div>

      {/* Dot Indicator */}
      <div className="absolute bottom-2 w-full flex justify-center gap-2">
        {promo.map((_, i) => (
          <span
            key={i}
            onClick={() => setSlide(i)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              i === slide ? "bg-orange-600" : "bg-white"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
}
