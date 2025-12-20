<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // ===================== USER =====================
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
                        ->orderByDesc('created_at')
                        ->get();

        return response()->json([
            'message' => 'Daftar pesanan ditemukan',
            'orders' => $orders
        ]);
    }

    public function show(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)
                      ->where('id', $id)
                      ->firstOrFail();

        return response()->json([
            'message' => 'Detail pesanan',
            'order' => $order
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'name' => 'required|string',
            'no_tlp' => 'required|string',
            'address' => 'required|string',
            'total' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $order = DB::transaction(function () use ($request) {
                // Cek stok
                foreach ($request->items as $item) {
                    $product = Product::find($item['product_id']);
                    if (!$product || $product->stock < $item['quantity']) {
                        throw new \Exception('Stok produk '.($product?->name ?? 'Tidak Ditemukan').' tidak cukup');
                    }
                }

                // Buat order
                $newOrder = Order::create([
                    'user_id' => $request->user()->id,
                    'items' => $request->items,
                    'name' => $request->name,
                    'no_tlp' => $request->no_tlp,
                    'address' => $request->address,
                    'delivery' => $request->delivery ?? 'kurir',
                    'payment' => $request->payment ?? 'transfer',
                    'total' => $request->total,
                    'status' => 'pending'
                ]);

                // Kurangi stok
                foreach ($request->items as $item) {
                    Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
                }

                // Hapus cart user
                Cart::where('user_id', $request->user()->id)->delete();

                return $newOrder;
            });

            return response()->json(['message' => 'Pesanan berhasil', 'order' => $order], 201);

        } catch (\Exception $e) {
            Log::error($e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // ===================== ADMIN =====================
    public function adminIndex()
    {
        try {
            $orders = Order::with('user:id,name')
                           ->orderByDesc('created_at')
                           ->get();

            $orders->transform(function ($order) {
                $itemsRaw = $order->items;

                if (is_string($itemsRaw)) {
                    $itemsRaw = json_decode($itemsRaw, true);
                }

                if (is_array($itemsRaw)) {
                    foreach ($itemsRaw as &$item) {
                        $p = Product::find($item['product_id']);
                        $item['product_name'] = $p ? $p->name : 'Sparepart Tidak Ditemukan';
                    }
                } else {
                    $itemsRaw = [];
                }

                $order->items = $itemsRaw;
                return $order;
            });

            return response()->json([
                'status' => 'success',
                'orders' => $orders
            ], 200);

        } catch (\Exception $e) {
            Log::error($e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 200);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,success,canceled'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json(['message' => 'Status order berhasil diupdate']);
    }
}
