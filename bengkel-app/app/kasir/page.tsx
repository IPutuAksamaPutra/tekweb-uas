'use client';

import React, { useState, useMemo, useEffect, useCallback, FormEvent } from 'react';
import { Trash2, Search, Plus, CreditCard, Banknote, Landmark, Loader2, UserPlus, Receipt } from 'lucide-react'; 
import { alertSuccess, alertError } from "@/components/Alert";

/* =======================
    TIPE DATA & INTERFACES
======================= */
interface CartItem {
    id: string;
    type: 'product' | 'service_manual' | 'booking_pelunasan';
    name: string;
    price: number;
    quantity: number;
    originalId: number | null;
}

interface Product {
    id: number;
    name: string;
    price?: number;
    stock?: number;
    jenis_barang?: string;
}

interface Booking {
    id: number;
    user_id: number | null;
    jenis_service: string;
    remaining_due?: number;
    nama_kendaraan: string | null;
    user_name?: string;
}

const BASE_URL = 'https://tekweb-uas-production.up.railway.app';
const API_URL = `${BASE_URL}/api`;

/* =======================
    UTILITIES
======================= */
const getAuthToken = (): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    return document.cookie.match(/token=([^;]+)/)?.[1];
};

const isBooking = (item: any): item is Booking => {
    return (item as Booking).jenis_service !== undefined;
};

