<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Models\Product; // Digunakan untuk memverifikasi produk
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    // Pastikan user sudah login untuk menggunakan semua method di bawah
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // ==========================================================
    // 1. INDEX: Menampilkan semua item dalam keranjang pengguna
    // ==========================================================
    /**
     * Tampilkan daftar item keranjang belanja pengguna yang sedang login.
     */
    public function index()
    {
        $userId = auth()->id();
        
        $cartItems = CartItem::with('product')
                            ->where('user_id', $userId)
                            ->get();

        return response()->json([
            'message' => 'Daftar item keranjang berhasil diambil.',
            'cart_items' => $cartItems
        ], 200);
    }

    // ==========================================================
    // 2. STORE: Menambahkan atau memperbarui item di keranjang
    // ==========================================================
    /**
     * Tambahkan item baru ke keranjang atau tingkatkan kuantitas item yang sudah ada.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = auth()->id();
        $productId = $request->product_id;
        $quantity = $request->quantity;

        // Cek apakah item sudah ada di keranjang pengguna
        $cartItem = CartItem::where('user_id', $userId)
                            ->where('product_id', $productId)
                            ->first();

        if ($cartItem) {
            // Item sudah ada, update kuantitasnya
            $cartItem->quantity += $quantity;
            $cartItem->save();
            $message = 'Kuantitas produk di keranjang berhasil diperbarui.';
        } else {
            // Item belum ada, buat item baru
            $cartItem = CartItem::create([
                'user_id' => $userId, // Pastikan Anda menambahkan 'user_id' ke Model CartItem $fillable
                'product_id' => $productId,
                'quantity' => $quantity,
            ]);
            $message = 'Produk berhasil ditambahkan ke keranjang.';
        }

        return response()->json([
            'message' => $message,
            'cart_item' => $cartItem->load('product')
        ], 201);
    }

    // ==========================================================
    // 3. UPDATE: Mengubah kuantitas item tertentu
    // ==========================================================
    /**
     * Mengubah kuantitas item keranjang yang sudah ada.
     */
    public function update(Request $request, CartItem $cartItem)
    {
        // Pastikan item keranjang dimiliki oleh pengguna yang sedang login
        if ($cartItem->user_id !== auth()->id()) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        return response()->json([
            'message' => 'Kuantitas berhasil diubah.',
            'cart_item' => $cartItem->load('product')
        ], 200);
    }

    // ==========================================================
    // 4. DESTROY: Menghapus item dari keranjang
    // ==========================================================
    /**
     * Menghapus item keranjang yang sudah ada.
     */
    public function destroy(CartItem $cartItem)
    {
        // Pastikan item keranjang dimiliki oleh pengguna yang sedang login
        if ($cartItem->user_id !== auth()->id()) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $cartItem->delete();

        return response()->json([
            'message' => 'Item berhasil dihapus dari keranjang.'
        ], 200);
    }
}