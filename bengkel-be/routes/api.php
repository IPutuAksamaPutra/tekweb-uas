<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\Admin\BookingController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Middleware\AdminMiddleware;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// AUTH
Route::post('register', [RegisterController::class, 'register']);
Route::post('login', [LoginController::class, 'login']);

// Semua route berikut butuh login
Route::middleware('auth:sanctum')->group(function () {

    // MARKETPLACE — user bisa lihat produk
    Route::get('products', [MarketplaceController::class, 'index']);
    Route::get('products/{id}', [MarketplaceController::class, 'show']);

    // CART
    Route::post('cart', [MarketplaceController::class, 'addToCart']);
    Route::get('cart', [MarketplaceController::class, 'cart']);

    // BOOKING — user
    Route::post('bookings', [BookingController::class, 'store']); // buat booking
    Route::get('user/bookings', [BookingController::class, 'userBookings']); // ambil booking user

    // CATEGORY
    Route::get('category', [CategoryController::class, 'index']);

    // ADMIN — semua route admin pakai middleware AdminMiddleware
    Route::middleware(AdminMiddleware::class)->prefix('admin')->group(function () {
        Route::get('bookings', [BookingController::class, 'index']); // ambil semua booking
        Route::apiResource('products', ProductController::class); // CRUD produk
        Route::get('category', [CategoryController::class, 'index']); // lihat kategori
    });
});
