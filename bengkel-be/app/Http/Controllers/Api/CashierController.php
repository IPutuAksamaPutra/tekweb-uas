<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cashier; 
use Illuminate\Support\Facades\Validator;
use App\Models\Booking;

use App\Models\Transaction; // Digunakan untuk Transaksi POS baru
use App\Models\TransactionItem; 
use App\Models\Product; 
use Illuminate\Support\Facades\DB; 
use Illuminate\Support\Facades\Log; // PENTING: Untuk logging error

class CashierController extends Controller
{
    private $superAdminRole = 'super_admin';
    private $allowedStoreRoles = ['kasir', 'admin', 'super_admin'];
    private $allowedReportRoles = ['kasir', 'admin', 'super_admin']; // Role untuk melihat laporan

    // 🔥 PERUBAHAN UTAMA: Method index mengambil data dari Model Transaction (POS) dan Model Booking (Order Selesai)
    public function index(Request $request)
    {
        if (!in_array($request->user()->role, $this->allowedReportRoles)) { 
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk melihat laporan transaksi.'
            ], 403);
        }

        // --- 1. Ambil Data Transaksi POS Baru (Model Transaction) ---
        $posTransactions = Transaction::with('items')->latest()->get()->map(function ($t) {
            
            // Logika untuk menentukan item utama dan jenis transaksi
            $items = $t->items;
            $namaUtama = 'Transaksi Non-Itemized';
            $jenis = 'Campuran';
            
            if ($items->isNotEmpty()) {
                $uniqueTypes = $items->pluck('item_type')->unique();

                if ($uniqueTypes->count() === 1) {
                    $type = $uniqueTypes->first();
                    if ($type === 'product') $jenis = 'Produk';
                    else if ($type === 'booking_pelunasan') $jenis = 'Booking';
                    else if ($type === 'service_manual') $jenis = 'Jasa Manual';
                }

                $namaUtama = $items->first()->item_name;
                if ($items->count() > 1) {
                    $namaUtama .= ' (+' . ($items->count() - 1) . ' item)';
                }
            }

            return [
                'id' => $t->id,
                'transaction_date' => $t->transaction_date,
                'total_amount' => $t->total_amount,
                'payment_method' => $t->payment_method,
                'status' => 'Lunas', // Asumsi Transaksi POS selalu Lunas
                'jenis' => $jenis,
                'nama_item_utama' => $namaUtama,
                'items' => $items, // Sertakan detail item untuk pemrosesan frontend
                // Tambahkan field lain jika diperlukan
            ];
        });


        // --- 2. Ambil Data Order/Booking yang Selesai (Model Booking) ---
        $completedBookings = Booking::where('status', 'Completed')
            ->orWhere('status', 'Lunas')
            ->with('user:id,name')
            ->latest()
            ->get()
            ->map(function ($b) {
                $customerName = $b->user->name ?? 'Pelanggan';
                
                return [
                    'id' => $b->id,
                    'transaction_date' => $b->updated_at, // Gunakan waktu update/complete
                    'total_amount' => $b->total_price ?? 0, // Asumsi Model Booking memiliki total_price
                    'payment_method' => $b->payment_method ?? 'N/A', // Ambil metode pembayaran yang disimpan
                    'status' => 'Lunas',
                    'jenis' => 'Pelunasan Order',
                    'nama_item_utama' => "Order #{$b->id} ({$b->jenis_service}) - {$customerName}",
                    'items' => null, // Order/Booking tidak memiliki array items standar ini
                    // Tambahkan field lain jika diperlukan
                ];
            });

        // --- 3. Gabungkan dan Urutkan Data ---
        $allTransactions = $posTransactions->merge($completedBookings);
        
        // Urutkan ulang berdasarkan tanggal transaksi gabungan
        $sortedTransactions = $allTransactions->sortByDesc('transaction_date')->values();


        return response()->json([
            'message' => 'Daftar riwayat transaksi berhasil diambil (Gabungan POS dan Order).',
            'data' => $sortedTransactions 
        ]);
    }

    // --- 2. CREATE (store) --- (MENGGUNAKAN MODEL LAMA: CASHIER)
    public function store(Request $request)
    {
        if (!in_array($request->user()->role, $this->allowedStoreRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk mencatat transaksi.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable|exists:products,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'payment_method' => 'required|string|in:Cash,Debit Card,Credit Card,E-Wallet',
            'total' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'is_valid' => 'required_without_all:product_id,booking_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // 🔥 Menggunakan Model Cashier LAMA
        $transaction = Cashier::create($request->all()); 

        return response()->json([
            'message' => 'Transaksi berhasil dicatat.',
            'transaction' => $transaction->load(['product', 'booking'])
        ], 201);
    }
    
    // 🔥 METHOD BARU: processTransaction (Menggunakan Model Transaction BARU)
    public function processTransaction(Request $request)
    {
        if (!in_array($request->user()->role, $this->allowedStoreRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk memproses transaksi kasir.'
            ], 403);
        }

        // 1. Validasi Input dari Frontend (Array items)
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'nullable|integer', 
            'items.*.type' => 'required|string|in:product,service_manual,booking_pelunasan',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.name' => 'required|string|max:255', 
            'items.*.price' => 'required|numeric|min:0',
            'items.*.subtotal' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:Cash,Card,Transfer',
            'paid_amount' => 'required|numeric|min:0', 
            'change_amount' => 'required|numeric', 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Memulai Transaction Database (Atomicity)
        DB::beginTransaction();

        try {
            // A. Simpan Transaksi Utama (Ke tabel 'transactions')
            $transaction = Transaction::create([ 
                'cashier_user_id' => $request->user()->id,
                'payment_method' => $request->payment_method,
                'total_amount' => $request->total_amount,
                'paid_amount' => $request->paid_amount,
                'change_amount' => $request->change_amount,
                'transaction_date' => now(), 
            ]);

            $itemsToStore = [];
            
            // B. Simpan Detail Item dan Lakukan Update Stok/Status
            foreach ($request->items as $item) {
                
                $productId = ($item['type'] === 'product') ? $item['item_id'] : null;
                $bookingId = ($item['type'] === 'booking_pelunasan') ? $item['item_id'] : null;

                $itemsToStore[] = [
                    'transaction_id' => $transaction->id,
                    'product_id' => $productId,
                    'booking_id' => $bookingId,
                    'item_type' => $item['type'],
                    'item_name' => $item['name'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // C. Update Database yang Relevan
                if ($item['type'] === 'product') {
                    // Pengecekan produk dan stok yang lebih aman
                    $product = Product::find($productId);
                    if ($product) {
                        if ($product->stock >= $item['quantity']) {
                            // 🔥🔥 INI ADALAH BARIS PENGURANGAN STOK PRODUK 🔥🔥
                            Product::where('id', $productId)->decrement('stock', $item['quantity']);
                        } else {
                            // Stok tidak mencukupi
                            throw new \Exception("Stok produk '{$item['name']}' tidak mencukupi. Sisa stok: {$product->stock}.");
                        }
                    } else {
                         // Produk tidak ditemukan
                         throw new \Exception("Produk ID: {$productId} ('{$item['name']}') tidak ditemukan di database.");
                    }
                   
                } elseif ($item['type'] === 'booking_pelunasan') {
                    // Update status booking menjadi Selesai (Completed)
                    $updatedRows = Booking::where('id', $bookingId)->update([
                        'status' => 'Completed',
                        'payment_method' => $request->payment_method 
                    ]);

                    // PENTING: Periksa apakah ada baris yang benar-benar terupdate
                    if ($updatedRows === 0) {
                         // Ini terpicu jika Booking tidak ditemukan (ID salah, atau status sudah Completed/Lunas)
                         throw new \Exception("Gagal menemukan atau mengupdate Booking ID: {$bookingId}. Pastikan booking ada dan statusnya belum 'Completed'.");
                    }
                }
            }
            
            // Mass Insert detail item (lebih efisien)
            TransactionItem::insert($itemsToStore);
            
            DB::commit();

            return response()->json([
                'message' => 'Transaksi kasir berhasil diproses dan disimpan.',
                'transaction_id' => $transaction->id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            // PENTING: Mengembalikan detail error EKSPLISIT ke frontend.
            Log::error("Transaction Failed: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Gagal memproses transaksi.', 
                'error_detail' => $e->getMessage() // Memberikan detail error PHP/SQL/Business Logic
            ], 500);
        }
    }

    // --- 3. READ (show) --- (MENGGUNAKAN MODEL LAMA: CASHIER)
    public function show(Request $request, Cashier $cashier)
    {
        if (!in_array($request->user()->role, $this->allowedReportRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk melihat detail transaksi.'
            ], 403);
        }

        return response()->json([
            'message' => 'Detail transaksi berhasil diambil.',
            // 🔥 Menggunakan Model Cashier LAMA
            'data' => $cashier->load(['product', 'booking']) 
        ]);
    }
    
    // ... (metode update dan destroy yang masih menggunakan Model Cashier lama, tidak diubah)
    
}