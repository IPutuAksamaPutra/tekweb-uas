<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PromotionController extends Controller
{
    // Daftar peran yang diizinkan untuk mengelola promosi
    private $allowedRoles = ['admin', 'super_admin'];

    // --- 1. READ (List Semua Promosi) ---
    /**
     * Menampilkan daftar semua promosi.
     */
    public function index(Request $request)
    {
        // Pengecekan Otorisasi: Hanya Admin dan Super Admin
        if (!in_array($request->user()->role, $this->allowedRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk melihat daftar promosi.'
            ], 403);
        }

        // Ambil semua promosi, dengan relasi produk yang ditautkan
        $promotions = Promotion::with('products:id,name,price')->get();

        return response()->json([
            'message' => 'Daftar promosi berhasil diambil.',
            'promotions' => $promotions
        ]);
    }

    // --- 2. CREATE (Simpan Promosi Baru) ---
    /**
     * Menyimpan data promosi baru.
     */
    public function store(Request $request)
    {
        if (!in_array($request->user()->role, $this->allowedRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk membuat promosi.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:promotions,name',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
            // Array product_ids bersifat opsional saat membuat, tapi harus array jika ada
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id', // Memastikan setiap ID produk valid
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 1. Buat Promosi
        $promotion = Promotion::create($request->except('product_ids'));

        // 2. Tautkan Produk (Attach) jika product_ids ada
        if ($request->has('product_ids')) {
            // Metode attach() akan memasukkan ID ke tabel pivot
            $promotion->products()->attach($request->product_ids); 
        }

        return response()->json([
            'message' => 'Promosi berhasil dibuat.',
            'promotion' => $promotion->load('products:id,name,price')
        ], 201);
    }

    // --- 3. READ (Detail Promosi) ---
    /**
     * Menampilkan detail promosi spesifik.
     */
    public function show(Request $request, Promotion $promotion)
    {
        if (!in_array($request->user()->role, $this->allowedRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk melihat detail promosi.'
            ], 403);
        }

        return response()->json([
            'message' => 'Detail promosi berhasil diambil.',
            'promotion' => $promotion->load('products:id,name,price')
        ]);
    }

    // --- 4. UPDATE (Perbarui Promosi & Relasi) ---
    /**
     * Memperbarui data promosi yang ada, termasuk menautkan/melepaskan produk.
     */
    public function update(Request $request, Promotion $promotion)
    {
        if (!in_array($request->user()->role, $this->allowedRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk memperbarui promosi.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:promotions,name,' . $promotion->id,
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 1. Update data promosi
        $promotion->update($request->except('product_ids'));

        // 2. Sinkronkan Produk (Sync): Ini menghapus semua produk yang tidak ada 
        //    dalam list baru, dan menambahkan yang baru.
        if ($request->has('product_ids')) {
            $promotion->products()->sync($request->product_ids);
        } else {
            // Jika product_ids tidak dikirim, lepaskan semua relasi yang ada (detach all)
            $promotion->products()->sync([]);
        }

        return response()->json([
            'message' => 'Promosi berhasil diperbarui.',
            'promotion' => $promotion->load('products:id,name,price')
        ]);
    }

    // --- 5. DELETE (Hapus Promosi) ---
    /**
     * Menghapus promosi. Relasi pivot akan otomatis dihapus (cascade).
     */
    public function destroy(Request $request, Promotion $promotion)
    {
        if (!in_array($request->user()->role, $this->allowedRoles)) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk menghapus promosi.'
            ], 403);
        }
        
        $promotion->delete();

        return response()->json([
            'message' => 'Promosi berhasil dihapus.'
        ], 200);
    }
}