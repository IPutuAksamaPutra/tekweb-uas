<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // --- FITUR CUSTOMER ---

    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)->latest()->get();
        return response()->json(['status' => 'success', 'orders' => $orders]);
    }

    public function show(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();
        return response()->json(['status' => 'success', 'order' => $order]);
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
            $result = DB::transaction(function () use ($request) {
                foreach ($request->items as $item) {
                    $product = Product::find($item['product_id']);
                    if (!$product || $product->stock < $item['quantity']) {
                        throw new \Exception("Stok " . ($product->name ?? 'produk') . " tidak cukup");
                    }
                }

                $order = Order::create([
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

                foreach ($request->items as $item) {
                    Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
                }

                Cart::where('user_id', $request->user()->id)->delete();
                return $order;
            });

            return response()->json(['status' => 'success', 'order' => $result], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    // --- FITUR ADMIN (FIX ERROR 500) ---

    public function adminIndex()
    {
        try {
            // Mengambil semua order beserta relasi user (pembeli)
            // Gunakan try-catch agar jika ada relasi yang rusak tidak langsung 500
            $orders = Order::with('user:id,name')->latest()->get();

            $orders->transform(function ($order) {
                $items = $order->items;
                
                // Pastikan items ter-decode (karena di DB tipenya JSON/Text)
                if (is_string($items)) {
                    $items = json_decode($items, true);
                }

                if (is_array($items)) {
                    foreach ($items as &$item) {
                        // Cari nama produk berdasarkan product_id di dalam JSON
                        $p = Product::find($item['product_id'] ?? 0);
                        $item['product_name'] = $p ? $p->name : 'Produk Tidak Terdaftar';
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
            ]);

        } catch (\Throwable $e) {
            // Jika ada error, kirim pesan error aslinya agar bisa didebug
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ], 200); // Kita kirim 200 supaya Frontend bisa baca pesannya
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->update(['status' => $request->status]);
            return response()->json(['status' => 'success', 'message' => 'Status Updated']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}