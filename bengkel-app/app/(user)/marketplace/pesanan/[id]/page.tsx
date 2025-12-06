"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Package, Truck, Wallet, MapPin, Calendar, ShoppingBag } from "lucide-react";

interface Order {
    orderId: string;
    date: string;
    status: 'Menunggu Pembayaran' | 'Diproses' | 'Dikirim' | 'Selesai';
    items: { id: number; name: string; price: number; qty: number }[];
    subtotal: number;
    shippingMethod: string;
    shippingCost: number;
    paymentMethod: string;
    total: number;
    recipientName: string;
    address: string;
    phone: string;
}

const STATUS_STEPS = [
    { key:'Menunggu Pembayaran', title:'Menunggu Pembayaran', icon:Wallet },
    { key:'Diproses', title:'Pesanan Diproses', icon:Package },
    { key:'Dikirim', title:'Sedang Dikirim', icon:Truck },
    { key:'Selesai', title:'Pesanan Selesai', icon:CheckCircle },
];

const StatusTimeline = ({ currentStatus }: { currentStatus: Order['status'] }) => {
    const index = STATUS_STEPS.findIndex(s=>s.key===currentStatus);

    return (
        <div className="relative pt-6">
            <div className="absolute top-8 left-6 w-1 bg-gray-200 h-[calc(100%-4rem)]"></div>

            {STATUS_STEPS.map((s,i)=>{
                const Icon = s.icon;
                const done = i<=index;
                const active = i===index;

                return (
                    <div key={s.key} className="flex items-start mb-10 relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center
                            ${done? active?"bg-[#FF6D1F] ring-4 ring-[#FF6D1F]/40":"bg-[#234C6A]":'bg-gray-300'}`}>
                            <Icon size={22} className={done?'text-white':'text-gray-500'} />
                        </div>

                        <div className={`ml-4 p-4 rounded-xl shadow w-full transition
                            ${active?'bg-[#FF6D1F] text-white scale-[1.03]':
                            done?'bg-white border border-[#234C6A]/30 text-[#234C6A]':
                            'bg-gray-100 text-gray-500'}`}>
                            <h3 className="font-bold text-lg">{s.title}</h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default function DetailPesananPage() {
    const [order,setOrder]=useState<Order|null>(null);

    useEffect(()=>{
        const data=localStorage.getItem("latestOrder");
        if(data) setOrder(JSON.parse(data));
    },[]);

    if(!order) return (
        <div className="text-center py-20">
            <p>Tidak ada pesanan ditemukan</p>
            <a href="/pesanan" className="text-blue-600 underline">Kembali</a>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">

                <div className="bg-white p-6 rounded-xl shadow border-l-8 border-[#FF6D1F] mb-8">
                    <h1 className="text-3xl font-extrabold text-[#234C6A] flex gap-2">
                        <ShoppingBag/> Detail Pesanan
                    </h1>
                    <p>ID Pesanan: <b>{order.orderId}</b></p>
                    <p className="flex gap-1 text-sm text-gray-600">
                        <Calendar size={16}/> {order.date}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow mb-8">
                    <h2 className="text-xl font-bold border-b pb-2 text-[#234C6A]">Status Pesanan</h2>
                    <StatusTimeline currentStatus={order.status}/>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    
                    <div className="bg-white p-6 rounded-xl shadow space-y-2">
                        <h2 className="font-bold text-[#234C6A] border-b pb-2 mb-3 flex gap-2"><MapPin/> Pengiriman</h2>
                        <p>Penerima: <b>{order.recipientName}</b></p>
                        <p>No. Hp: {order.phone}</p>
                        <p>Alamat: {order.address}</p>
                        <p>Kurir: {order.shippingMethod}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow space-y-2">
                        <h2 className="font-bold text-[#234C6A] border-b pb-2">Ringkasan Harga</h2>
                        <p>Subtotal: <b>Rp {order.subtotal.toLocaleString()}</b></p>
                        <p>Ongkir: <b>Rp {order.shippingCost.toLocaleString()}</b></p>
                        <p className="text-xl font-bold text-[#FF6D1F]">Total: Rp {order.total.toLocaleString()}</p>
                        <h3 className="mt-3 font-bold border-b pb-2">Item</h3>
                        {order.items.map(i=>(
                            <p key={i.id}>{i.name} ({i.qty}x)</p>
                        ))}
                    </div>

                </div>

                <a href="/marketplace/pesanan" className="block text-center mt-10 text-[#234C6A] hover:text-[#FF6D1F] font-semibold">
                    <ArrowLeft className="inline"/> Kembali
                </a>
            </div>
        </div>
    );
}