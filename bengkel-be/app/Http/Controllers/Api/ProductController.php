<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage; // Gunakan Storage bukan File
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    // ================================================================
    // 🔥 HELPER: GENERATE UNIQUE SLUG
    // ================================================================
    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while (
            Product::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        return $slug;
    }

    // ================================================================
    // GET ALL PRODUCTS
    // ================================================================
    public function index()
    {
        // Menggunakan properti image_urls dari Accessor di Model
        $products = Product::latest()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'description' => $p->description,
                'price' => $p->price,
                'stock' => $p->stock,
                'jenis_barang' => $p->jenis_barang,
                'img_urls' => $p->image_urls, // Pastikan nama key sinkron dengan Next.js
            ];
        });

        return response()->json(['products' => $products], 200);
    }

    // ================================================================
    // STORE PRODUCT (DIARAHKAN KE STORAGE)
    // ================================================================
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'stock' => 'required|integer',
            'jenis_barang' => 'nullable|string',
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $imageNames = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                // Simpan ke storage/app/public/products
                $path = $img->store('products', 'public');
                // Ambil hanya nama filenya saja (misal: products/abc.jpg -> abc.jpg)
                $imageNames[] = basename($path);
            }
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => $this->generateUniqueSlug($request->name),
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'jenis_barang' => $request->jenis_barang,
            'img_url' => $imageNames,
        ]);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan',
            'product' => $product
        ], 201);
    }

    // ================================================================
    // UPDATE PRODUCT (DENGAN PEMBERSIHAN STORAGE)
    // ================================================================
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'stock' => 'required|integer',
            'jenis_barang' => 'nullable|string',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $imageNames = $product->img_url; // Default gunakan yang lama

        if ($request->hasFile('images')) {
            // Hapus gambar lama dari storage
            if (is_array($product->img_url)) {
                foreach ($product->img_url as $oldImg) {
                    Storage::disk('public')->delete('products/' . $oldImg);
                }
            }

            // Upload gambar baru
            $imageNames = [];
            foreach ($request->file('images') as $img) {
                $path = $img->store('products', 'public');
                $imageNames[] = basename($path);
            }
        }

        $product->update([
            'name' => $request->name,
            'slug' => $this->generateUniqueSlug($request->name, $product->id),
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'jenis_barang' => $request->jenis_barang,
            'img_url' => $imageNames,
        ]);

        return response()->json(['message' => 'Produk berhasil diperbarui'], 200);
    }

    // ================================================================
    // DELETE PRODUCT (DENGAN PEMBERSIHAN STORAGE)
    // ================================================================
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $product = Product::findOrFail($id);
            $images = $product->img_url;

            // Hapus dari DB dulu
            $product->delete();

            // Hapus file fisik dari storage
            if (is_array($images)) {
                foreach ($images as $img) {
                    Storage::disk('public')->delete('products/' . $img);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Produk berhasil dihapus'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus produk'], 500);
        }
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json(['product' => $product], 200);
    }

    public function showBySlug($slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        return response()->json(['product' => $product], 200);
    }
}