/* =======================
    FUNGSI CETAK STRUK
======================= */
const printReceipt = (items: CartItem[], total: number, paymentMethod: string, paidAmount: number, change: number) => {
    const date = new Date().toLocaleString('id-ID');
    const receiptContent = `
        <html>
        <head>
            <title>Struk POS - Bengkel Dexar</title>
            <style>
                body { font-family: 'Courier New', Courier, monospace; font-size: 12px; line-height: 1.2; width: 80mm; margin: 0 auto; padding: 20px; color: #000; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .header { margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                .item-row { margin-bottom: 5px; }
                .totals { margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; }
                .footer { margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; font-size: 10px; }
                table { width: 100%; border-collapse: collapse; }
                @media print { body { width: 100%; padding: 0; } }
            </style>
        </head>
        <body>
            <div class="header text-center">
                <h2 style="margin:0">BENGKEL DEXAR</h2>
                <p style="margin:2px">Jl. Udayana No. 10, Singaraja</p>
                <p style="margin:2px">Telp: 0812-3456-7890</p>
            </div>
            <p>Tgl: ${date}<br>Kasir: Administrator</p>
            <p>--------------------------------</p>
            <table>
                ${items.map(item => `
                    <tr class="item-row">
                        <td colspan="2">${item.name}</td>
                    </tr>
                    <tr>
                        <td>${item.quantity} x ${item.price.toLocaleString('id-ID')}</td>
                        <td class="text-right">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</td>
                    </tr>
                `).join('')}
            </table>
            <div class="totals">
                <table>
                    <tr><td><b>TOTAL</b></td><td class="text-right"><b>Rp ${total.toLocaleString('id-ID')}</b></td></tr>
                    <tr><td>Bayar (${paymentMethod})</td><td class="text-right">Rp ${paidAmount.toLocaleString('id-ID')}</td></tr>
                    <tr><td>Kembali</td><td class="text-right">Rp ${change.toLocaleString('id-ID')}</td></tr>
                </table>
            </div>
            <div class="footer text-center">
                <p>Terima kasih atas kunjungan Anda.<br>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
                <p>*** LAYANAN PRIMA MOTOR ANDA ***</p>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(receiptContent);
        printWindow.document.close();
    }
};

/* =======================
    SUB-COMPONENT: JASA MANUAL
======================= */
const ServiceInput: React.FC<{ onAddItem: (item: CartItem) => void }> = ({ onAddItem }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();
        const parsedPrice = parseFloat(price);
        if (!name.trim() || isNaN(parsedPrice) || parsedPrice <= 0) return;

        onAddItem({
            id: `manual-${Date.now()}`,
            type: 'service_manual',
            name: `Jasa: ${name.trim()}`, 
            price: parsedPrice,
            quantity: 1,
            originalId: 0, 
        });
        setName(''); setPrice('');
    };

    return (
        <form onSubmit={handleAdd} className="bg-[#234C6A] rounded-4xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/10 rounded-lg text-white">
                    <Plus size={18} />
                </div>
                <h4 className="font-black text-white uppercase text-xs tracking-widest italic">Biaya Jasa Manual</h4>
            </div>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Nama Layanan (e.g. Stel Klep)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 rounded-2xl border-none bg-white shadow-inner font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                    required
                />
                <input
                    type="number"
                    placeholder="Nominal (Rp)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-4 rounded-2xl border-none bg-white shadow-inner font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF6D1F]"
                    required
                />
                <button type="submit" className="w-full bg-[#FF6D1F] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-lg">
                    Tambah Jasa
                </button>
            </div>
        </form>
    );
};

/* =======================
    SUB-COMPONENT: SEARCH (UNIQUE KEYS FIX)
======================= */
const ItemSearchInput: React.FC<{ onSelect: (item: CartItem) => void }> = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<(Product | Booking)[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchTerm.length < 2) { setResults([]); return; }
        const timer = setTimeout(async () => {
            setLoading(true);
            const token = getAuthToken();
            try {
                const [pRes, bRes] = await Promise.all([
                    fetch(`${API_URL}/products/search/cashier?query=${searchTerm}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
                    fetch(`${API_URL}/bookings/search/cashier?query=${searchTerm}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
                ]);
                const products = pRes.ok ? (await pRes.json()).products || [] : [];
                const bookings = bRes.ok ? (await bRes.json()).data || [] : []; 
                setResults([...products, ...bookings]);
            } catch (error) { setResults([]); } finally { setLoading(false); }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSelect = (item: Product | Booking) => {
        const cartItem: CartItem = isBooking(item) ? {
            id: `booking-${item.id}`,
            type: 'booking_pelunasan',
            name: `Pelunasan: ${item.jenis_service} (${item.user_name || 'Guest'})`, 
            price: item.remaining_due ?? 0,
            quantity: 1,
            originalId: item.id,
        } : {
            id: `prod-${item.id}`,
            type: 'product',
            name: item.name,
            price: item.price ?? 0,
            quantity: 1,
            originalId: item.id,
        };
        onSelect(cartItem);
        setSearchTerm('');
        setResults([]);
    };

    return (
        <div className="relative">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6D1F]" size={20} />
                <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari part motor atau sisa pembayaran booking..."
                    className="w-full pl-12 pr-4 py-5 rounded-3xl border-none bg-white shadow-lg text-slate-800 font-bold focus:ring-2 focus:ring-[#FF6D1F] outline-none"
                />
            </div>
            {(loading || results.length > 0) && (
                <div className="absolute z-50 w-full bg-white rounded-2xl border shadow-2xl mt-2 max-h-80 overflow-y-auto p-2">
                    {loading && <div className="p-4 text-center text-gray-400 font-bold italic">Mencari Data...</div>}
                    {results.map((item: any) => {
                        // FIX: Key unik untuk mencegah React error
                        const uniqueKey = isBooking(item) ? `book-${item.id}` : `prod-${item.id}`;
                        return (
                            <div key={uniqueKey} onClick={() => handleSelect(item)} className="p-4 hover:bg-orange-50 rounded-xl cursor-pointer flex justify-between items-center border-b last:border-0">
                                <div>
                                    <p className="font-black text-[#234C6A] uppercase text-[9px] tracking-widest">{isBooking(item) ? '📅 Booking' : '📦 Part'}</p>
                                    <p className="font-bold text-slate-700">{isBooking(item) ? item.jenis_service : item.name}</p>
                                    {!isBooking(item) && <p className="text-[9px] font-bold text-slate-400 italic">Stok: {item.stock}</p>}
                                </div>
                                <p className="font-black text-[#FF6D1F]">Rp {(isBooking(item) ? item.remaining_due : item.price)?.toLocaleString('id-ID')}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* =======================
    MAIN PAGE
======================= */
const CashierPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Transfer'>('Cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cashReceived, setCashReceived] = useState(0); 
    const [isMount, setIsMount] = useState(false);

    useEffect(() => { setIsMount(true); }, []);

    const total = useMemo(() => cartItems.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0), [cartItems]);
    const change = useMemo(() => paymentMethod === 'Cash' ? cashReceived - total : 0, [paymentMethod, cashReceived, total]);

    const handleAddItem = (item: CartItem) => {
        const index = cartItems.findIndex((i) => i.originalId === item.originalId && i.type === item.type);
        if (index > -1 && item.type === 'product') {
            const updated = [...cartItems];
            updated[index].quantity += 1;
            setCartItems(updated);
        } else {
            setCartItems((prev) => [...prev, item]);
        }
    };

    const handleProcessTransaction = async () => {
        if (cartItems.length === 0) return;
        if (paymentMethod === 'Cash' && change < 0) return alertError('Uang tidak cukup!');

        setIsProcessing(true);
        const token = getAuthToken();

        const transactionData = {
            items: cartItems.map(item => ({ 
                item_id: item.originalId, 
                type: item.type, 
                name: item.name, 
                price: item.price, 
                quantity: item.quantity, 
                subtotal: item.price * item.quantity 
            })),
            total_amount: total,
            payment_method: paymentMethod,
            paid_amount: paymentMethod === 'Cash' ? cashReceived : total, 
            change_amount: change,
        };

        try {
            const response = await fetch(`${API_URL}/cashier/process-transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' },
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                const errJson = await response.json();
                throw new Error(errJson.message || 'Gagal memproses transaksi.');
            }

            alertSuccess("Transaksi Berhasil!");
            printReceipt(cartItems, total, paymentMethod, transactionData.paid_amount, change);
            setCartItems([]);
            setCashReceived(0);
        } catch (error: any) {
            alertError(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isMount) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
                {/* LEFT */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <header className="flex justify-between items-center">
                        <h1 className="text-4xl font-black text-[#234C6A] tracking-tighter uppercase italic">Bengkel<span className="text-orange-500">POS</span></h1>
                    </header>
                    <ItemSearchInput onSelect={handleAddItem} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ServiceInput onAddItem={handleAddItem} />
                        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center grayscale opacity-50">
                            <UserPlus size={40} className="text-gray-300 mb-2" />
                            <p className="font-black text-[#234C6A] text-xs uppercase tracking-widest">Customer Member</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 italic">Soon</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="p-6 text-left">Daftar Item</th>
                                    <th className="p-6 text-center">Qty</th>
                                    <th className="p-6 text-right">Subtotal</th>
                                    <th className="p-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {cartItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50">
                                        <td className="p-6">
                                            <p className="font-black text-[#234C6A] uppercase text-sm">{item.name}</p>
                                            <p className="text-[10px] font-black text-[#FF6D1F] uppercase italic">Rp {item.price.toLocaleString('id-ID')}</p>
                                        </td>
                                        <td className="p-6 text-center font-black text-slate-400">{item.quantity}</td>
                                        <td className="p-6 text-right font-black text-[#234C6A]">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                                        <td className="p-6 text-center">
                                            <button onClick={() => setCartItems(prev => prev.filter(i => i.id !== item.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* RIGHT */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-[#234C6A] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500"><Receipt size={100} /></div>
                        <h2 className="text-xs font-black uppercase tracking-widest mb-2 opacity-60 italic">Grand Total</h2>
                        <p className="text-5xl font-black italic tracking-tighter">Rp {total.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100 space-y-8">
                        <div className="grid grid-cols-3 gap-3">
                            <PaymentButton active={paymentMethod === 'Cash'} onClick={() => setPaymentMethod('Cash')} icon={<Banknote />} label="Tunai" />
                            <PaymentButton active={paymentMethod === 'Card'} onClick={() => setPaymentMethod('Card')} icon={<CreditCard />} label="Kartu" />
                            <PaymentButton active={paymentMethod === 'Transfer'} onClick={() => setPaymentMethod('Transfer')} icon={<Landmark />} label="Bank" />
                        </div>
                        {paymentMethod === 'Cash' && (
                            <div className="space-y-4">
                                <input
                                    type="number"
                                    value={cashReceived || ''}
                                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                                    className="w-full p-5 rounded-2xl bg-gray-50 border-none font-black text-3xl text-[#234C6A] focus:ring-2 focus:ring-[#FF6D1F] outline-none shadow-inner"
                                    placeholder="Uang Cash..."
                                />
                                <div className={`p-5 rounded-2xl flex justify-between items-center ${change < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                                    <span className="text-[10px] font-black uppercase italic tracking-widest">Kembalian</span>
                                    <span className="font-black text-2xl italic">Rp {Math.max(0, change).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        )}
                        <button
                            disabled={isProcessing || (paymentMethod === 'Cash' && change < 0) || cartItems.length === 0}
                            onClick={handleProcessTransaction}
                            className="w-full bg-[#FF6D1F] hover:bg-orange-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-gray-200"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : <><Receipt size={20} /> Selesaikan</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentButton = ({ active, onClick, icon, label }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-orange-50 border-[#FF6D1F] text-[#FF6D1F] scale-105' : 'bg-white border-gray-100 text-gray-400'}`}>
        {icon} <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

export default CashierPage;