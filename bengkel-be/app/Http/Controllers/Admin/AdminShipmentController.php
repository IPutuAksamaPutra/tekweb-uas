<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Shipment; // ✅ WAJIB DIIMPORT

class AdminShipmentController extends Controller
{
    // ======================
    // LIST SEMUA SHIPMENT
    // ======================
    public function index(Request $request)
    {
        $shipments = Shipment::with('user')
            ->when($request->status, function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'message' => 'Daftar pengiriman',
            'shipments' => $shipments
        ], 200);
    }

    // ======================
    // UPDATE STATUS SHIPMENT
    // ======================
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:diterima,diproses,dikirim,selesai'
        ]);

        $shipment = Shipment::findOrFail($id);

        $shipment->update([
            'status' => $request->status,
            'updated_by' => auth()->id(),
            'status_updated_at' => now()
        ]);

        return response()->json([
            'message' => 'Status pengiriman diperbarui',
            'status' => $shipment->status
        ], 200);
    }
}
