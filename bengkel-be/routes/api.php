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
// 1. PUBLIC ROUTES (Hanya GET)
// ==================================
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Akses Publik untuk Read (Index dan Show)
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{id}', [ProductController::class, 'show']);

Route::apiResource('promotions', PromotionController::class)->only(['index', 'show']);

// ===========================================
// 2. USER AUTHENTICATED ROUTES
// ===========================================
Route::middleware('auth:sanctum')->group(function () {

    Route::get('auth/profile', [AuthController::class, 'profile']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // --- CART ROUTES ---
    Route::get('cart', [CartController::class, 'index']);       // Ambil semua item cart
    Route::post('cart', [CartController::class, 'store']);      // Tambah item ke cart
    Route::put('cart/{id}', [CartController::class, 'update']); // Update quantity
    Route::delete('cart/{id}', [CartController::class, 'destroy']); // Hapus item

    // --- ORDER, REVIEW, BOOKING ---
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('reviews', ReviewController::class)->except(['destroy']);
    Route::apiResource('bookings', BookingController::class)->only(['store', 'update', 'destroy', 'index', 'show']);
});

// =======================================================
// 3. ADMIN ONLY (CRUD PRODUCT & MANAGEMENT)
// =======================================================
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {

    // ----------------------------------------------------
    // PRODUK CRUD (Menggunakan apiResource)
    // ----------------------------------------------------
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    
    // TIMPA (OVERRIDE) Rute Update agar menerima POST/PUT untuk file upload
    Route::match(['put', 'post'], 'products/{product}', [ProductController::class, 'update']);

    // ----------------------------------------------------
    // MANAJEMEN LAIN
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('promotions', PromotionController::class)->except(['index', 'show']);
    Route::apiResource('cashier', CashierController::class);

    // MANAJEMEN STAFF
    Route::post('staff/register', [AdminUserController::class, 'storeStaff']);
    Route::get('staff', [AdminUserController::class, 'index']);

    // BOOKING & REVIEW ADMIN
    Route::get('bookings/manage', [BookingController::class, 'indexAdmin']);
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
});