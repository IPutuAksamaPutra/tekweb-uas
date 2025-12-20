<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product; // 🔥 WAJIB ADA
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Fungsi store, index, show tetap seperti sebelumnya...

    public function adminIndex()
    {
        try {
            // 1. Ambil semua order dengan relasi user
            $orders = Order::with('user:id,name')->latest()->get();

            // 2. Transform data untuk menyisipkan nama produk
            $orders->transform(function ($order) {
                // Pastikan items adalah array (karena sudah di-cast di Model)
                $items = $order->items;
                
                if (is_string($items)) {
                    $items = json_decode($items, true);
                }

                if (is_array($items)) {
                    foreach ($items as &$item) {
                        // Cari produk di DB menggunakan ID yang ada di JSON
                        $product = Product::find($item['product_id']);
                        
                        // 🔥 Suntikkan product_name agar bisa dibaca Next.js
                        $item['product_name'] = $product ? $product->name : 'Produk Tidak Ditemukan';
                    }
                }

                $order->items = $items;
                return $order;
            });

            // 3. Kembalikan Response dengan Header CORS manual (Extra Safe)
            return response()->json([
                'status' => 'success',
                'orders' => $orders
            ], 200)
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->header('Access-Control-Allow-Credentials', 'true');

        } catch (\Exception $e) {
            Log::error("ADMIN ORDER ERROR: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->update(['status' => $request->status]);

            return response()->json(['message' => 'Status Updated'], 200)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Credentials', 'true');
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}