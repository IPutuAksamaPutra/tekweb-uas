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


// ==================================
// 1. PUBLIC ROUTES
// ==================================
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);

// Public access (guest/customer)
Route::apiResource('products', ProductController::class)->only(['index', 'show']);
Route::apiResource('promotions', PromotionController::class)->only(['index', 'show']);


// ==================================
// 2. PROTECTED ROUTES (Authenticated)
// ==================================
Route::middleware('auth:sanctum')->group(function () {

    Route::get('auth/user', [AuthController::class, 'profile']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('cart', CartController::class);
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('reviews', ReviewController::class)->except(['destroy']);
    Route::apiResource('bookings', BookingController::class)->only(['store', 'update', 'destroy', 'index', 'show']);
    
});


// ===================================
// 3. ADMIN ROUTES (NO ROUTE COLLISION)
// ===================================
Route::prefix('admin')
    ->middleware(['auth:sanctum', 'role:admin,super_admin'])
    ->group(function () {

        // Produk CRUD kini tidak bentrok
        Route::apiResource('products', ProductController::class); 
        // contoh: POST /api/admin/products

        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('promotions', PromotionController::class)->except(['index', 'show']);
        Route::apiResource('cashier', CashierController::class);

        Route::post('staff/register', [AdminUserController::class, 'storeStaff']);
        Route::get('staff', [AdminUserController::class, 'index']);

        Route::get('bookings/manage', [BookingController::class, 'indexAdmin']);
        Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
});