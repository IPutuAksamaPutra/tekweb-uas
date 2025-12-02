<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MarketplaceController extends Controller {
    public function index() {
        return Product::with('category')->get();
    }

    public function show($id) {
        return Product::with('category')->findOrFail($id);
    }

    public function addToCart(Request $request) {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|integer|min:1'
        ]);

        return CartItem::create([
            'user_id' => auth()->id(),
            'product_id' => $request->product_id,
            'qty' => $request->qty,
        ]);
    }

    public function cart() {
        return CartItem::where('user_id', auth()->id())->with('product')->get();
    }
}

