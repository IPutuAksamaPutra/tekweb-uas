<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Ambil semua order user
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
                        ->orderByDesc('created_at')
                        ->get();

        // Decode items JSON
        $orders->transform(function ($order) {
            $items = $order->items;
            if (is_string($items)) $items = json_decode($items, true) ?: [];
            $order->items = $items;
            return $order;
        });

        return response()->json([
            'message' => 'Daftar pesanan ditemukan',
            'orders' => $orders
        ]);
    }

    // Detail order
    public function show(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)
                      ->where('id', $id)
                      ->firstOrFail();

        $items = $order->items;
        if (is_string($items)) $items = json_decode($items, true) ?: [];
        $order->items = $items;

        return response()->json([
            'message' => 'Detail pesanan',
            'order' => $order
        ]);
    }

    // Buat order baru
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
                        throw new \Exception('Stok produk '.$product->name.' tidak cukup');
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
                    Product::where('id', $item['product_id'])
                           ->decrement('stock', $item['quantity']);
                }

                // Kosongkan cart
                Cart::where('user_id', $request->user()->id)->delete();

                return $newOrder;
            });

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'order' => $order
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // Update status (optional, bisa dipakai superadmin nanti)
    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);
        return response()->json(['message' => 'Status diperbarui']);
    }
}
