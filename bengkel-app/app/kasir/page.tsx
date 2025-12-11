// app/kasir/page.tsx
'use client'; 

import React, { useState, useMemo, useEffect, FormEvent } from 'react'; 
import { useRef } from 'react'; 

// --- Tipe Data (Interface) ---
interface CartItem {
    id: string; 
    type: 'product' | 'service_manual' | 'booking_pelunasan';
    name: string;
    price: number;
    quantity: number;
    originalId: number | null; 
}

interface Product { id: number; name: string; price: number; type: 'product' | 'service'; }
interface Booking { 
    id: number; 
    code: string; 
    user_id: number | null;
    jenis_service: string; 
    remaining_due: number;
    no_wa: string | null;
    nama_kendaraan: string | null;
}

// --- Tipe Guard untuk Type Narrowing ---
const isBooking = (item: Product | Booking): item is Booking => {
    return (item as Booking).code !== undefined;
};

// --- Helper untuk Mengambil Token dari Cookies (Native API) ---
const getTokenFromCookies = (): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    
    const cookieName = 'token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookieName) === 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return undefined;
};
// ---------------------------------------------------------------------------------------


// --- Komponen Pembantu 1: Service Input ---
const ServiceInput: React.FC<{ onAddItem: (item: CartItem) => void }> = ({ onAddItem }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();
        if (name && price) {
            onAddItem({
                id: `manual-${Date.now().toString()}`,
                type: 'service_manual',
                name,
                price: parseFloat(price),
                quantity: 1,
                originalId: null,
            });
            setName('');
            setPrice('');
        }
    };
    
    return (
        <form onSubmit={handleAdd} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold mb-2 text-yellow-800">Tambah Layanan Manual (Jasa)</h4>
            <input
                type="text"
                placeholder="Nama Layanan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-2 w-full mb-2 rounded"
                required
            />
            <input
                type="number"
                placeholder="Biaya (Rp)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border p-2 w-full mb-3 rounded"
                required
            />
            <button type="submit" className="bg-yellow-600 text-white p-2 rounded w-full hover:bg-yellow-700">
                Tambah Jasa
            </button>
        </form>
    );
};


