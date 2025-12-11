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

// ... (PROMOTION PUBLIC - Tidak Berubah) ...


// ===========================================
// 2. USER AUTHENTICATED ROUTES (Customer/User Biasa)
// ===========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // ... (Profile, Cart, Order, Booking Customer - Tidak Berubah) ...
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
// FIX: Memperluas role untuk KASIR agar dapat mengakses fitur POS/Inventory.
Route::middleware(['auth:sanctum', 'role:admin,super_admin,kasir'])->group(function () {

    // === INVENTORY & PRODUCTS ACCESS (Untuk Kasir dan Admin) ===
    // Rute terotentikasi untuk mencari/melihat produk (untuk POS)
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{id}', [ProductController::class, 'show']);
    Route::get('kasir/products/search', [ProductController::class, 'searchForCashier']);
    
    // === BOOKING SEARCH & KASIR TRANSAKSI ===
    // FIX: Rute pencarian booking untuk kasir (Menyelesaikan 404 Not Found)
    Route::get('bookings/pending/search', [BookingController::class, 'pendingForCashier']);

    // Rute utama transaksi kasir (store/index/show cashier)
    Route::apiResource('cashier', CashierController::class);
    
    // Rute untuk melihat semua booking (Panel Admin/Kasir)
    Route::get('bookings/manage', [BookingController::class, 'indexAdmin']);


    // === CRUD DATA (HANYA UNTUK ADMIN & SUPER_ADMIN) ===
    Route::middleware('role:admin,super_admin')->group(function () {
        // Product CRUD (kecuali index/show karena sudah di atas)
        Route::apiResource('products', ProductController::class)->except(['index','show']);
        Route::match(['put','post'], 'products/{product}', [ProductController::class,'update']);

        // CRUD Kategori, Promosi, Review Delete
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('promotions', PromotionController::class)->except(['index','show']);
        Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
    });
});


// =======================================================
// 4. STAFF MANAGEMENT (Tetap Admin/Super Admin)
// =======================================================
// Dibiarkan terpisah karena staff management adalah fitur yang sangat sensitif.
Route::middleware(['auth:sanctum','role:admin,super_admin'])->group(function () {
    Route::get('staff', [AdminUserController::class,'index']);
    Route::post('staff/register',[AdminUserController::class,'storeStaff']);
    Route::put('staff/{id}',[AdminUserController::class,'update']);
    Route::delete('staff/{id}',[AdminUserController::class,'destroy']);
});