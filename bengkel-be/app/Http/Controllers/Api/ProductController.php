<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
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
    // SEARCH UNTUK KASIR (Sesuai Route: products/search/cashier)
    // ================================================================
    public function searchForCashier(Request $request)
    {
        $query = $request->input('query'); 
        $category = $request->input('category');

        $products = Product::query()
            ->when($query, function ($q) use ($query) {
                return $q->where('name', 'LIKE', "%{$query}%")
                         ->orWhere('slug', 'LIKE', "%{$query}%");
            })
            ->when($category && $category !== 'Semua', function ($q) use ($category) {
                return $q->where('jenis_barang', $category);
            })
            // Kasir hanya melihat barang yang ada stoknya
            ->where('stock', '>', 0) 
            ->latest()
            ->limit(15) 
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'price' => $p->price,
                    'stock' => $p->stock,
                    'jenis_barang' => $p->jenis_barang,
                    'img_urls' => $p->image_urls,
                ];
            });

        return response()->json([
            'success' => true,
            'products' => $products
        ], 200);
    }

    // ================================================================
    // GET ALL PRODUCTS
    // ================================================================
    public function index()
    {
        $products = Product::latest()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'description' => $p->description,
                'price' => $p->price,
                'stock' => $p->stock,
                'jenis_barang' => $p->jenis_barang,
                'img_urls' => $p->image_urls,
            ];
        });

        return response()->json(['products' => $products], 200);
    }

    // ================================================================
    // STORE PRODUCT
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
                $path = $img->store('products', 'public');
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
    // SHOW SINGLE PRODUCT
    // ================================================================
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

    // ================================================================
    // UPDATE PRODUCT
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

        $imageNames = $product->img_url; 

        if ($request->hasFile('images')) {
            if (is_array($product->img_url)) {
                foreach ($product->img_url as $oldImg) {
                    Storage::disk('public')->delete('products/' . $oldImg);
                }
            }

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
    // DELETE PRODUCT
    // ================================================================
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $product = Product::findOrFail($id);
            $images = $product->img_url;

            $product->delete();

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
}