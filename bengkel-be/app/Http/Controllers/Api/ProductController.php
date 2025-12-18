<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB; // Ditambahkan untuk proteksi Database Transaction

class ProductController extends Controller
{
    // ================================================================
    // 🔥 HELPER: GENERATE UNIQUE SLUG (SEO SAFE)
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
    // GET ALL PRODUCTS (MARKETPLACE LIST)
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

        return response()->json([
            'products' => $products
        ], 200);
    }

    // ================================================================
    // SHOW PRODUCT BY ID (LEGACY – TIDAK DIUBAH)
    // ================================================================
    public function show($id)
    {
        $product = Product::findOrFail($id);

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'stock' => $product->stock,
                'jenis_barang' => $product->jenis_barang,
                'img_urls' => $product->image_urls,
            ]
        ], 200);
    }

    // ================================================================
    // 🔥 SHOW PRODUCT BY SLUG (DETAIL + SEO)
    // ================================================================
    public function showBySlug($slug)
    {
        $product = Product::where('slug', $slug)->first();

        if (!$product) {
            return response()->json([
                'message' => 'Produk tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'stock' => $product->stock,
                'jenis_barang' => $product->jenis_barang,
                'img_urls' => $product->image_urls,

                // === SEO / SCHEMA SUPPORT ===
                'in_stock' => $product->stock > 0,
                'currency' => 'IDR',
                'sku' => 'PROD-' . $product->id,
                'brand' => 'Bengkel Pedia',
                'rating' => 4.5,
                'review_count' => 120,
            ]
        ], 200);
    }

    // ================================================================
    // 🔥 GET ALL SLUGS (SITEMAP / SEO)
    // ================================================================
    public function getAllSlugs()
    {
        return response()->json([
            'slugs' => Product::pluck('slug')->all()
        ], 200);
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
        $path = public_path('images');

        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }

        foreach ($request->file('images') as $img) {
            $filename = time() . '_' . Str::random(10) . '.' . $img->getClientOriginalExtension();
            $img->move($path, $filename);
            $imageNames[] = $filename;
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
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'img_urls' => $product->image_urls,
            ]
        ], 201);
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

        $existingImages = json_decode($product->getRawOriginal('img_url') ?? '[]', true) ?? [];
        $imageNames = $existingImages;

        if ($request->hasFile('images')) {
            $path = public_path('images');

            // Hapus gambar lama dari folder fisik
            foreach ($existingImages as $img) {
                if ($img && File::exists($path . '/' . $img)) {
                    File::delete($path . '/' . $img);
                }
            }

            $imageNames = [];
            foreach ($request->file('images') as $img) {
                $filename = time() . '_' . Str::random(10) . '.' . $img->getClientOriginalExtension();
                $img->move($path, $filename);
                $imageNames[] = $filename;
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

        return response()->json([
            'message' => 'Produk berhasil diupdate',
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'img_urls' => $product->image_urls,
            ]
        ], 200);
    }

    // ================================================================
    // DELETE PRODUCT
    // ================================================================
    public function destroy($id)
    {
        // Menggunakan Transaction agar data DB tidak terhapus jika file gagal diproses
        DB::beginTransaction();

        try {
            $product = Product::findOrFail($id);
            $imagesRaw = $product->getRawOriginal('img_url');
            $images = is_string($imagesRaw) ? json_decode($imagesRaw, true) : $imagesRaw;

            // Hapus data dari Database
            $product->delete();

            // Hapus file fisik di public/images
            if (is_array($images)) {
                $path = public_path('images');
                foreach ($images as $img) {
                    if ($img && File::exists($path . '/' . $img)) {
                        File::delete($path . '/' . $img);
                    }
                }
            }

            DB::commit();
            return response()->json([
                'message' => 'Produk berhasil dihapus'
            ], 200);

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Produk tidak bisa dihapus karena sedang digunakan dalam transaksi atau keranjang.'
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menghapus produk.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ================================================================
    // SEARCH FOR CASHIER (TIDAK DIUBAH)
    // ================================================================
    public function searchForCashier(Request $request)
    {
        $keyword = $request->input('q');

        if (!$keyword) {
            return response()->json(['products' => []], 200);
        }

        $products = Product::where('name', 'LIKE', "%{$keyword}%")
            ->orWhere('slug', 'LIKE', "%{$keyword}%")
            ->orWhere('description', 'LIKE', "%{$keyword}%")
            ->limit(10)
            ->get()
            ->map(function ($p) {
                $imgs = $p->image_urls;
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'price' => $p->price,
                    'stock' => $p->stock,
                    'jenis_barang' => $p->jenis_barang,
                    'img_url_first' => is_array($imgs) && count($imgs) ? $imgs[0] : null,
                ];
            });

        return response()->json(['products' => $products], 200);
    }
}