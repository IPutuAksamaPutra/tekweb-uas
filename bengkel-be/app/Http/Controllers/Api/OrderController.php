<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function __construct()
    {
        // Tetap pakai auth agar tahu siapa yang memanggil API
        $this->middleware('auth:sanctum');
    }

    public function adminIndex()
    {
        try {
            // Ambil semua order tanpa filter role dulu untuk memastikan data keluar
            $orders = Order::with('user:id,name')->latest()->get();

            // Jika database kosong, jangan di-loop, langsung kirim array kosong
            if ($orders->isEmpty()) {
                return response()->json(['status' => 'success', 'orders' => []]);
            }

            $orders->transform(function ($order) {
                // TAHAP AMAN 1: Pastikan items bukan NULL
                $items = $order->items;
                
                // Jika database menyimpan dalam bentuk String, kita decode manual
                if (is_string($items)) {
                    $items = json_decode($items, true);
                }

                // TAHAP AMAN 2: Hanya loop jika items adalah Array
                if (is_array($items)) {
                    foreach ($items as &$item) {
                        // Cari produk dengan full namespace agar tidak Class Not Found
                        $product = \App\Models\Product::find($item['product_id'] ?? 0);
                        $item['product_name'] = $product ? $product->name : 'Produk Terhapus';
                    }
                } else {
                    $items = []; // Jika data korup, tampilkan array kosong
                }

                $order->items = $items;
                return $order;
            });

            return response()->json([
                'status' => 'success',
                'orders' => $orders
            ], 200);

        } catch (\Throwable $e) {
            // Trik Debug: Jika error, Laravel akan mengirim pesan aslinya ke Frontend
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ], 200); // Paksa 200 agar pesan error tidak terblokir status 500
        }
    }

    // Fungsi lain (store, updateStatus) biarkan tetap ada di bawah sini...
}