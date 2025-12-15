"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, Wrench, Calendar, Tag, Car, Phone, BookOpen, User } from "lucide-react";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

// === Interface ===
interface Booking {
  id: number;
  jenis_kendaraan: string;
  nama_kendaraan: string;
  jenis_service: string;
  booking_date: string;
  no_wa: string;
  notes: string | null;
  status: "Pending" | "Diterima" | "Selesai";
  user_id: number;
}

// ==== Baca cookie hanya jika client ====
function getCookie(name: string) {
  if (typeof document === "undefined") return null; // FIX document is not defined
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function RiwayatBooking() {

  const [riwayat, setRiwayat] = useState<Booking[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";


  // ================= GET PROFILE USER =================
  async function loadUser() {
    const token = getCookie("token");
    if (!token) return alertError("Silahkan login terlebih dahulu!");

    const res = await fetch(`${apiUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setUserId(data.id || data.user?.id);
  }

  // ================= GET BOOKING FILTER USER =================
  async function loadBooking(uid:number) {
    const token = getCookie("token");
    if (!token) return;

    const res = await fetch(`${apiUrl}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    const list = Array.isArray(data) ? data :
                 data.bookings || data.data || [];

    // 🔥 filter by user login
    const filtered = list.filter((b:Booking)=> b.user_id === uid);

    setRiwayat(filtered);
    setLoading(false);
  }


  // running
  useEffect(()=>{
    if(typeof window !== "undefined") loadUser();
  },[]);

  useEffect(()=>{
    if(userId) loadBooking(userId);
  },[userId]);

  
  // ================= UI Helper =================
  const statusBadge = (s:Booking["status"]) => ({
    Pending:  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">Pending</span>,
    Diterima: <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Diterima</span>,
    Selesai:  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Selesai</span>
  }[s]);

  const borderStatus = (s:Booking["status"]) => ({
    Pending:"border-yellow-500",
    Diterima:"border-blue-500",
    Selesai:"border-green-500"
  }[s]);

  const statusIcon = (s:Booking["status"]) => ({
    Pending:<span className="bg-yellow-100 text-yellow-700 p-2 rounded-full shadow"><Clock size={18}/></span>,
    Diterima:<span className="bg-blue-100 text-blue-700 p-2 rounded-full shadow"><Wrench size={18}/></span>,
    Selesai:<span className="bg-green-100 text-green-700 p-2 rounded-full shadow"><CheckCircle size={18}/></span>
  }[s]);

  const formatDate = (date:string)=>
    new Date(date).toLocaleString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"});


  // ================= LOADING =================
  if(loading)
  return(
    <div className="min-h-screen flex justify-center items-center bg-gray-100 gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-orange-500"></div>
      <p className="text-[#234C6A] font-semibold">Memuat Riwayat...</p>
    </div>
  );


  // ================= UI =================
  return(
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-5">

        <h1 className="text-4xl font-extrabold text-[#234C6A] text-center mb-10">
          Riwayat Booking Anda 🗓️
        </h1>

        {/* jika kosong */}
        {riwayat.length === 0 && (
          <div className="bg-white p-10 rounded-xl text-center shadow border">
            <p className="text-gray-500 text-lg">Belum ada booking.</p>
          </div>
        )}


        <div className="space-y-6">
        {riwayat.map(item=>(
          <div key={item.id}
            className={`bg-white p-6 rounded-xl shadow hover:shadow-xl transition border-l-4 ${borderStatus(item.status)}`}>

            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                {statusIcon(item.status)}
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User size={18}/> {item.nama_kendaraan}
                </h2>
              </div>
              {statusBadge(item.status)}
            </div>

            {/* Detail */}
            <div className="grid sm:grid-cols-2 gap-6 text-gray-700 ">
              <Detail icon={<Car/>} title="Jenis Kendaraan" value={item.jenis_kendaraan}/>
              <Detail icon={<Tag/>} title="Jenis Servis" value={item.jenis_service}/>
              <Detail icon={<Calendar/>} title="Tanggal" value={formatDate(item.booking_date)}/>
              <Detail icon={<Phone/>} title="WhatsApp" value={item.no_wa}/>
            </div>

            {item.notes && (
              <div className="mt-6 border-t pt-4">
                <p className="font-semibold flex items-center gap-2 text-[#234C6A]"><BookOpen size={16}/> Catatan</p>
                <p className="bg-gray-50 border p-3 rounded-lg italic text-gray-700 mt-2">{item.notes}</p>
              </div>
            )}

          </div>
        ))}
        </div>

      </div>
    </div>
  );
}


// DETAIL COMPONENT
function Detail({icon,title,value}:{icon:any,title:string,value:string}){
  return(
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-full bg-orange-100 text-orange-600 shadow">{icon}</div>
      <div>
        <p className="text-xs uppercase text-gray-500">{title}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
