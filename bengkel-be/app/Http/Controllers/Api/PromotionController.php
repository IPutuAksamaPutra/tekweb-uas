<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;
use Illuminate\Support\Facades\Validator;
use Exception;

class PromotionController extends Controller
{
    private $allowedRoles = ['admin', 'super_admin'];

    /**
     * Pastikan kolom 'id' selalu ada karena Laravel membutuhkan 'id' 
     * untuk menghubungkan relasi belongsToMany melalui tabel pivot.
     */
    private $productColumns = ['id', 'name', 'slug', 'price', 'stock', 'jenis_barang', 'img_urls'];

    public function index()
    {
        try {
            $promotions = Promotion::with(['products' => function ($query) {
                $query->select($this->productColumns);
            }])->get();

            return response()->json([
                'promotions' => $promotions
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function public()
    {
        try {
            $promotions = Promotion::with(['products' => function ($query) {
                $query->select($this->productColumns);
            }])
            ->where('is_active', 1)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->get();

            return response()->json([
                'message' => 'Promo aktif berhasil diambil',
                'promotions' => $promotions
            ], 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Gagal mengambil promo'], 500);
        }
    }

    public function show($id)
    {
        try {
            $promotion = Promotion::with(['products' => function ($query) {
                $query->select($this->productColumns);
            }])->findOrFail($id);

            return response()->json([
                'promotion' => $promotion
            ], 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Promo tidak ditemukan'], 404);
        }
    }

    public function store(Request $request)
    {
        if (!in_array($request->user()->role, $this->allowedRoles)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:promotions',
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

        $promo = Promotion::create($request->except('product_ids'));

        if ($request->has('product_ids')) {
            $promo->products()->attach($request->product_ids);
        }

        return response()->json(['message' => 'Promo dibuat', 'promo' => $promo], 201);
    }

    public function update(Request $request, $id)
    {
        if (!in_array($request->user()->role, $this->allowedRoles)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $promotion = Promotion::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|unique:promotions,name,' . $promotion->id,
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

            $promotion->update($request->except('product_ids'));

            if ($request->has('product_ids')) {
                $promotion->products()->sync($request->product_ids);
            }

            return response()->json(['message' => 'Promo diupdate'], 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Gagal update promo'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        if (!in_array($request->user()->role, $this->allowedRoles)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $promotion = Promotion::findOrFail($id);
            $promotion->delete();
            return response()->json(['message' => 'Promo dihapus'], 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Gagal menghapus promo'], 500);
        }
    }
}