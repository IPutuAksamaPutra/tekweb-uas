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
use App\Http\Controllers\Api\OrderController; // 🔥 Ini yang kita pakai
use App\Http\Controllers\Api\ReviewController;

// ==================================
// 1. PUBLIC ROUTES
// ==================================
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::get('/verify-email/{id}/{hash}', function (Request $request) {
    $user = \App\Models\User::findOrFail($request->route('id'));

    if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
        return response()->json(['message' => 'Hash tidak valid.'], 403);
    }

    $user->markEmailAsVerified();
    return response()->json(['message' => 'Email berhasil diverifikasi!']);
})->name('verification.verify');


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
// 3. ADMIN / KASIR (BOOKINGS KHUSUS – HARUS DI ATAS)
// =======================================================
Route::middleware(['auth:sanctum', 'role:admin,super_admin,kasir'])->group(function () {

    Route::get('bookings/manage', [BookingController::class, 'indexAdmin']);
    Route::get('bookings/search/cashier', [BookingController::class, 'pendingForCashier']);

    // Cashier
    Route::post('cashier/process-transaction', [CashierController::class, 'processTransaction']);
    Route::get('transactions', [CashierController::class, 'index']);
    Route::post('transactions', [CashierController::class, 'processTransaction']);

    Route::get('products/search/cashier', [ProductController::class, 'searchForCashier']);
    Route::apiResource('products', ProductController::class)->except(['index','show']);

    Route::apiResource('cashier', CashierController::class);

    Route::middleware('role:admin,super_admin')->group(function () {
        Route::apiResource('categories', CategoryController::class);

        Route::get('promotions/{id}', [PromotionController::class, 'show']);
        Route::apiResource('promotions', PromotionController::class)->except(['index','show']);

        Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
    });
});


// =======================================================
// 4. USER AUTH ROUTES (BOOKINGS UMUM – DI BAWAH)
// =======================================================
Route::middleware('auth:sanctum')->group(function () {

    Route::get('auth/profile', [AuthController::class, 'profile']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::get('cart', [CartController::class,'index']);
    Route::post('cart', [CartController::class,'store']);
    Route::put('cart/{id}', [CartController::class,'update']);
    Route::delete('cart/{id}', [CartController::class,'destroy']);

    Route::apiResource('orders', OrderController::class);

    Route::post('reviews', [ReviewController::class, 'store']);
    Route::put('reviews/{review}', [ReviewController::class, 'update']);

    // ✅ TAMBAHAN: KHUSUS CUSTOMER (AMAN)
    Route::middleware('role:customer')->get(
        'my-bookings',
        [BookingController::class, 'myBookings']
    );

    // ⚠️ BOOKING UMUM (TETAP ADA, TIDAK DIHAPUS)
    Route::apiResource('bookings', BookingController::class)
        ->only(['store','update','destroy','index','show']);
});


// =======================================================
// 5. STAFF
// =======================================================
Route::middleware(['auth:sanctum','role:admin,super_admin'])->group(function () {
    Route::get('staff', [AdminUserController::class,'index']);
    Route::post('staff/register',[AdminUserController::class,'storeStaff']);
    Route::put('staff/{id}',[AdminUserController::class,'update']);
    Route::delete('staff/{id}',[AdminUserController::class,'destroy']);
});


// =======================================================
// 6. ADMIN ORDERS (DIUBAH KE OrderController @adminIndex)
// =======================================================
Route::middleware(['auth:sanctum', 'role:admin,super_admin,kasir'])
    ->prefix('admin')
    ->group(function () {
        // 🔥 Sekarang panggil OrderController, bukan AdminOrderController
        Route::get('orders', [OrderController::class, 'adminIndex']); 
        Route::post('orders/{id}/status', [OrderController::class, 'updateStatus']);
});