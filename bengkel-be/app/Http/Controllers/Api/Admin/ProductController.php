<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProductController extends Controller {

    public function index() {
        return Product::with('category')->get();
    }

    public function store(StoreProductRequest $request) {
        return Product::create($request->validated());
    }

    public function show(Product $product) {
        return $product->load('category');
    }

    public function update(UpdateProductRequest $request, Product $product) {
        $product->update($request->validated());
        return $product;
    }

    public function destroy(Product $product) {
        $product->delete();
        return response()->noContent();
    }
}

