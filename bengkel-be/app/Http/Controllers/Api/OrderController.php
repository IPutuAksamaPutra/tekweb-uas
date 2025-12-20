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

    /* ===================== CUSTOMER ===================== */

    // List order milik user
    public function index(Request $request)
    {
        $user = $request->user();

        // ⛔ WAJIB: cegah 500
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated'
            ], 401);
        }

        $orders = Order::where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'orders' => $orders
        ]);
    }

    // Detail order
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated'
            ], 401);
        }

        $order = Order::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'order' => $order
        ]);
    }

    // Buat order (CHECKOUT)
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'items'   => 'required|array|min:1',
            'name'    => 'required|string',
            'no_tlp'  => 'required|string',
            'address' => 'required|string',
            'total'   => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order = DB::transaction(function () use ($request, $user) {

                // Validasi item & stok
                foreach ($request->items as $item) {
                    if (!isset($item['product_id'], $item['quantity'])) {
                        throw new \Exception("Data item tidak valid");
                    }

                    $product = Product::find($item['product_id']);

                    if (!$product) {
                        throw new \Exception("Produk tidak ditemukan");
                    }

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok {$product->name} tidak cukup");
                    }
                }

                // Simpan order
                $order = Order::create([
                    'user_id'  => $user->id,
                    'items'    => $request->items,
                    'name'     => $request->name,
                    'no_tlp'   => $request->no_tlp,
                    'address'  => $request->address,
                    'delivery' => $request->delivery ?? 'kurir',
                    'payment'  => $request->payment ?? 'transfer',
                    'total'    => $request->total,
                    'status'   => 'pending',
                ]);

                // Kurangi stok
                foreach ($request->items as $item) {
                    Product::where('id', $item['product_id'])
                        ->decrement('stock', $item['quantity']);
                }

                // Kosongkan cart
                Cart::where('user_id', $user->id)->delete();

                return $order;
            });

            return response()->json([
                'status' => 'success',
                'order'  => $order
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /* ===================== ADMIN ===================== */

    // Semua order (admin)
    public function adminIndex()
    {
        try {
            $orders = Order::with('user:id,name')
                ->latest()
                ->get();

            $orders->transform(function ($order) {
                $items = $order->items;

                if (is_array($items)) {
                    foreach ($items as &$item) {
                        $product = Product::find($item['product_id'] ?? 0);
                        $item['product_name'] = $product
                            ? $product->name
                            : 'Produk Tidak Terdaftar';
                    }
                }

                $order->items = $items ?? [];
                return $order;
            });

            return response()->json([
                'status' => 'success',
                'orders' => $orders
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Update status order (admin)
    public function updateStatus(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->update([
                'status' => $request->status
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Status Updated'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
