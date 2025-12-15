<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    // USER BUAT PENGIRIMAN
    public function store(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required',
            'address' => 'required|string'
        ]);

        Shipment::create([
            'user_id' => auth()->id(),
            'transaction_id' => $request->transaction_id,
            'address' => $request->address,
            'status' => 'diterima'
        ]);

        return response()->json([
            'message' => 'Pesanan diterima dan menunggu diproses'
        ]);
    }

    // USER LIHAT STATUS
    public function myShipments()
    {
        return Shipment::where('user_id', auth()->id())
            ->latest()
            ->get();
    }
}

