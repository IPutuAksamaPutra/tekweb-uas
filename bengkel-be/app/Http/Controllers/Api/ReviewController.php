<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\QueryException;

class ReviewController extends Controller
{
    // Batasi akses: hanya user terautentikasi yang bisa store dan destroy
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index']);
    }

    // ==========================================================
    // 1. INDEX: Menampilkan semua review untuk produk tertentu
    // ==========================================================
    /**
     * Tampilkan daftar review untuk produk spesifik.
     * Endpoint: GET /api/reviews?product_id=X
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Ambil ulasan dan user yang membuatnya
        $reviews = Review::where('product_id', $request->product_id)
                         ->with('user:id,name') 
                         ->orderByDesc('created_at') // Menggunakan created_at default Laravel
                         ->get();

        // Hitung rata-rata rating untuk tampilan bintang di front-end
        $averageRating = $reviews->avg('rating');

        return response()->json([
            'message' => 'Daftar ulasan berhasil diambil.',
            'average_rating' => number_format($averageRating, 1),
            'reviews' => $reviews
        ], 200);
    }

    // ==========================================================
    // 2. STORE: Menambahkan review baru (Input Bintang 1-5)
    // ==========================================================
    /**
     * Kirim ulasan baru oleh user yang sedang login.
     * Rating dari front-end (bintang) diubah menjadi angka 1-5 di sini.
     * Endpoint: POST /api/reviews
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            // PENTING: Validasi memastikan input adalah angka antara 1 dan 5
            'rating' => 'required|integer|min:1|max:5', 
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = auth()->id();
        $productId = $request->product_id;

        // Cek apakah user sudah pernah review produk ini
        $existingReview = Review::where('user_id', $userId)
                                ->where('product_id', $productId)
                                ->first();

        if ($existingReview) {
            return response()->json(['message' => 'Anda sudah memberikan ulasan untuk produk ini.'], 409);
        }

        try {
            $review = Review::create([
                'user_id' => $userId,
                'product_id' => $productId,
                // Nilai ini adalah angka (integer) 1-5 yang akan disimpan di database
                'rating' => $request->rating, 
                'comment' => $request->comment,
            ]);

            return response()->json([
                'message' => 'Ulasan berhasil ditambahkan.',
                'review' => $review
            ], 201);
            
        } catch (QueryException $e) {
            return response()->json(['message' => 'Gagal menyimpan ulasan.'], 500);
        }
    }
    
    // ==========================================================
    // 3. DESTROY: Menghapus review
    // ==========================================================
    /**
     * Hapus ulasan. Hanya pemilik ulasan yang boleh menghapus.
     * Endpoint: DELETE /api/reviews/{review}
     */
    public function destroy(Review $review)
    {
        // Pastikan user yang menghapus adalah pemilik ulasan
        if ($review->user_id !== auth()->id()) {
            return response()->json(['message' => 'Akses ditolak. Anda bukan pemilik ulasan ini.'], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Ulasan berhasil dihapus.'
        ], 200);
    }
}