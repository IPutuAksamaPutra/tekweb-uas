"use client"

import { useEffect, useState } from "react";
import DropdownSearch from "@/components/admin/DropdownSearch";

// Ambil token dari cookie
const getToken = ()=>document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,"$1");

export default function KasirPage(){

  const [jenis,setJenis]=useState<"produk"|"booking">("produk");

  const [form,setForm]=useState({
    product_id:null as number|null,
    booking_id:null as number|null,
    nama:"", harga:"", qty:1, service:"",
    extraName:"",extraPrice:"", payment:"Cash", bayar:""
  });

  const [produk,setProduk]=useState<any[]>([]);
  const [booking,setBooking]=useState<any[]>([]);
  const token=getToken();


  // ===================== GET DATA =====================
  useEffect(()=>{
    fetch("http://localhost:8000/api/products")
      .then(r=>r.json())
      .then(res=>{
        const list=res.products||res.data||[];
        setProduk(list.map((p:any)=>({id:p.id,name:p.name,price:p.price})));
      });

    fetch("http://localhost:8000/api/bookings",{
      headers:{...(token?{Authorization:`Bearer ${token}`}:{})},
      credentials:"include"
    })
      .then(r=>r.json())
      .then(res=>{
        const list=res.bookings||res.data||[];
        setBooking(list.map((b:any)=>({
          id:b.id,user:b.user?.name||`User-${b.user_id}`,service:b.jenis_service
        })));
      });
  },[]);


  // ===================== PERHITUNGAN =====================
  const subtotal=Number(form.harga||0)*(jenis==="produk"?form.qty:1);
  const total=subtotal+Number(form.extraPrice||0);
  const kembali=form.bayar?Number(form.bayar)-total:0;


  // ===================== SIMPAN TRANSAKSI =====================
  const prosesBayar=async()=>{
    if(!form.nama||!form.harga||!form.bayar){
      alert("Lengkapi semua input terlebih dahulu!");
      return;
    }

    const payload={
      product_id:jenis==="produk"?form.product_id:null,
      booking_id:jenis==="booking"?form.booking_id:null,
      payment_method:form.payment,
      total,
      transaction_date:new Date().toISOString().slice(0,19).replace("T"," "),
      is_valid:true
    };

    const res=await fetch("http://localhost:8000/api/cashier",{
      method:"POST",
      headers:{ "Content-Type":"application/json",Authorization:`Bearer ${token}` },
      body:JSON.stringify(payload)
    });

    const data=await res.json();

    if(res.ok){
      alert("Transaksi berhasil disimpan ✔");
      setForm({product_id:null,booking_id:null,nama:"",harga:"",qty:1,service:"",
        extraName:"",extraPrice:"",payment:"Cash",bayar:""});
    }else{
      alert("Gagal menyimpan transaksi ❌");
      console.log(data);
    }
  };



  // ===================== UI =====================
  return(
    <div className="min-h-screen flex justify-center items-center p-6 
      bg-linear-to-br from-sky-50 via-white to-slate-100">

      <div className="w-full max-w-[700px] bg-white rounded-3xl shadow-2xl p-10 border
                      space-y-8 transition-all">

        {/* TITLE */}
        <div className="text-center mb-3">
          <h1 className="text-4xl font-bold text-[#234C6A] drop-shadow-sm">
            💳 Kasir Bengkel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Transaksi Pembelian Produk & Service Booking
          </p>
        </div>


        {/* ================= FORM RAPIH URUTAN ================= */}
        <div className="space-y-6">

          {/* Jenis Transaksi */}
          <div>
            <label className="font-semibold block mb-1">Jenis Transaksi</label>
            <select value={jenis}
              onChange={e=>setJenis(e.target.value as any)}
              className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-teal-400">
              <option value="produk">🛍 Produk</option>
              <option value="booking">🔧 Booking</option>
            </select>
          </div>

          {/* PRODUK DROPDOWN */}
          {jenis==="produk" && (
            <DropdownSearch
              data={produk}
              label="Cari Produk"
              display={(x)=>`${x.name} — Rp${x.price.toLocaleString()}`}
              onSelect={(x)=>setForm({...form,nama:x.name,harga:x.price,product_id:x.id,booking_id:null})}
            />
          )}

          {/* BOOKING DROPDOWN */}
          {jenis==="booking" && (
            <DropdownSearch
              data={booking}
              label="Pilih Booking / User"
              display={(x)=>`${x.user} — ${x.service}`}
              onSelect={(x)=>setForm({...form,nama:x.user,service:x.service,product_id:null,booking_id:x.id,harga:""})}
            />
          )}

          {/* SERVICE (INFORMASI) */}
          {jenis==="booking" && form.service && (
            <input readOnly value={form.service}
              className="border p-3 rounded-xl w-full bg-gray-100 font-medium"/>
          )}


          {/* HARGA */}
          <div>
            <label className="font-semibold block mb-1">Harga</label>
            <input type="number" placeholder="Harga"
              className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-teal-400"
              value={form.harga}
              onChange={e=>setForm({...form,harga:e.target.value})}/>
          </div>

          {/* QTY HANYA PRODUK */}
          {jenis==="produk" && (
            <div>
              <label className="font-semibold block mb-1">Quantity</label>
              <input type="number" min={1}
                className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-teal-400"
                value={form.qty}
                onChange={e=>setForm({...form,qty:Number(e.target.value)})}/>
            </div>
          )}

          {/* BIAYA TAMBAHAN */}
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Biaya Tambahan"
              className="border p-3 rounded-xl"
              value={form.extraName}
              onChange={e=>setForm({...form,extraName:e.target.value})}/>
            <input type="number" placeholder="Rp"
              className="border p-3 rounded-xl"
              value={form.extraPrice}
              onChange={e=>setForm({...form,extraPrice:e.target.value})}/>
          </div>

          {/* METODE BAYAR */}
          <div>
            <label className="font-semibold block mb-1">Metode Pembayaran</label>
            <select value={form.payment}
              onChange={e=>setForm({...form,payment:e.target.value})}
              className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-teal-400">
              <option>Cash</option>
              <option>Debit Card</option>
              <option>Credit Card</option>
              <option>E-Wallet</option>
            </select>
          </div>


          {/* TOTAL */}
          <div className="text-center font-bold text-2xl p-4 rounded-2xl bg-gray-50 border">
            Total : <span className="text-orange-600">Rp {total.toLocaleString()}</span>
          </div>

          {/* BAYAR */}
          <input type="number" placeholder="Nominal Bayar"
            className="border p-3 rounded-xl w-full text-lg focus:ring-2 focus:ring-teal-400"
            value={form.bayar}
            onChange={e=>setForm({...form,bayar:e.target.value})}/>

          {/* KEMBALIAN */}
          <p className="text-center font-bold text-xl">
            Kembalian: 
            <span className={`${kembali<0?"text-red-500":"text-green-600"} ml-1`}>
              Rp {kembali.toLocaleString()}
            </span>
          </p>

          {/* SIMPAN */}
          <button onClick={prosesBayar}
            className="bg-[#234C6A] hover:bg-[#16364a] active:scale-95 text-white 
            font-bold w-full p-4 rounded-xl shadow-lg text-lg transition">
            Simpan Transaksi
          </button>

        </div>
      </div>
    </div>
  );
}
