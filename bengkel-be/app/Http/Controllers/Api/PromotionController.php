<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class PromotionController extends Controller
{
    // List role yang diizinkan (opsional, biasanya diatur di Middleware)
    private $allowedRoles = ['admin', 'super_admin'];

    /**
     * TAMPILKAN SEMUA PROMO
     */
    public function index()
    {
        try {
            $promotions = Promotion::with('products')->latest()->get();
            return response()->json([
                'success' => true,
                'data' => $promotions
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Database Error',
                'debug' => $e->getMessage() 
            ], 500);
        }
    }

    /**
     * SIMPAN PROMO BARU
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'required|boolean',
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        DB::beginTransaction();
        try {
            $promotion = Promotion::create($request->only([
                'name', 'discount_type', 'discount_value', 'start_date', 'end_date', 'is_active'
            ]));

            // Sinkronisasi produk ke tabel pivot
            $promotion->products()->attach($request->product_ids);

            DB::commit();
            return response()->json(['message' => 'Promo berhasil dibuat', 'data' => $promotion], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal simpan promo', 'debug' => $e->getMessage()], 500);
        }
    }

    /**
     * TAMPILKAN DETAIL PROMO
     */
    public function show($id)
    {
        try {
            $promotion = Promotion::with('products')->findOrFail($id);
            return response()->json([
                'promotion' => $promotion
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Promo tidak ditemukan',
                'debug' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * UPDATE PROMO (Fix Error 500)
     */
    public function update(Request $request, $id)
    {
        // Validasi input
        $request->validate([
            'name' => 'required|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'required',
            'product_ids' => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            $promotion = Promotion::findOrFail($id);
            
            // Update data utama
            $promotion->update($request->only([
                'name', 'discount_type', 'discount_value', 'start_date', 'end_date', 'is_active'
            ]));

            // SINKRONISASI PRODUK (Menghapus yang lama, menambah yang baru)
            // Ini bagian krusial agar tidak error 500
            if ($request->has('product_ids')) {
                $promotion->products()->sync($request->product_ids);
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Promosi berhasil diperbarui!',
                'data' => $promotion->load('products')
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Update Error: " . $e->getMessage());
            return response()->json([
                'message' => 'Gagal update promo',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * HAPUS PROMO
     */
    public function destroy($id)
    {
        try {
            $promotion = Promotion::findOrFail($id);
            // Hapus relasi di tabel pivot dulu agar tidak error constraint
            $promotion->products()->detach();
            $promotion->delete();

            return response()->json(['message' => 'Promo berhasil dihapus'], 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Gagal hapus promo', 'debug' => $e->getMessage()], 500);
        }
    }
}