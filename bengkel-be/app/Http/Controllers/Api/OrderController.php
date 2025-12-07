<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\CartItem; // Diperlukan untuk proses checkout
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\QueryException;

class OrderController extends Controller
{
    // Batasi akses: Semua harus login, tapi method tertentu dibatasi oleh role
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // ==========================================================
    // 1. INDEX: Menampilkan daftar pesanan (Admin/Kasir Only)
    // ==========================================================
    /**
     * Tampilkan daftar semua pesanan.
     * Endpoint: GET /api/orders
     */
    public function index()
    {
        // PENTING: Implementasikan Role Check di sini
        // Misalnya: if (!auth()->user()->isAdminOrKasir()) { abort(403); }
        
        $orders = Order::with('chartItem')->orderByDesc('create_at')->get();

        return response()->json([
            'message' => 'Daftar pesanan berhasil diambil.',
            'orders' => $orders
        ], 200);
    }

    // ==========================================================
    // 2. STORE: Checkout (Membuat Pesanan)
    // ==========================================================
    /**
     * Proses checkout: Membuat entri pesanan dari keranjang/input user.
     * Endpoint: POST /api/orders
     */
    public function store(Request $request)
    {
        // Catatan: Model Anda mengikat ke satu chart_items_id. 
        // Jika keranjang Anda memiliki banyak item, Anda harus mengulang proses ini, 
        // atau Model Order Anda perlu direvisi.
        
        $validator = Validator::make($request->all(), [
            'cart_items_id' => 'required|exists:cart_items,id', // Diperlukan berdasarkan Model Anda
            'name' => 'required|string|max:255',
            'no_tlp' => 'required|string|max:20',
            'address' => 'required|string',
            'delivery' => 'required|string|in:ambil_di_tempat,kurir',
            'payment' => 'required|string|in:tunai,transfer',
            'subtotal' => 'required|numeric|min:0',
            'postage' => 'required|numeric|min:0',
            'grandTotal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // 1. Dapatkan CartItem (atau kumpulkan data CartItem jika multiple)
        $cartItem = CartItem::find($request->cart_items_id);

        if (!$cartItem) {
             return response()->json(['message' => 'Item keranjang tidak ditemukan.'], 404);
        }

        try {
            // 2. Buat Pesanan
            $order = Order::create($request->all());

            // 3. (Opsional/Penting): Kurangi stok produk, hapus item keranjang
            // Anda harus menambahkan logika ini di sini:
            // $cartItem->product->decrement('stock', $cartItem->quantity);
            // $cartItem->delete();

            return response()->json([
                'message' => 'Pesanan berhasil dibuat (Checkout Selesai).',
                'order' => $order
            ], 201);
            
        } catch (QueryException $e) {
            return response()->json(['message' => 'Gagal memproses pesanan.'], 500);
        }
    }
    
    // ==========================================================
    // 3. SHOW: Detail Pesanan
    // ==========================================================
    /**
     * Tampilkan detail pesanan spesifik.
     * Endpoint: GET /api/orders/{order}
     */
    public function show(Order $order)
    {
        // Pastikan hanya user terkait atau admin yang boleh melihat
        // if ($order->user_id !== auth()->id() && !auth()->user()->isAdminOrKasir()) { abort(403); }
        
        return response()->json([
            'message' => 'Detail pesanan berhasil diambil.',
            'order' => $order->load('chartItem')
        ], 200);
    }
    
    // ==========================================================
    // 4. UPDATE: Mengubah status pesanan (Admin/Kasir Only)
    // ==========================================================
    /**
     * Perbarui status pesanan (Misalnya: 'processing', 'shipped', 'delivered').
     * Endpoint: PUT/PATCH /api/orders/{order}
     */
    public function update(Request $request, Order $order)
    {
        // PENTING: Implementasikan Role Check di sini
        // Misalnya: if (!auth()->user()->isAdminOrKasir()) { abort(403); }
        
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|string|in:processing,shipped,delivered,cancelled', // Tambahkan status yang relevan
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order->update($request->only('status'));

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui.',
            'order' => $order
        ], 200);
    }

    // ==========================================================
    // 5. DESTROY: Menghapus pesanan (Admin Only)
    // ==========================================================
    /**
     * Hapus pesanan.
     * Endpoint: DELETE /api/orders/{order}
     */
    public function destroy(Order $order)
    {
        // PENTING: Implementasikan Role Check (hanya super admin/admin yang boleh menghapus)
        
        $order->delete();

        return response()->json([
            'message' => 'Pesanan berhasil dihapus.'
        ], 200);
    }
}