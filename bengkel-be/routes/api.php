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
// 1. PUBLIC ROUTES (No Auth Required)
// ==================================
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Produk Public (Hanya baca tanpa otorisasi)
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{id}', [ProductController::class, 'show']);

// PROMOTIONS: kalau frontend butuh daftar promos, buka endpoint GET publik
Route::get('promotions', [PromotionController::class, 'index']); // <-- OK

// ===========================================
// 2. USER AUTHENTICATED ROUTES (Customer/User Biasa)
// ===========================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/profile', [AuthController::class, 'profile']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::get('cart', [CartController::class,'index']);
    Route::post('cart', [CartController::class,'store']);
    Route::put('cart/{id}', [CartController::class,'update']);
    Route::delete('cart/{id}', [CartController::class,'destroy']);

    Route::apiResource('orders', OrderController::class);
    Route::apiResource('reviews', ReviewController::class)->except(['destroy']);

    Route::apiResource('bookings', BookingController::class)
        ->only(['store','update','destroy','index','show']);
});


// =======================================================
// 3. ADMIN/KASIR MANAGEMENT & INVENTORY ACCESS
// =======================================================
Route::middleware(['auth:sanctum', 'role:admin,super_admin,kasir'])->group(function () {

    // === INVENTORY & PRODUCTS ACCESS (Untuk Admin) ===
    // NOTE: Index dan Show produk sudah di atas (publik)
    Route::apiResource('products', ProductController::class)->except(['index','show']);
    
    // 🔥 PENCARIAN PRODUK UNTUK KASIR (Memerlukan otorisasi kasir)
    // Route ini berada di dalam middleware group admin/kasir, jadi otorisasi sudah terjamin.
    Route::get('products/search/cashier', [ProductController::class, 'searchForCashier']);
    
    // === BOOKING SEARCH & KASIR TRANSAKSI ===
    Route::get('bookings/pending/search', [BookingController::class, 'pendingForCashier']);
    Route::apiResource('cashier', CashierController::class);
    Route::get('bookings/manage', [BookingController::class, 'indexAdmin']);

    // === CRUD Kategori, Promosi, Review Delete (HANYA UNTUK ADMIN & SUPER_ADMIN) ===
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::apiResource('categories', CategoryController::class);
        // Promotions CRUD (create/update/delete) tetap di-admin
        Route::get('promotions/{id}', [PromotionController::class, 'show']);
        Route::apiResource('promotions', PromotionController::class)->except(['index','show']);
        Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
    });
});


// =======================================================
// 4. STAFF MANAGEMENT (Tetap Admin/Super Admin)
// =======================================================
Route::middleware(['auth:sanctum','role:admin,super_admin'])->group(function () {
    Route::get('staff', [AdminUserController::class,'index']);
    Route::post('staff/register',[AdminUserController::class,'storeStaff']);
    Route::put('staff/{id}',[AdminUserController::class,'update']);
    Route::delete('staff/{id}',[AdminUserController::class,'destroy']);
});