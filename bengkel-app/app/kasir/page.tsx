'use client';

import React, { useState, useMemo, useEffect, FormEvent } from 'react';
import { Trash2 } from 'lucide-react'; 

/* =======================
    TIPE DATA (Tidak Berubah)
======================= */
interface CartItem {
    id: string;
    type: 'product' | 'service_manual' | 'booking_pelunasan';
    name: string;
    price: number;
    quantity: number;
    originalId: number | null; // ID produk/booking di database
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
    no_wa: string | null;
    nama_kendaraan: string | null;
    user_name?: string; // Properti yang di-inject dari backend
}

/* =======================
    TYPE GUARD & TOKEN COOKIE (Tidak Berubah)
======================= */
const isBooking = (item: Product | Booking): item is Booking => {
    return (item as Booking).user_id !== undefined && (item as Product).jenis_barang === undefined;
};

const getTokenFromCookies = (): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const name = 'token=';
    const cookies = decodeURIComponent(document.cookie).split(';');
    for (let c of cookies) {
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length);
    }
    return undefined;
};

/* =======================
    INPUT JASA MANUAL (AMAN) (Tidak Berubah)
======================= */
const ServiceInput: React.FC<{ onAddItem: (item: CartItem) => void }> = ({ onAddItem }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();
        
        const trimmedName = name.trim();
        const parsedPrice = parseFloat(price);

        if (!trimmedName || isNaN(parsedPrice) || parsedPrice <= 0) {
            alert("Nama Jasa dan Harga harus diisi dengan benar (tidak boleh kosong atau nol).");
            return;
        }

        onAddItem({
            id: `manual-${Date.now()}`,
            type: 'service_manual',
            name: `Jasa: ${trimmedName}`, 
            price: parsedPrice,
            quantity: 1,
            originalId: null,
        });

        setName('');
        setPrice('');
    };

    return (
        <form onSubmit={handleAdd} className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 shadow text-black">
            <h4 className="font-bold mb-3 text-black">Tambah Jasa Manual</h4>
            <input
                type="text"
                placeholder="Nama Jasa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mb-2 p-2 rounded border text-black placeholder:text-gray-400"
                required
            />
            <input
                type="number"
                placeholder="Harga"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mb-3 p-2 rounded border text-black placeholder:text-gray-400"
                required
                min="1"
            />
            <button type="submit" className="w-full bg-yellow-600 text-black py-2 rounded-lg font-semibold hover:bg-yellow-700">
                Tambah Jasa
            </button>
        </form>
    );
};

