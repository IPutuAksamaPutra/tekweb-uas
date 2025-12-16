<?php

namespace App\Http\Controllers\Api;

use Illuminate\Routing\Controller;
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

    // ====================================================
    // LIST PESANAN USER (TIDAK DIUBAH)
    // ====================================================
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'message' => 'Daftar pesanan ditemukan',
            'orders'  => $orders
        ]);
    }

    // ====================================================
    // DETAIL PESANAN (TIDAK DIUBAH)
    // ====================================================
    public function show(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'message' => 'Detail pesanan',
            'order'   => $order
        ]);
    }

    // ====================================================
    // CHECKOUT (DITAMBAHKAN PENGURANGAN STOK)
    // ====================================================
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
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::transaction(function () use ($request, &$order) {

                // ==========================================
                // 1. CEK & KUNCI STOK PRODUK
                // ==========================================
                foreach ($request->items as $item) {
                    $product = Product::lockForUpdate()->find($item['product_id']);

                    if (!$product) {
                        abort(404, 'Produk tidak ditemukan');
                    }

                    if ($product->stock < $item['quantity']) {
                        abort(400, 'Stok produk "'.$product->name.'" tidak cukup');
                    }
                }

                // ==========================================
                // 2. SIMPAN ORDER (FLOW LAMA TETAP)
                // ==========================================
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

                // ==========================================
                // 3. KURANGI STOK PRODUK
                // ==========================================
                foreach ($request->items as $item) {
                    Product::where('id', $item['product_id'])
                        ->decrement('stock', $item['quantity']);
                }

                // ==========================================
                // 4. KOSONGKAN CART (FLOW LAMA)
                // ==========================================
                Cart::where('user_id', $request->user()->id)->delete();
            });

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'order'   => $order
            ], 201);

        } catch (\Exception $e) {
            Log::error('ORDER ERROR: '.$e->getMessage());

            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
