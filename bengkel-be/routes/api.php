<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('register', [RegisterController::class, 'register']);
Route::post('login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // marketplace
    Route::get('products', [MarketplaceController::class, 'index']);
    Route::get('products/{id}', [MarketplaceController::class, 'show']);

    Route::post('cart', [MarketplaceController::class, 'addToCart']);
    Route::get('cart', [MarketplaceController::class, 'cart']);

    // booking
    Route::post('booking', [BookingController::class, 'store']);
    Route::get('booking', [BookingController::class, 'userBookings']);

    // admin
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::apiResource('products', ProductController::class);
    });
});
