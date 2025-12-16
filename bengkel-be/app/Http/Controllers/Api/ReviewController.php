<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReviewController extends Controller
{
    /**
     * =================================================
     * GET /api/reviews?product_id=1
     * =================================================
     */
    public function index(Request $request)
{
    $validator = Validator::make($request->all(), [
        'product_id' => 'required|exists:products,id',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'errors' => $validator->errors()
        ], 422);
    }

    $reviews = Review::with('user:id,name')
        ->where('product_id', $request->product_id)
        ->whereNotNull('user_id')           // 🔥 PENTING
        ->whereNotNull('rating')            // 🔥 PENTING
        ->latest()
        ->get();

    $average = $reviews->count()
        ? round((float) $reviews->avg('rating'), 1)
        : 0;

    return response()->json([
        'average_rating' => number_format($average, 1),
        'total_reviews'  => $reviews->count(),
        'reviews'        => $reviews->map(function ($r) {
            return [
                'id' => $r->id,
                'rating' => (int) $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at,
                'user' => [
                    'name' => optional($r->user)->name ?? 'User',
                ],
            ];
        }),
    ], 200);
}
    /**
     * =================================================
     * POST /api/reviews
     * =================================================
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id'   => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = auth()->id();

        // Cegah review ganda
        $exists = Review::where('user_id', $userId)
            ->where('order_id', $request->order_id)
            ->where('product_id', $request->product_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Review untuk produk ini sudah ada'
            ], 409);
        }

        $review = Review::create([
            'user_id'    => $userId,
            'order_id'   => $request->order_id,
            'product_id' => $request->product_id,
            'rating'     => $request->rating,
            'comment'    => $request->comment,
        ]);

        return response()->json([
            'message' => 'Review berhasil disimpan',
            'review'  => $review
        ], 201);
    }

    /**
     * =================================================
     * GET /api/reviews/{review}
     * =================================================
     */
    public function show(Review $review)
    {
        return response()->json([
            'review' => $review->load('user:id,name')
        ], 200);
    }

    /**
     * =================================================
     * PUT /api/reviews/{review}
     * (Hanya pemilik & max 7 hari)
     * =================================================
     */
    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        if (now()->greaterThan(
            Carbon::parse($review->created_at)->addDays(7)
        )) {
            return response()->json([
                'message' => 'Review hanya bisa diubah maksimal 7 hari'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $review->update($request->only('rating', 'comment'));

        return response()->json([
            'message' => 'Review berhasil diperbarui',
            'review'  => $review
        ], 200);
    }

    /**
     * =================================================
     * DELETE /api/reviews/{review}
     * (ADMIN ONLY)
     * =================================================
     */
    public function destroy(Review $review)
    {
        $review->delete();

        return response()->json([
            'message' => 'Review berhasil dihapus'
        ], 200);
    }
}