/* =======================
    SEARCH INPUT (Tidak Berubah)
======================= */
const ItemSearchInput: React.FC<{ onSelect: (item: CartItem) => void }> = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<(Product | Booking)[]>([]);
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        if (searchTerm.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            const token = getTokenFromCookies();

            try {
                const [pRes, bRes] = await Promise.all([
                    fetch(`${API_URL}/products/search/cashier?q=${searchTerm}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_URL}/bookings/search/cashier?q=${searchTerm}`, { 
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const products = pRes.ok ? (await pRes.json()).products || [] : [];
                const bookings = bRes.ok ? (await bRes.json()).data || [] : []; 

                setResults([...products, ...bookings]);
            } catch (error) {
                 console.error("API Search Failed:", error); 
                 setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, API_URL]);

    const handleSelect = (item: Product | Booking) => {
        let cartItem: CartItem;

        if (isBooking(item)) {
            const bookingItem = item as Booking;
            const customerName = bookingItem.user_name ? ` (${bookingItem.user_name})` : '';

            cartItem = {
                id: `booking-${bookingItem.id}`,
                type: 'booking_pelunasan',
                name: `PELUNASAN: ${bookingItem.jenis_service} (${bookingItem.nama_kendaraan || 'Booking'})${customerName}`, 
                price: bookingItem.remaining_due ?? 0,
                quantity: 1,
                originalId: bookingItem.id,
            };
        } else {
            const productItem = item as Product;
            cartItem = {
                id: `prod-${productItem.id}`,
                type: 'product',
                name: productItem.name,
                price: productItem.price ?? 0,
                quantity: 1,
                originalId: productItem.id,
            };
        }

        onSelect(cartItem);
        setSearchTerm('');
        setResults([]);
    };

    return (
        <div className="relative text-black">
            <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari produk / booking..."
                className="w-full p-4 rounded-xl border shadow text-black placeholder:text-gray-400"
            />

            {/* Kontainer Hasil Pencarian */}
            {(loading || results.length > 0) && (
                <div 
                    className="absolute z-20 w-full bg-white rounded-xl border shadow mt-2 max-h-60 overflow-y-auto text-black"
                >
                    {loading && <p className="p-3 text-center">Memuat...</p>}
                    {!loading &&
                        results.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className="p-3 hover:bg-indigo-50 cursor-pointer border-b"
                            >
                                {isBooking(item) ? (
                                    <>
                                        {/* TAMPILAN NAMA PELANGGAN */}
                                        <p className="font-semibold text-black">
                                            [BOOKING] {item.user_name || item.jenis_service} 
                                        </p>
                                        <p className="text-xs text-green-600">
                                            Sisa: Rp {(item.remaining_due ?? 0).toLocaleString('id-ID')} | Service: {item.jenis_service}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        {/* TAMPILAN NAMA PRODUK */}
                                        <p className="font-semibold text-black">{item.name}</p> 
                                        <p className="text-xs text-gray-500">
                                            Rp {(item.price ?? 0).toLocaleString('id-ID')} | Stok {item.stock ?? 0}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

/* =======================
    HELPER: FUNGSI CETAK STRUK (Tidak Berubah)
======================= */
const printReceipt = (items: CartItem[], total: number, paymentMethod: string, paidAmount: number, change: number) => {
    const date = new Date().toLocaleString('id-ID');
    
    const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Struk Transaksi</title>
            <style>
                body { font-family: monospace; font-size: 10px; margin: 0; padding: 10px; }
                .center { text-align: center; margin-bottom: 10px; }
                .item-list { width: 100%; border-collapse: collapse; margin: 10px 0; }
                .item-list td { padding: 2px 0; }
                .footer { margin-top: 15px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="center">
                <h3>POS BENGKEL DEXAR</h3>
                <p>Jl. UDAYANA, Kota SINGARAJA</p>
                <p>Telp: 0812-9932-1122</p>
            </div>

            <p>----------------------------------</p>
            <p>Tgl: ${date}</p>
            <p>Kasir: VERDY</p>
            <p>----------------------------------</p>

            <table class="item-list">
                ${items.map(item => `
                    <tr>
                        <td colspan="3">${item.name}</td>
                    </tr>
                    <tr>
                        <td>${item.quantity} x ${item.price?.toLocaleString('id-ID')}</td>
                        <td style="text-align: right;">Rp ${((item.price ?? 0) * item.quantity).toLocaleString('id-ID')}</td>
                    </tr>
                `).join('')}
            </table>

            <p>----------------------------------</p>
            <table class="item-list">
                <tr>
                    <td>TOTAL:</td>
                    <td style="text-align: right;">Rp ${total.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                    <td>BAYAR (${paymentMethod}):</td>
                    <td style="text-align: right;">Rp ${paidAmount.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                    <td>KEMBALI:</td>
                    <td style="text-align: right;">Rp ${change.toLocaleString('id-ID')}</td>
                </tr>
            </table>

            <div class="footer">
                <p>--- TERIMA KASIH ---</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.print();
    } else {
        alert('Gagal membuka jendela cetak. Periksa pengaturan browser Anda.');
    }
};

/* =======================
    MAIN PAGE
======================= */
const CashierPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Transfer'>('Cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cashReceived, setCashReceived] = useState(0); 
    
    const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';

    const total = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
        [cartItems]
    );

    // Hitung kembalian
    const change = useMemo(() => {
        if (paymentMethod === 'Cash') {
            return cashReceived - total;
        }
        return 0;
    }, [paymentMethod, cashReceived, total]);

    // Reset cashReceived saat metode pembayaran berubah
    useEffect(() => {
        setCashReceived(0);
    }, [paymentMethod]);


    const handleAddItem = (item: CartItem) => {
        // Cek apakah produk sudah ada di keranjang (hanya berlaku untuk produk fisik)
        const index = cartItems.findIndex(
            (i) => i.originalId === item.originalId && i.type === 'product'
        );

        if (index > -1) {
            const updated = [...cartItems];
            updated[index].quantity += 1;
            setCartItems(updated);
        } else {
            // Untuk service manual dan booking, selalu tambah sebagai item baru
            setCartItems((prev) => [...prev, item]);
        }
    };

    const handleRemoveItem = (id: string) => {
        setCartItems((prev) => prev.filter((i) => i.id !== id));
    };
    
    // FUNGSI UPDATE ITEM DETAIL TIDAK DIGUNAKAN LAGI KARENA INPUT DIHAPUS

    const handleProcessTransaction = async () => {
        if (cartItems.length === 0) {
            alert('Keranjang kosong');
            return;
        }

        // Final check for name before sending (preventing 422 if user deletes name input)
        const isAnyNameEmpty = cartItems.some(item => !item.name || item.name.trim() === '');
        if (isAnyNameEmpty) {
            alert('Nama item tidak boleh kosong.');
            return;
        }


        // VALIDASI UNTUK CASH
        if (paymentMethod === 'Cash' && change < 0) {
            alert('Uang yang diterima kurang dari total belanja.');
            return;
        }

        setIsProcessing(true);
        const token = getTokenFromCookies();

        // Siapkan data yang akan masuk ke tabel Transaksi di backend
        const transactionData = {
            items: cartItems.map(item => ({
                item_id: item.originalId, 
                type: item.type,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
            })),
            total_amount: total,
            payment_method: paymentMethod,
            paid_amount: paymentMethod === 'Cash' ? cashReceived : total, 
            change_amount: change,
        };

        try {
            // Panggilan API ke endpoint baru
            const response = await fetch(`${API_URL}/cashier/process-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(transactionData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Tampilkan error validasi Laravel atau error lainnya
                let errorMessage = data.message || `HTTP Error: ${response.status}`;
                if (data.errors) {
                    // Jika ada error validasi detail dari Laravel
                    errorMessage += "\n\nDetail Error:";
                    Object.values(data.errors).forEach((errs: any) => {
                        errs.forEach((err: any) => {
                            errorMessage += `\n- ${err}`;
                        });
                    });
                }
                throw new Error(errorMessage);
            }

            // Jika API berhasil:
            printReceipt(cartItems, total, paymentMethod, transactionData.paid_amount, change);
            
            // Reset state
            setCartItems([]);
            setPaymentMethod('Cash');
            setCashReceived(0);
            alert('Transaksi berhasil disimpan dan struk dicetak!');

        } catch (error: any) {
            console.error("Transaction Error:", error);
            alert(`TERJADI KESALAHAN:\n\n${error.message || 'Terjadi masalah saat memproses transaksi.'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 lg:p-6 text-black">
            {/* CONTAINER UTAMA - RESPONSIVE GRID */}
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 lg:gap-6">
                
                {/* KOLOM KIRI (Search, Jasa Manual, Keranjang) */}
                {/* Default: Col-span-12 (Full width di Mobile) | Large: Col-span-8 (2/3 width di Desktop) */}
                <div className="col-span-12 lg:col-span-8 space-y-4 lg:space-y-6">
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-black">Point of Sale</h1>

                    <ItemSearchInput onSelect={handleAddItem} />

                    {/* GRUP INPUT JASA MANUAL DAN MANAJEMEN PELANGGAN - RESPONSIVE */}
                    {/* Default: Col-span-1 (Stacked di Mobile) | Large: Col-span-2 (Bersebelahan di Desktop) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <ServiceInput onAddItem={handleAddItem} />
                        <div className="bg-white rounded-xl shadow p-6 text-center text-black">
                            Manajemen Pelanggan (Coming Soon)
                        </div>
                    </div>

                    {/* TABEL KERANJANG */}
                    <div className="bg-white rounded-xl shadow overflow-x-auto">
                        <table className="min-w-full text-sm text-black">
                             <thead className="bg-slate-200">
                                <tr>
                                    <th className="p-3 text-left font-semibold">Item & Harga</th> 
                                    <th className="p-3 text-center font-semibold">Qty</th>
                                    <th className="p-3 text-right font-semibold">Subtotal</th>
                                    <th className="p-3 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        
                                        {/* KOLOM ITEM & HARGA (DISPLAY ONLY) */}
                                        <td className="p-3 min-w-[200px]">
                                            <p className="w-full font-semibold text-black mb-1">
                                                {item.name}
                                            </p>
                                            <div className="flex items-center space-x-1">
                                                <span className="text-sm text-gray-600">Harga Satuan:</span>
                                                <p className="font-bold text-sm text-gray-700">
                                                    Rp {(item.price ?? 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </td>
                                        
                                        {/* KOLOM QTY (DISPLAY ONLY) */}
                                        <td className="p-3 text-center">
                                            <p className="w-16 p-1 text-center font-semibold">
                                                {item.quantity}
                                            </p>
                                        </td>
                                        
                                        <td className="p-3 text-right font-bold min-w-[120px]">
                                            Rp {((item.price ?? 0) * item.quantity).toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => handleRemoveItem(item.id)}>
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* KOLOM KANAN (Checkout & Pembayaran) */}
                {/* Default: Col-span-12 (Full width di Mobile) | Large: Col-span-4 (1/3 width di Desktop) */}
                <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-6 h-fit">
                    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 text-black">
                        <h2 className="text-xl lg:text-2xl font-bold text-black">Checkout</h2>

                        <div className="bg-indigo-600 text-white rounded-xl p-5">
                            <p className="text-sm">Total</p>
                            <p className="text-3xl lg:text-4xl font-extrabold">
                                Rp {total.toLocaleString('id-ID')}
                            </p>
                        </div>

                        {/* Pilihan Metode Pembayaran - Menggunakan grid-cols-3 yang responsif */}
                        <div className="grid grid-cols-3 gap-2">
                            {['Cash', 'Card', 'Transfer'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setPaymentMethod(m as any)}
                                    className={`p-3 rounded-lg font-semibold text-sm ${
                                        paymentMethod === m
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 text-black'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        
                        {/* INPUT UANG TUNAI & KEMBALIAN */}
                        {paymentMethod === 'Cash' && (
                            <div className="space-y-3 pt-2 pb-2 border-t border-gray-200">
                                <label className="text-sm font-semibold block">
                                    Uang Diterima (Tunai)
                                </label>
                                <input
                                    type="number"
                                    value={cashReceived || ''}
                                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                                    placeholder="Masukkan jumlah uang"
                                    className="w-full p-3 rounded-lg border text-black font-bold text-lg"
                                    min={0}
                                />
                                <div className={`p-3 rounded-lg font-bold text-lg text-white ${change < 0 ? 'bg-red-500' : 'bg-green-600'}`}>
                                    Kembalian: Rp {change.toLocaleString('id-ID')}
                                </div>
                            </div>
                        )}

                        <button
                            disabled={isProcessing || (paymentMethod === 'Cash' && change < 0) || cartItems.length === 0}
                            onClick={handleProcessTransaction}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg lg:text-xl disabled:bg-gray-400"
                        >
                            {isProcessing ? 'Memproses...' : 'SELESAIKAN TRANSAKSI'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashierPage;