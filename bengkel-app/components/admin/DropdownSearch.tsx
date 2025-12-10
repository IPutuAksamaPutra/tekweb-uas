"use client"
import { useState } from "react";

export default function DropdownSearch({data,label,onSelect,display}:{ 
  data:any[], label:string, display:(x:any)=>string, onSelect:(x:any)=>void 
}) {
  const [q,setQ]=useState("");

  const filtered=data.filter(x=>display(x).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="relative">
      <label className="font-semibold">{label}</label>
      <input
        className="border p-2 rounded w-full mt-1"
        placeholder={`Cari ${label}...`} 
        value={q} onChange={e=>setQ(e.target.value)}
      />

      {q && (
        <ul className="absolute w-full bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-30">
          {filtered.length ? filtered.map((x,i)=>(
            <li key={i}
              onClick={()=>{onSelect(x);setQ(display(x));}}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >{display(x)}</li>
          )):<li className="p-2 text-gray-400">Tidak ditemukan</li>}
        </ul>
      )}
    </div>
  );
}
