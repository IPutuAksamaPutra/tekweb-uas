<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\ProductController; 
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CashierController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;

// ====================
// PUBLIC ROUTES
// ====================

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

// Produk bebas
Route::apiResource('products', ProductController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('promotions', PromotionController::class);
Route::apiResource('bookings', BookingController::class);
Route::apiResource('cashier', CashierController::class);
Route::apiResource('cart', CartController::class);
Route::apiResource('orders', OrderController::class);
Route::apiResource('reviews', ReviewController::class);

Route::post('staff/register', [AdminUserController::class, 'storeStaff']);
Route::get('staff', [AdminUserController::class, 'index']);


// =============================
// PROTECTED ROUTES (auth token)
// =============================

Route::middleware('auth:sanctum')->group(function () {

    // ambil data user login
    Route::get('auth/user', [AuthController::class, 'user']);

    // LOGOUT
    Route::post('auth/logout', [AuthController::class, 'logout']);
});
