<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Exception;

class PromotionController extends Controller
{
    private $allowedRoles = ['admin', 'super_admin'];

    // 1. CARA PALING AMAN: Ambil semua kolom dulu (*) 
    // agar tidak crash jika ada kolom yang belum dibuat di migration
    public function index()
    {
        try {
            $promotions = Promotion::with('products')->get();

            return response()->json([
                'promotions' => $promotions
            ], 200);
        } catch (Exception $e) {
            // Jika error, kita kirim pesan error aslinya agar ketahuan di Console
            return response()->json([
                'message' => 'Database Error',
                'debug' => $e->getMessage() 
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            // Gunakan findOrFail agar jika ID salah, return 404 JSON, bukan 500 HTML
            $promotion = Promotion::with('products')->findOrFail($id);

            return response()->json([
                'promotion' => $promotion
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Promo tidak ditemukan atau error database',
                'debug' => $e->getMessage()
            ], 404);
        }
    }

    // ... (public, store, update, destroy)
}