// --- Komponen Pembantu 2: Input Pencarian Dinamis ---
const ItemSearchInput: React.FC<{ onSelect: (item: CartItem) => void }> = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<(Product | Booking)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';

    const fetchItems = async (query: string) => {
        if (!query || query.length < 2) { 
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        const token = getTokenFromCookies();
        
        try {
            const [productsRes, bookingsRes] = await Promise.all([
                // Menggunakan endpoint /kasir/products/search yang lebih unik
                fetch(`${API_URL}/kasir/products/search?search=${query}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                
                fetch(`${API_URL}/bookings/pending/search?search=${query}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const productsData: Product[] = productsRes.ok ? (await productsRes.json()).data || [] : [];
            const bookingsData: Booking[] = bookingsRes.ok ? (await bookingsRes.json()).data || [] : [];

            const allItems = [...productsData, ...bookingsData];
            
            const filtered = allItems.filter(item => {
                const queryLower = query.toLowerCase();
                
                if (isBooking(item)) {
                    // Item adalah Booking.
                    const codeMatch = (item.code ?? '').toLowerCase().includes(queryLower);
                    const serviceMatch = (item.jenis_service ?? '').toLowerCase().includes(queryLower);
                    const waMatch = (item.no_wa ?? '').toLowerCase().includes(queryLower);
                    const kendaraanMatch = (item.nama_kendaraan ?? '').toLowerCase().includes(queryLower);
                    
                    return codeMatch || serviceMatch || waMatch || kendaraanMatch;
                } else {
                    // Item adalah Product.
                    const nameMatch = (item.name ?? '').toLowerCase().includes(queryLower);
                    return nameMatch;
                }
            });
            
            setSearchResults(filtered);

        } catch (error) {
            console.error("Gagal mengambil data pencarian:", error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems(searchTerm);
    }, [searchTerm]);

    const handleItemClick = (item: Product | Booking) => {
        let cartItem: CartItem;

        if (isBooking(item)) { 
            const identifier = item.no_wa || item.nama_kendaraan || `ID User: ${item.user_id}`;
            
            cartItem = {
                id: `booking-${item.id}`,
                type: 'booking_pelunasan',
                name: `PELUNASAN (${identifier}): ${item.jenis_service} (${item.code})`,
                price: item.remaining_due,
                quantity: 1,
                originalId: item.id
            };
        } else { 
            const productItem = item as Product;
            cartItem = {
                id: `prod-${productItem.id}`,
                type: productItem.type === 'service' ? 'service_manual' : 'product',
                name: productItem.name,
                price: productItem.price,
                quantity: 1,
                originalId: productItem.id
            };
        }
        onSelect(cartItem);
        setSearchTerm(''); 
        setSearchResults([]);
    };

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Cari Produk, Jasa, atau Booking ID / No. WA / Kendaraan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-3 w-full rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
            />
            
            {searchTerm && (searchResults.length > 0 || isLoading) && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
                    {isLoading && <p className="p-3 text-center text-gray-500">Memuat...</p>}
                    {!isLoading && searchResults.map((item) => {
                        
                        if (isBooking(item)) {
                            const identifier = item.no_wa || item.nama_kendaraan || `ID User: ${item.user_id}`;
                            
                            return (
                                <div
                                    key={`b-${item.id}`}
                                    onClick={() => handleItemClick(item)}
                                    className="p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                                >
                                    <p className="font-semibold text-gray-900">
                                        <span className="text-xs font-normal text-red-500 mr-2">[BOOKING]</span>
                                        {identifier} | {item.jenis_service} ({item.code})
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Pelunasan: Rp {item.remaining_due.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            );
                        } else {
                            const p: Product = item; 
                            return (
                                <div
                                    key={`p-${p.id}`}
                                    onClick={() => handleItemClick(p)}
                                    className="p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                                >
                                    <p className="font-semibold text-gray-900">
                                        {p.name} 
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Harga: Rp {p.price.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            );
                        }
                    })}
                </div>
            )}
            {searchTerm && !isLoading && searchResults.length === 0 && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-xl p-3 text-center text-gray-500">
                    Tidak Ditemukan.
                </div>
            )}
        </div>
    );
};


// --- Halaman Utama Kasir ---

const CashierPage: React.FC = () => {
    // FIX Error 2304/7006: Menambahkan tipe CartItem[] ke useState
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Transfer'>('Cash');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // FIX Error 2304/7006: useMemo dengan tipe yang eksplisit
    const total = useMemo(() => {
        return cartItems.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);
    }, [cartItems]);
    
    // FIX Error 7006: Parameter item harus CartItem
    const handleAddItem = (item: CartItem) => {
        const existingItemIndex = cartItems.findIndex((i: CartItem) => 
            i.originalId === item.originalId && i.type !== 'service_manual' && i.type !== 'booking_pelunasan'
        );

        if (existingItemIndex > -1) {
            const updatedCart = [...cartItems];
            updatedCart[existingItemIndex].quantity += 1;
            setCartItems(updatedCart);
        } else {
            // FIX Error 7006: Menambahkan tipe prev
            setCartItems((prev: CartItem[]) => [...prev, item]);
        }
    };
    
    // FIX Error 7006: Parameter prev dan item harus CartItem[]
    const handleRemoveItem = (id: string) => {
        setCartItems((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== id));
    };

    // Fungsi Cetak Struk (Dengan pemanggilan di handleProcessTransaction)
    const printReceipt = (transactionDetail: any) => {
        const finalTotal = transactionDetail.total; 
        const items = transactionDetail.items || cartItems;

        const receiptContent = `
            <div style="font-family: monospace; font-size: 10px; width: 250px;">
                <h3 style="text-align: center; font-size: 14px;">BENGKEL MAJU JAYA</h3>
                <p style="text-align: center;">Jl. Merdeka No. 123</p>
                <p>----------------------------------</p>
                <p>Tgl: ${new Date().toLocaleDateString()} Jam: ${new Date().toLocaleTimeString()}</p>
                <p>ID Transaksi: ${transactionDetail.transaction_id || 'N/A'}</p>
                <p>----------------------------------</p>
                ${items.map((item: CartItem) => `
                    <p>${item.name}</p>
                    <p style="text-align: right;">${item.quantity} x ${item.price.toLocaleString('id-ID')} = ${(item.price * item.quantity).toLocaleString('id-ID')}</p>
                `).join('')}
                <p>----------------------------------</p>
                <p style="font-weight: bold; text-align: right; font-size: 12px;">TOTAL: Rp ${finalTotal.toLocaleString('id-ID')}</p>
                <p>Metode: ${transactionDetail.payment_method}</p>
                <p style="text-align: center;">----------------------------------</p>
                <p style="text-align: center;">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
            </div>
        `;

        const printWindow = window.open('', '', 'height=600,width=400');
        if (printWindow) {
            printWindow.document.write(receiptContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    // Logika handleProcessTransaction (Integrasi Token)
    const handleProcessTransaction = async () => {
        if (cartItems.length === 0) {
            alert('Keranjang kosong. Tambahkan item terlebih dahulu.');
            return;
        }

        setIsProcessing(true);
        
        // --- PENYESUAIAN DATA UNTUK CONTROLLER LARAVEL LAMA (product_id/booking_id tunggal) ---
        const primaryItem = cartItems[0] || null;
        let productId = null;
        let bookingId = null;

        if (primaryItem && primaryItem.originalId !== null) {
            if (primaryItem.type === 'product' || primaryItem.type === 'service_manual') {
                productId = primaryItem.originalId; 
            } else if (primaryItem.type === 'booking_pelunasan') {
                bookingId = primaryItem.originalId;
            }
        }
        
        // Format tanggal yang diharapkan Laravel (YYYY-MM-DD HH:MM:SS)
        const formattedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // Data yang dikirim ke API (HANYA MENGIRIM SATU SET FK + KOLOM WAJIB)
        const transactionData = {
            'total': total,
            'payment_method': paymentMethod,
            'transaction_date': formattedDate, // FIX: Menambahkan transaction_date
            'is_valid': 1, // FIX: Menambahkan is_valid (untuk required_without_all)
            
            'product_id': productId,
            'booking_id': bookingId,
            
            // CATATAN: Array 'items' tidak dikirim karena Controller Laravel yang Anda miliki tidak dirancang untuknya.
        };
        // --- AKHIR PENYESUAIAN ---

        
        const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api'; 
        const token = getTokenFromCookies();

        if (!token) {
            alert('Akses ditolak. Token otentikasi tidak ditemukan. Silakan login kembali.');
            setIsProcessing(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/cashier`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                const errorResult = await response.json();
                
                // Menangani detail validasi 422
                if (response.status === 422 && errorResult.errors) {
                    const validationMessages = Object.values(errorResult.errors).flat().join('; ');
                    throw new Error(`Validasi Gagal: ${validationMessages}`);
                }
                
                // Menangani error otorisasi/server
                if (response.status === 401 || response.status === 403) {
                    throw new Error("Akses ditolak. Token tidak valid atau kedaluwarsa.");
                }
                throw new Error(errorResult.message || `Kode status: ${response.status}`);
            }

            const result = await response.json();
            
            alert(`Transaksi berhasil! ID: ${result.transaction_id}. Total: Rp ${total.toLocaleString('id-ID')}`);
            
            // PEMANGGILAN STRUK SAAT PEMBAYARAN SUKSES
            printReceipt({ 
                transaction_id: result.transaction_id, 
                items: cartItems, 
                total: total,
                payment_method: paymentMethod 
            }); 
            // ------------------------------------------

            setCartItems([]);
            setPaymentMethod('Cash');

        } catch (error) {
            console.error('Error saat proses transaksi:', error);
            alert(`Transaksi gagal. Error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <div className="flex space-x-6 h-full">
            
            {/* KOLOM KIRI: INPUT DAN KERANJANG */}
            <div className="w-2/3 space-y-6 flex flex-col">
                
                <h1 className="text-3xl font-extrabold text-gray-800">Point of Sale (POS)</h1>
                
                {/* 1. INPUT ITEM (Produk, Jasa, Booking) */}
                <ItemSearchInput onSelect={handleAddItem} />

                <div className="grid grid-cols-2 gap-4">
                    {/* Input Layanan Manual */}
                    <ServiceInput onAddItem={handleAddItem} />
                    
                    {/* Placeholder Fitur Lain */}
                    <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <p className="text-sm text-gray-600">Fitur: Manajemen Pelanggan</p>
                    </div>
                </div>

                {/* 2. DAFTAR ITEM KERANJANG */}
                <h2 className="text-xl font-semibold border-b pb-2 pt-4">Detail Keranjang ({cartItems.length} Item)</h2>
                <div className="bg-white rounded-lg shadow-xl flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase w-1/2">Item & Keterangan</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Qty</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Subtotal</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cartItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        <div className={`text-xs ${item.type === 'booking_pelunasan' ? 'text-red-600' : 'text-green-600'}`}>
                                            {item.type === 'booking_pelunasan' ? 'Pelunasan Booking' : item.type === 'service_manual' ? 'Jasa Manual' : 'Produk'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-800">
                                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button 
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-red-500 hover:text-red-700 font-medium text-xs"
                                        >
                                            [X]
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {cartItems.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">Tambahkan produk, jasa, atau pelunasan booking untuk memulai transaksi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* KOLOM KANAN: RINGKASAN & PEMBAYARAN */}
            <div className="w-1/3 p-6 bg-white rounded-xl shadow-2xl h-min sticky top-4 self-start">
                <h2 className="text-2xl font-bold mb-4 text-indigo-700 border-b pb-2">Checkout</h2>
                
                {/* Total Pembayaran */}
                <div className="flex flex-col justify-between my-4 p-4 bg-indigo-600 text-white rounded-lg shadow-lg">
                    <span className="text-lg font-light">TOTAL AKHIR</span>
                    <span className="text-4xl font-extrabold mt-1">
                        Rp {total.toLocaleString('id-ID')}
                    </span>
                </div>

                {/* Input Bayar (Kembalian) */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Uang Diterima (Bayar)</h3>
                    <input 
                        type="number" 
                        placeholder="Rp 0" 
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-xl focus:border-green-500" 
                    />
                </div>
                
                <h3 className="text-lg font-semibold mt-4 mb-2">Metode Pembayaran</h3>
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {['Cash', 'Card', 'Transfer'].map(method => (
                        <button
                            key={method}
                            onClick={() => setPaymentMethod(method as 'Cash' | 'Card' | 'Transfer')}
                            className={`p-3 border-2 rounded-lg transition-all text-sm font-semibold ${
                                paymentMethod === method 
                                    ? 'bg-blue-600 text-white border-blue-700 shadow-md' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                        >
                            {method}
                        </button>
                    ))}
                </div>

                {/* Tombol Proses Transaksi */}
                <button
                    onClick={handleProcessTransaction}
                    disabled={isProcessing || cartItems.length === 0}
                    className={`w-full p-4 rounded-lg text-white text-xl font-bold transition-colors shadow-lg ${
                        isProcessing || cartItems.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-700 hover:bg-green-800'
                    }`}
                >
                    {isProcessing ? 'Memproses Transaksi...' : 'SELESAIKAN TRANSAKSI'}
                </button>
            </div>
        </div>
    );
};

export default CashierPage;