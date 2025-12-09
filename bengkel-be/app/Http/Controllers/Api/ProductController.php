<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller 
{
    // ======================= LIST PRODUCT =======================
    public function index()
    {
        $products = Product::all(); 
        return response()->json([
            'message' => 'Daftar produk berhasil diambil.',
            'products' => $products
        ]);
    }

    // ======================= CREATE PRODUCT =======================
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:products,name',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'img_url' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048', 
            'jenis_barang' => 'required|in:Sparepart,Aksesoris',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $fileNameToSave = null; 

            if ($request->hasFile('img_url')) {
                $file = $request->file('img_url');

                if (!Storage::disk('public')->exists('products')) {
                    Storage::disk('public')->makeDirectory('products');
                }

                $fileNameToSave = time() . '_' . Str::slug($request->name) . '.' . $file->getClientOriginalExtension();
                $file->storeAs('products', $fileNameToSave, 'public'); 
            }

            $product = Product::create([
                'name' => $request->name,
                'slug' => Str::slug($request->name) . "-" . time(), 
                'description' => $request->description,
                'price' => $request->price,
                'stock' => $request->stock,
                'jenis_barang' => $request->jenis_barang,
                'img_url' => $fileNameToSave,
            ]);

            return response()->json([
                'message' => 'Produk berhasil dibuat.',
                'product' => $product 
            ], 201);

        } catch (\Exception $e) {
            \Log::error("Product creation failed: " . $e->getMessage()); 
            return response()->json([
                'message' => 'Terjadi error saat menyimpan produk.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ======================= DETAIL PRODUCT =======================
    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Produk tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail produk berhasil diambil.',
            'product' => $product
        ]);
    }

    // ======================= UPDATE PRODUCT =======================
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Produk tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:products,name,' . $product->id,
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'img_url' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'jenis_barang' => 'required|in:Sparepart,Aksesoris',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            if ($request->hasFile('img_url')) {
                if ($product->img_url && Storage::disk('public')->exists('products/' . $product->img_url)) {
                    Storage::disk('public')->delete('products/' . $product->img_url);
                }

                $file = $request->file('img_url');
                $fileNameToSave = time().'_'.Str::slug($request->name).'.'.$file->getClientOriginalExtension();
                $file->storeAs('products', $fileNameToSave, 'public');
                $product->img_url = $fileNameToSave; 
            }

            $product->update([
                'name' => $request->name,
                'slug' => Str::slug($request->name) . "-" . time(),
                'description' => $request->description,
                'price' => $request->price,
                'stock' => $request->stock,
                'jenis_barang' => $request->jenis_barang,
            ]);

            $product->save();

            return response()->json([
                'message' => 'Produk berhasil diperbarui.',
                'product' => $product 
            ]);

        } catch (\Exception $e) {
            \Log::error("Product update failed: " . $e->getMessage()); 
            return response()->json([
                'message' => 'Terjadi error saat memperbarui produk.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ======================= DELETE PRODUCT =======================
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Produk tidak ditemukan.'
            ], 404);
        }

        try {
            if ($product->img_url && Storage::disk('public')->exists('products/'.$product->img_url)) {
                Storage::disk('public')->delete('products/'.$product->img_url);
            }

            $product->delete();

            return response()->json([
                'message' => 'Produk berhasil dihapus.'
            ]);

        } catch (\Exception $e) {
            \Log::error("Product deletion failed: " . $e->getMessage()); 
            return response()->json([
                'message' => 'Terjadi error saat menghapus produk.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
