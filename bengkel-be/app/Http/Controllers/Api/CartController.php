<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    // --- List cart items ---
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $cartItems = Cart::with('product')
                ->where('user_id', $user->id)
                ->get();

            // Safety check: jika product hilang
            $cartItems = $cartItems->map(function($item) {
                if(!$item->product) {
                    $item->product = (object)[
                        'name' => 'Produk tidak tersedia',
                        'price' => 0,
                        'image_url' => ''
                    ];
                }
                return $item;
            });

            return response()->json(['cart_items' => $cartItems], 200);

        } catch (\Exception $e) {
            Log::error('Cart load error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal load cart'], 500);
        }
    }

    // --- Add item to cart ---
    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1'
            ]);

            $user = $request->user();

            // cek apakah product sudah ada di cart
            $cartItem = Cart::where('user_id', $user->id)
                ->where('product_id', $request->product_id)
                ->first();

            if($cartItem) {
                $cartItem->quantity += $request->quantity;
                $cartItem->save();
            } else {
                $cartItem = Cart::create([
                    'user_id' => $user->id,
                    'product_id' => $request->product_id,
                    'quantity' => $request->quantity
                ]);
            }

            return response()->json(['cart_item' => $cartItem], 201);

        } catch (\Exception $e) {
            Log::error('Cart store error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal menambah item ke cart'], 500);
        }
    }

    // --- Update quantity ---
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'quantity' => 'required|integer|min:1'
            ]);

            $user = $request->user();

            $cartItem = Cart::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $cartItem->quantity = $request->quantity;
            $cartItem->save();

            return response()->json(['cart_item' => $cartItem], 200);

        } catch (\Exception $e) {
            Log::error('Cart update error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal update cart'], 500);
        }
    }

    // --- Delete item ---
    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();

            $cartItem = Cart::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $cartItem->delete();

            return response()->json(['message' => 'Item berhasil dihapus'], 200);

        } catch (\Exception $e) {
            Log::error('Cart delete error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal hapus item'], 500);
        }
    }
}
