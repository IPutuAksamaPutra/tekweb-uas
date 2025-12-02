<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BookingController extends Controller {
    public function store(StoreBookingRequest $request) {
        return Booking::create([
            'user_id' => auth()->id(),
            'vehicle' => $request->vehicle,
            'booking_date' => $request->booking_date,
            'notes' => $request->notes
        ]);
    }

    public function userBookings() {
        return Booking::where('user_id', auth()->id())->get();
    }
}

