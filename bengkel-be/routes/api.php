<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
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
Route::post('login', [AuthController::class, 'login']);

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {

    $user = User::findOrFail($id);

    if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return response()->json(['message' => 'Invalid verification link'], 403);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified'], 200);
    }

    $user->markEmailAsVerified();
    event(new Verified($user));

    return response()->json(['message' => 'Email verified successfully'], 200);

});

// ==================================
// 2. PUBLIC DATA
// ==================================
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{id}', [ProductController::class, 'show'])->whereNumber('id');
Route::get('products/slug/{slug}', [ProductController::class, 'showBySlug']);
Route::get('products/slugs', [ProductController::class, 'getAllSlugs']);
Route::get('promotions', [PromotionController::class, 'index']);
Route::get('reviews', [ReviewController::class, 'index']);

// =======================================================
// 3. ADMIN / KASIR / STAFF
// =======================================================
Route::middleware(['auth:sanctum', 'role:admin,super_admin,kasir'])->group(function () {
    
    // Booking Management
    Route::get('bookings/manage', [BookingController::class, 'indexAdmin']);
    Route::get('bookings/search/cashier', [BookingController::class, 'pendingForCashier']);

    // Cashier & Transactions
    Route::post('cashier/process-transaction', [CashierController::class, 'processTransaction']);
    Route::get('transactions', [CashierController::class, 'index']);
    Route::get('products/search/cashier', [ProductController::class, 'searchForCashier']);
    Route::apiResource('products', ProductController::class)->except(['index','show']);
    Route::apiResource('cashier', CashierController::class);

    // Order Management (Admin/Kasir bisa lihat semua dan ganti status)
    Route::get('admin/orders', [OrderController::class, 'adminIndex']); 
    Route::post('admin/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Khusus Admin & Super Admin
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::apiResource('categories', CategoryController::class);
        Route::get('promotions/{id}', [PromotionController::class, 'show']);
        Route::apiResource('promotions', PromotionController::class)->except(['index','show']);
        Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
        
        // Staff Management
        Route::get('staff', [AdminUserController::class,'index']);
        Route::post('staff/register',[AdminUserController::class,'storeStaff']);
        Route::put('staff/{id}',[AdminUserController::class,'update']);
        Route::delete('staff/{id}',[AdminUserController::class,'destroy']);
    });
});

// =======================================================
// 4. USER AUTH ROUTES (CUSTOMER)
// =======================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/profile', [AuthController::class, 'profile']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Cart
    Route::get('cart', [CartController::class,'index']);
    Route::post('cart', [CartController::class,'store']);
    Route::put('cart/{id}', [CartController::class,'update']);
    Route::delete('cart/{id}', [CartController::class,'destroy']);

    // Orders (Milik Sendiri)
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{id}', [OrderController::class, 'show']);
    Route::post('orders', [OrderController::class, 'store']);

    // Reviews
    Route::post('reviews', [ReviewController::class, 'store']);
    Route::put('reviews/{review}', [ReviewController::class, 'update']);

    // Bookings
    Route::get('my-bookings', [BookingController::class, 'myBookings']);
    Route::apiResource('bookings', BookingController::class)->only(['store','update','destroy','index','show']);
});