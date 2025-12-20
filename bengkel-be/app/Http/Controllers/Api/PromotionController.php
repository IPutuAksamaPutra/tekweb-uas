<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;
use Illuminate\Support\Facades\Validator;

class PromotionController extends Controller
{
    private $allowedRoles = ['admin','super_admin'];

    // PERBAIKAN: Pastikan kolom id selalu ada (wajib untuk relasi belongsToMany)
    // Dan pastikan nama kolom img_urls sudah sesuai database
    private $productColumns = ['id', 'name', 'slug', 'price', 'stock', 'jenis_barang', 'img_urls']; 

    public function index()
    {
        // Gunakan array untuk with() agar lebih aman dari error string
        return response()->json([
            'promotions' => Promotion::with(['products' => function($query) {
                $query->select($this->productColumns);
            }])->get()
        ]);
    }

    public function public()
    {
        $promotions = Promotion::with(['products' => function($query) {
                $query->select($this->productColumns);
            }])
            ->where('is_active', 1)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->get();

        return response()->json([
            'message' => 'Promo aktif berhasil diambil',
            'promotions' => $promotions
        ]);
    }

    public function show($id)
    {
        try {
            $promotion = Promotion::with(['products' => function($query) {
                $query->select($this->productColumns);
            }])->findOrFail($id);

            return response()->json([
                'promotion' => $promotion
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Promo tidak ditemukan'], 404);
        }
    }

    // ... (Fungsi store, update, destroy tetap sama) ...
}