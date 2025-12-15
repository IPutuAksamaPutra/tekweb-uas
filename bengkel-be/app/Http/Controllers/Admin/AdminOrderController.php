<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class AdminOrderController extends Controller
{
    /**
     * GET /api/admin/orders
     */
    public function index(Request $request)
    {
        $orders = Order::orderByDesc('created_at')->get();

        return response()->json([
            'message' => 'Daftar pesanan ditemukan',
            'orders' => $orders
        ], 200);
    }

    /**
     * POST /api/admin/orders/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed'
        ]);

        $order = Order::findOrFail($id);
        $order->update([
            'status' => $request->status
        ]);

        return response()->json([
            'message' => 'Status pesanan diperbarui'
        ], 200);
    }
}
