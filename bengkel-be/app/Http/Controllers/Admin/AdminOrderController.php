<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\DB; // Gunakan DB Builder agar lebih stabil

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Ambil data mentah dari tabel orders
            $orders = Order::orderByDesc('created_at')->get();

            $orders->transform(function ($order) {
                // Pastikan items adalah array (antisipasi jika casting di model gagal)
                $items = is_string($order->items) ? json_decode($order->items, true) : $order->items;

                if (is_array($items)) {
                    foreach ($items as &$item) {
                        // Cari nama produk langsung ke database tanpa lewat Model Product
                        $product = DB::table('products')->where('id', $item['product_id'] ?? 0)->first();
                        $item['product_name'] = $product ? $product->name : 'Produk Tidak Terdaftar';
                    }
                }
                
                $order->items = is_array($items) ? $items : [];
                return $order;
            });

            return response()->json([
                'message' => 'Daftar pesanan ditemukan',
                'orders' => $orders
            ], 200);

        } catch (\Throwable $e) {
            // Mengirim detail error asli agar Anda bisa melihat penyebabnya di Network Tab
            return response()->json([
                'message' => 'Backend Error: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed'
        ]);

        try {
            $order = Order::findOrFail($id);
            $order->update(['status' => $request->status]);

            return response()->json(['message' => 'Status diperbarui'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}