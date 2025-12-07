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
// ROUTE PUBLIC (NO LOGIN SEMUA BEBAS)
// ====================

// User Auth (opsional, bisa dipakai jika nanti ingin aktifkan lagi)
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Produk bebas CRUD tanpa login
Route::apiResource('products', ProductController::class);

// Category bebas
Route::apiResource('categories', CategoryController::class);

// Promo bebas
Route::apiResource('promotions', PromotionController::class);

// Booking bebas
Route::apiResource('bookings', BookingController::class);

// Cashier bebas
Route::apiResource('cashier', CashierController::class);

// Cart bebas
Route::apiResource('cart', CartController::class);

// Order bebas
Route::apiResource('orders', OrderController::class);

// Review bebas
Route::apiResource('reviews', ReviewController::class);

// Staff bebas
Route::post('staff/register', [AdminUserController::class, 'storeStaff']);
Route::get('staff', [AdminUserController::class, 'index']);

// User info bebas (opsional)
Route::get('user', [AuthController::class, 'user']);
Route::post('logout', [AuthController::class, 'logout']);
