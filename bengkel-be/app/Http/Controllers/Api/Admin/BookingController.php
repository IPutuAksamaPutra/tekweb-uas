<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Http\Requests\StoreBookingRequest;

class BookingController extends Controller {

    // GET semua booking (admin)
    public function index()
    {
        return Booking::with('user')->latest()->get();
    }

    // POST booking
    public function store(StoreBookingRequest $request) {
        return Booking::create([
            'user_id' => auth()->id(),
            'vehicle' => $request->vehicle,
            'booking_date' => $request->booking_date,
            'notes' => $request->notes,
            'status' => 'pending'
        ]);
    }

    // GET booking milik user
    public function userBookings() {
        return Booking::where('user_id', auth()->id())
            ->orderBy('booking_date', 'desc')
            ->get();
    }
}
