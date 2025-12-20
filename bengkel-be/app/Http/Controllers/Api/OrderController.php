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

    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)->orderByDesc('created_at')->get();
        return response()->json(['message' => 'Daftar pesanan ditemukan', 'orders' => $orders]);
    }

    public function show(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();
        return response()->json(['message' => 'Detail pesanan', 'order' => $order]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.subtotal' => 'required|numeric|min:0',
            'name' => 'required|string|max:255',
            'no_tlp' => 'required|string|max:20',
            'address' => 'required|string',
            'delivery' => 'required|in:ambil_di_tempat,kurir',
            'payment' => 'required|in:tunai,transfer',
            'total' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $orderResult = DB::transaction(function () use ($request) {
                foreach ($request->items as $item) {
                    $product = Product::lockForUpdate()->find($item['product_id']);
                    if (!$product || $product->stock < $item['quantity']) {
                        throw new \Exception('Stok produk tidak cukup');
                    }
                }

                $order = Order::create([
                    'user_id' => $request->user()->id,
                    'items'   => $request->items,
                    'name'    => $request->name,
                    'no_tlp'  => $request->no_tlp,
                    'address' => $request->address,
                    'delivery'=> $request->delivery,
                    'payment' => $request->payment,
                    'total'   => $request->total,
                    'status'  => 'pending'
                ]);

                foreach ($request->items as $item) {
                    Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
                }

                Cart::where('user_id', $request->user()->id)->delete();
                return $order;
            });

            return response()->json(['message' => 'Pesanan berhasil dibuat', 'order' => $orderResult], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // ====================================================
    // KHUSUS ADMIN - FIX NAMA PRODUK & ANTI 500
    // ====================================================
    public function adminIndex()
    {
        try {
            // Ambil order + nama user pemesan
            $orders = Order::with('user:id,name')->orderByDesc('created_at')->get();

            $orders->transform(function ($order) {
                $items = $order->items;
                
                // Pastikan items ter-decode dengan benar
                if (is_string($items)) {
                    $items = json_decode($items, true);
                }

                if (is_array($items)) {
                    foreach ($items as &$item) {
                        // Ambil nama produk dari tabel products
                        $product = Product::find($item['product_id']);
                        $item['product_name'] = $product ? $product->name : 'Produk Tidak Ditemukan';
                    }
                } else {
                    $items = [];
                }

                $order->items = $items;
                return $order;
            });

            return response()->json([
                'status' => 'success', 
                'orders' => $orders
            ], 200);

        } catch (\Exception $e) {
            // Biar gak cuma 500, kita kirim pesan errornya ke Frontend
            return response()->json([
                'status' => 'error', 
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->update(['status' => $request->status]);
            return response()->json(['message' => 'Status Updated']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}