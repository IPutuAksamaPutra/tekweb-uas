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
    // 1. LIST PESANAN MILIK USER SENDIRI (Customer)
    // ====================================================
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status'  => 'success',
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
            'status'  => 'success',
            'order'   => $order
        ]);
    }

    // ====================================================
    // 3. CHECKOUT (Simpan Pesanan)
    // ====================================================
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items'    => 'required|array',
            'name'     => 'required|string',
            'no_tlp'   => 'required|string',
            'address'  => 'required|string',
            'total'    => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $orderResult = DB::transaction(function () use ($request) {
                // Cek stok
                foreach ($request->items as $item) {
                    $product = Product::find($item['product_id']);
                    if (!$product || $product->stock < $item['quantity']) {
                        throw new \Exception('Stok ' . ($product->name ?? 'produk') . ' tidak cukup');
                    }
                }

                // Buat Order
                $order = Order::create([
                    'user_id'  => $request->user()->id,
                    'items'    => $request->items,
                    'name'     => $request->name,
                    'no_tlp'   => $request->no_tlp,
                    'address'  => $request->address,
                    'delivery' => $request->delivery ?? 'kurir',
                    'payment'  => $request->payment ?? 'transfer',
                    'total'    => $request->total,
                    'status'   => 'pending'
                ]);

                // Kurangi stok
                foreach ($request->items as $item) {
                    Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
                }

                // Hapus Cart
                Cart::where('user_id', $request->user()->id)->delete();

                return $order;
            });

            return response()->json(['status' => 'success', 'order' => $orderResult], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    // ====================================================
    // 4. KHUSUS ADMIN - LIST SEMUA PESANAN (FIX NAMA PRODUK)
    // ====================================================
    public function adminIndex()
    {
        try {
            // Ambil semua order + nama user yang login
            $orders = Order::with('user:id,name')->latest()->get();

            // Suntikkan nama produk ke dalam items JSON
            $orders->transform(function ($order) {
                $items = $order->items;
                
                if (is_string($items)) {
                    $items = json_decode($items, true);
                }

                if (is_array($items)) {
                    foreach ($items as &$item) {
                        $p = Product::find($item['product_id']);
                        $item['product_name'] = $p ? $p->name : 'Produk Tidak Ditemukan';
                    }
                }

                $order->items = $items;
                return $order;
            });

            return response()->json([
                'status' => 'success',
                'orders' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mengambil data admin: ' . $e->getMessage()
            ], 500);
        }
    }

    // ====================================================
    // 5. UPDATE STATUS (Dipanggil Admin)
    // ====================================================
    public function updateStatus(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->update(['status' => $request->status]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Status berhasil diperbarui',
                'order'   => $order
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}