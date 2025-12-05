"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // <<< tambahkan ini

const bookingDummy = [
  { id:1, nama:"Rangga", jenis:"Service Ringan", biaya:75000 },
  { id:2, nama:"Doni", jenis:"Ganti Oli", biaya:45000 },
];

export default function KasirBooking(){
  const [select, setSelect] = useState<number>(1);
  const router = useRouter(); // <<< inisiasi router

  const data = bookingDummy.find(b=>b.id===select);

  return(
    <div className="p-8 space-y-6">

      <h1 className="text-2xl font-bold text-[#234C6A]">🔧 Kasir - Booking Service</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <select 
          className="border p-2 rounded-lg"
          onChange={(e)=>setSelect(Number(e.target.value))}
        >
          {bookingDummy.map(b=>(
            <option key={b.id} value={b.id}>{b.nama} - {b.jenis}</option>
          ))}
        </select>

        {data && (
          <div className="mt-3 space-y-2">
            <p>Nama: <b>{data.nama}</b></p>
            <p>Jenis Servis: <b>{data.jenis}</b></p>
            <p className="text-lg font-bold text-[#FF6D1F]">
              Biaya: Rp {data.biaya.toLocaleString()}
            </p>
          </div>
        )}

        <button 
          onClick={()=> router.push(`/admin/kasir/pembayaran?bookingID=${data?.id}`)} // <<< mengirim id ke pembayaran
          className="bg-[#234C6A] text-white px-4 py-2 rounded-lg hover:bg-[#1A374A]"
        >
          Proses Pembayaran
        </button>

      </div>
    </div>
  );
}
