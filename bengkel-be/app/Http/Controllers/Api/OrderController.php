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
                // Cek Stok
                foreach ($request->items as $item) {
                    $product = Product::find($item['product_id']);
                    if (!$product || $product->stock < $item['quantity']) {
                        throw new \Exception('Stok produk '.$product->name.' tidak cukup');
                    }
                }

                // Buat Order
                $newOrder = Order::create([
                    'user_id' => $request->user()->id,
                    'items'   => $request->items,
                    'name'    => $request->name,
                    'no_tlp'  => $request->no_tlp,
                    'address' => $request->address,
                    'delivery'=> $request->delivery ?? 'kurir',
                    'payment' => $request->payment ?? 'transfer',
                    'total'   => $request->total,
                    'status'  => 'pending'
                ]);

                // Kurangi Stok
                foreach ($request->items as $item) {
                    Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
                }

                Cart::where('user_id', $request->user()->id)->delete();
                return $newOrder;
            });

            return response()->json(['message' => 'Pesanan berhasil', 'order' => $order], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // ====================================================
    // FIX TOTAL: ADMIN INDEX (ANTI ERROR 500)
    // ====================================================
    public function adminIndex()
    {
        try {
            // Ambil data dengan with('user')
            $orders = Order::with('user:id,name')->orderByDesc('created_at')->get();

            // Transform data agar item ada namanya
            $orders->transform(function ($order) {
                // Ambil items asli
                $itemsRaw = $order->items;

                // Jika items masih string (biasanya di database Railway tertentu), decode manual
                if (is_string($itemsRaw)) {
                    $itemsRaw = json_decode($itemsRaw, true);
                }

                // Jika sekarang sudah jadi array, proses namanya
                if (is_array($itemsRaw)) {
                    foreach ($itemsRaw as &$item) {
                        // Cari produk. Gunakan full path App\Models\Product biar aman
                        $p = \App\Models\Product::find($item['product_id']);
                        $item['product_name'] = $p ? $p->name : 'Sparepart Tidak Ditemukan';
                    }
                } else {
                    $itemsRaw = []; // Fallback jika rusak
                }

                $order->items = $itemsRaw;
                return $order;
            });

            return response()->json([
                'status' => 'success',
                'orders' => $orders
            ], 200);

        } catch (\Exception $e) {
            // JANGAN KASIH 500 POLOS. KASIH TAHU ERRORNYA APA.
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 200); // Kita paksa 200 biar kamu bisa baca errornya di Postman!
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);
        return response()->json(['message' => 'Status Updated']);
    }
}