<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller; // Gunakan base controller Laravel
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
    // LIST PESANAN USER
    // ====================================================
    public function index(Request $request)
    {
        // 🔥 Tambahkan with('user') agar nama pembeli muncul
        $orders = Order::with('user:id,name')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'message' => 'Daftar pesanan ditemukan',
            'orders'  => $orders
        ]);
    }

    // ====================================================
    // DETAIL PESANAN
    // ====================================================
    public function show(Request $request, $id)
    {
        $order = Order::with('user:id,name')
            ->where('user_id', $request->user()->id)
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
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $order = DB::transaction(function () use ($request) {

                // 1. CEK & KUNCI STOK PRODUK
                foreach ($request->items as $item) {
                    $product = Product::lockForUpdate()->find($item['product_id']);

                    if (!$product) {
                        throw new \Exception('Produk tidak ditemukan');
                    }

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception('Stok produk "'.$product->name.'" tidak cukup');
                    }
                }

                // 2. SIMPAN ORDER
                $newOrder = Order::create([
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

                // 3. KURANGI STOK PRODUK
                foreach ($request->items as $item) {
                    Product::where('id', $item['product_id'])
                        ->decrement('stock', $item['quantity']);
                }

                // 4. KOSONGKAN CART
                Cart::where('user_id', $request->user()->id)->delete();

                return $newOrder;
            });

            // 🔥 Load relasi user sebelum dikirim balik ke frontend
            $order->load('user:id,name');

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'order'   => $order
            ], 201);

        } catch (\Exception $e) {
            Log::error('ORDER ERROR: '.$e->getMessage());
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // ====================================================
    // KHUSUS ADMIN (DIPANGGIL NEXT.JS ADMIN PAGE)
    // ====================================================
    public function adminIndex()
    {
        $orders = Order::with('user:id,name')->latest()->get();

        // Map setiap order untuk mengisi nama produk secara manual
        $orders->transform(function ($order) {
            $items = is_string($order.items) ? json_decode($order.items, true) : $order.items;
            
            if (is_array($items)) {
                foreach ($items as &$item) {
                    // Cari nama produk berdasarkan product_id
                    $product = \App\Models\Product::find($item['product_id']);
                    $item['product_name'] = $product ? $product->name : 'Produk Tidak Ditemukan';
                }
            }
            
            $order->items = $items;
            return $order;
        });

        return response()->json([
            'status' => 'success',
            'orders' => $orders
        ]);
    }
}