<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // GET /api/orders (pesanan user login)
    public function index(Request $request)
    {
        $user = $request->user();

        $orders = Order::with(['items.product'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'message' => 'Daftar pesanan berhasil diambil.',
            'orders'  => $orders,
        ], 200);
    }

    // POST /api/orders (checkout)
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'items'   => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.subtotal'   => 'required|numeric|min:0',

            'name'     => 'required|string|max:255',
            'no_tlp'   => 'required|string|max:20',
            'address'  => 'required|string',
            'delivery' => 'required|in:ambil_di_tempat,kurir',
            'payment'  => 'required|in:tunai,transfer',
            'total'    => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $order = Order::create([
                'user_id'  => $user->id,
                'name'     => $request->name,
                'no_tlp'   => $request->no_tlp,
                'address'  => $request->address,
                'delivery' => $request->delivery,
                'payment'  => $request->payment,
                'total'    => $request->total,
                'status'   => 'pending',
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'subtotal'   => $item['subtotal'],
                ]);
            }

            // Bersihkan cart user (opsional: hanya product yang di-checkout)
            Cart::where('user_id', $user->id)->delete();

            DB::commit();

            return response()->json([
                'message' => 'Pesanan berhasil dibuat.',
                'order'   => $order->load('items.product'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order store error: '.$e->getMessage());

            return response()->json([
                'message' => 'Gagal memproses pesanan.',
            ], 500);
        }
    }

    // GET /api/orders/{id}
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $order = Order::with(['items.product'])
            ->where('user_id', $user->id)
            ->findOrFail($id);

        return response()->json([
            'message' => 'Detail pesanan berhasil diambil.',
            'order'   => $order,
        ], 200);
    }

    // Admin / optional
    public function update(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|string|in:pending,processing,shipped,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $order->update($request->only('status'));

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui.',
            'order'   => $order,
        ], 200);
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'message' => 'Pesanan berhasil dihapus.'
        ], 200);
    }
}
