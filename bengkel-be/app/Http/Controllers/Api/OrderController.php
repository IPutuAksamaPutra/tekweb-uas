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

    // ====================================================
    // 1. LIST PESANAN USER (Halaman History Pelanggan)
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
    // 2. DETAIL PESANAN
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
    // 3. CHECKOUT / STORE (Simpan Pesanan Baru)
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
            $orderResult = DB::transaction(function () use ($request) {
                // A. Cek Stok Produk
                foreach ($request->items as $item) {
                    $product = Product::lockForUpdate()->find($item['product_id']);
                    if (!$product) throw new \Exception('Produk tidak ditemukan');
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception('Stok produk "'.$product->name.'" tidak cukup');
                    }
                }

                // B. Simpan Order
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

                // C. Kurangi Stok
                foreach ($request->items as $item) {
                    Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
                }

                // D. Kosongkan Cart
                Cart::where('user_id', $request->user()->id)->delete();

                return $order;
            });

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'order'   => $orderResult
            ], 201);

        } catch (\Exception $e) {
            Log::error('ORDER ERROR: '.$e->getMessage());
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // ====================================================
    // 4. KHUSUS ADMIN (Dipanggil Next.js AdminOrdersPage)
    // ====================================================
    public function adminIndex()
    {
        // Ambil semua pesanan beserta data User yang memesan
        $orders = Order::with('user:id,name')->latest()->get();

        // Transform data untuk menyuntikkan 'product_name' ke dalam JSON items
        $orders->transform(function ($order) {
            $items = is_string($order->items) ? json_decode($order->items, true) : $order->items;
            
            if (is_array($items)) {
                foreach ($items as &$item) {
                    // Cari nama asli barang berdasarkan product_id
                    $product = Product::find($item['product_id']);
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

    // ====================================================
    // 5. UPDATE STATUS (Dipanggil Admin untuk ubah status)
    // ====================================================
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,shipped,completed'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui',
            'order'   => $order
        ]);
    }
}