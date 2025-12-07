<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\ProductController; 
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CashierController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\CartController; // <-- SUDAH DI-IMPORT
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;


// ====================
// ROUTE PUBLIC (NO TOKEN)
// ====================
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);


// ====================
// ROUTE DENGAN TOKEN (ROLE CHECK)
// ====================
Route::group(['middleware' => ['auth:sanctum']], function () {

    // 🔹 USER PROFILE & LOGOUT
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);

    // 🛒 CHART / KERANJANG BELANJA (Diakses oleh customer/user yang login)
    Route::apiResource('cart', CartController::class)->except(['show']); // <-- DITAMBAHKAN DI SINI

    // 🛒 ORDER / PESANAN (Diakses oleh customer/user yang login)
    Route::apiResource('orders', OrderController::class);

    // 📝 REVIEW / ULASAN PRODUK (Diakses oleh semua user, tapi store butuh login)
    Route::apiResource('reviews', ReviewController::class)->except(['update', 'destroy']);


    // 🔥 SUPER ADMIN ONLY
    Route::middleware(['admin:super_admin'])->group(function () {
        Route::post('staff/register', [AdminUserController::class, 'storeStaff']);
        Route::get('staff', [AdminUserController::class, 'index']);
    });


    // 🔥 ADMIN & SUPER ADMIN — Manage Products, Category, & PROMOTIONS
    Route::middleware(['admin:admin,super_admin'])->group(function () {
        Route::apiResource('products', ProductController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('promotions', PromotionController::class); 
    });


    // 🔥 ADMIN/KASIR/SUPER ADMIN — Kasir & Booking
    Route::middleware(['admin:kasir,admin,super_admin'])->group(function () {
        Route::apiResource('cashier', CashierController::class);
        Route::apiResource('bookings', BookingController::class);
    });

});