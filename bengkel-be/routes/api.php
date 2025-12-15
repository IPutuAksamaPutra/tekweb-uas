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
use App\Http\Controllers\Admin\AdminOrderController;


// ==================================
// 1. PUBLIC ROUTES (No Auth Required)
// ==================================
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Produk Public
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{id}', [ProductController::class, 'show']);

// Promotions
Route::get('promotions', [PromotionController::class, 'index']);


// ===========================================
// 2. USER AUTHENTICATED ROUTES
// ===========================================
Route::middleware('auth:sanctum')->group(function () {

    Route::get('auth/profile', [AuthController::class, 'profile']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // CART
    Route::get('cart', [CartController::class,'index']);
    Route::post('cart', [CartController::class,'store']);
    Route::put('cart/{id}', [CartController::class,'update']);
    Route::delete('cart/{id}', [CartController::class,'destroy']);

    // ORDERS
    Route::apiResource('orders', OrderController::class);

    // ==================================
    // REVIEWS (FIXED - NO DUPLICATE ROUTE)
    // ==================================
    Route::apiResource('reviews', ReviewController::class)
        ->except(['destroy', 'update']);

    // UPDATE REVIEW (MAX 7 HARI)
    Route::put('reviews/{review}', [ReviewController::class, 'update']);

    // BOOKINGS (USER)
    Route::apiResource('bookings', BookingController::class)
        ->only(['store','update','destroy','index','show']);
});


// =======================================================
// 3. ADMIN / KASIR
// =======================================================
Route::middleware(['auth:sanctum', 'role:admin,super_admin,kasir'])->group(function () {

    // Booking search for cashier
    Route::get('bookings/search/cashier', [BookingController::class, 'pendingForCashier']);
    Route::get('bookings/manage', [BookingController::class, 'indexAdmin']); 

    // Cashier POS
    Route::post('cashier/process-transaction', [CashierController::class, 'processTransaction']);

    // Products
    Route::get('products/search/cashier', [ProductController::class, 'searchForCashier']);
    Route::apiResource('products', ProductController::class)->except(['index','show']);

    Route::apiResource('cashier', CashierController::class);

    // Admin only
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::apiResource('categories', CategoryController::class);
        Route::get('promotions/{id}', [PromotionController::class, 'show']);
        Route::apiResource('promotions', PromotionController::class)->except(['index','show']);
        Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
    });
});


// =======================================================
// 4. STAFF MANAGEMENT
// =======================================================
Route::middleware(['auth:sanctum','role:admin,super_admin'])->group(function () {
    Route::get('staff', [AdminUserController::class,'index']);
    Route::post('staff/register',[AdminUserController::class,'storeStaff']);
    Route::put('staff/{id}',[AdminUserController::class,'update']);
    Route::delete('staff/{id}',[AdminUserController::class,'destroy']);
});


// =======================================================
// 5. ADMIN ORDER MANAGEMENT
// =======================================================
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])
    ->prefix('admin')
    ->group(function () {

        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::post('orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
});
