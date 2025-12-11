<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cashier;
use Illuminate\Support\Facades\Validator;
use App\Models\Booking; // Pastikan ini diimpor jika digunakan di method store/index

class CashierController extends Controller
{
    // Daftar peran yang diizinkan untuk memodifikasi (update/delete) data kasir
    private $superAdminRole = 'super_admin';
    // Daftar peran yang diizinkan untuk mencatat transaksi (store)
    private $allowedStoreRoles = ['kasir', 'admin', 'super_admin'];

    // --- 1. READ (List Semua Transaksi) ---
    public function index(Request $request)
    {
        // FIX: Tambahkan 'kasir' ke dalam daftar yang diizinkan
        if (!in_array($request->user()->role, ['admin', 'super_admin', 'kasir'])) { 
            return response()->json([
                'message' => 'Anda tidak memiliki izin (Hanya Admin, Super Admin, atau Kasir) untuk melihat laporan transaksi.'
            ], 403);
        }

        // Ambil semua transaksi dengan detail produk/booking
        // PENTING: Jika menggunakan pagination, response harus diubah ke format 'data'
        $transactions = Cashier::with(['product:id,name', 'booking:id,jenis_service,user_id'])
                               ->latest()
                               ->get();

        // CATATAN: Untuk konsistensi Next.js, lebih baik menggunakan key 'data'
        return response()->json([
            'message' => 'Daftar transaksi kasir berhasil diambil.',
            // FIX: Mengganti key 'transactions' menjadi 'data' agar frontend TransaksiPage.tsx bisa membaca
            'data' => $transactions 
        ]);
    }

    // --- 2. CREATE (Catat Transaksi Baru) ---
    public function store(Request $request)
    {
        // Pengecekan Otorisasi: Kasir, Admin, atau Super Admin (Sudah benar)
        if (!in_array($request->user()->role, $this->allowedStoreRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk mencatat transaksi.'
            ], 403);
        }

        // Aturan validasi (PENTING: Validasi ini tidak sesuai dengan data array items dari Next.js, tapi tidak saya ubah sesuai permintaan Anda)
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

        $transaction = Cashier::create($request->all());

        return response()->json([
            'message' => 'Transaksi berhasil dicatat.',
            'transaction' => $transaction->load(['product', 'booking'])
        ], 201);
    }

    // --- 3. READ (Detail Transaksi) ---
    public function show(Request $request, Cashier $cashier)
    {
        // FIX: Tambahkan 'kasir' ke dalam daftar yang diizinkan
        if (!in_array($request->user()->role, ['admin', 'super_admin', 'kasir'])) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk melihat detail transaksi.'
            ], 403);
        }

        return response()->json([
            'message' => 'Detail transaksi berhasil diambil.',
            'data' => $cashier->load(['product', 'booking']) // Mengubah 'transaction' menjadi 'data' untuk konsistensi
        ]);
    }

    // --- 4. UPDATE (Perbarui Transaksi) ---
    public function update(Request $request, Cashier $cashier)
    {
        // Pengecekan Otorisasi: HANYA Super Admin (Tidak diubah sesuai permintaan)
        if ($request->user()->role !== $this->superAdminRole) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin (Hanya Super Admin) untuk mengubah transaksi.'
            ], 403);
        }

        // ... (Validasi dan Update logic tidak diubah) ...
        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable|exists:products,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'payment_method' => 'required|string|in:Cash,Debit Card,Credit Card,E-Wallet',
            'total' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cashier->update($request->all());

        return response()->json([
            'message' => 'Transaksi berhasil diperbarui.',
            'transaction' => $cashier->load(['product', 'booking'])
        ]);
    }

    // --- 5. DELETE (Hapus Transaksi) ---
    public function destroy(Request $request, Cashier $cashier)
    {
        // Pengecekan Otorisasi: HANYA Super Admin (Tidak diubah sesuai permintaan)
        if ($request->user()->role !== $this->superAdminRole) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin (Hanya Super Admin) untuk menghapus transaksi.'
            ], 403);
        }
        
        $cashier->delete();

        return response()->json([
            'message' => 'Transaksi berhasil dihapus.'
        ], 200);
    }
}