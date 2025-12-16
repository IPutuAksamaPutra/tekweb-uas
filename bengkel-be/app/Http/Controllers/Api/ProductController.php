<?php 

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class ProductController extends Controller
{
    // ================================================================
    // GET ALL PRODUCTS
    // ================================================================
    public function index()
    {
        // Tetapkan base URL lokal
        $base = "http://localhost:8000"; 

        $products = Product::latest()->get()->map(function ($p) {
            // Asumsi $p->image_urls adalah Accessor/Cast array yang mengembalikan URL gambar lengkap
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
    // SHOW DETAIL PRODUCT BY ID
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
        ]);
    }

    // ================================================================
    // 🔥 METHOD BARU: SHOW DETAIL PRODUCT BY SLUG (Untuk SEO/Metadata) 🔥
    // ================================================================
    public function showBySlug($slug)
    {
        // Mencari produk berdasarkan kolom 'slug'
        $product = Product::where('slug', $slug)->first();

        if (!$product) {
            // Mengembalikan 404 jika produk tidak ditemukan
            return response()->json(['message' => 'Produk tidak ditemukan.'], 404);
        }

        $imgUrls = $product->image_urls; // Ambil array URL gambar

        // Format data yang dibutuhkan Next.js (termasuk data Schema/SEO mock)
        return response()->json([
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'price' => $product->price,
            'stock' => $product->stock,
            'jenis_barang' => $product->jenis_barang,
            'image_url' => is_array($imgUrls) && count($imgUrls) > 0 ? $imgUrls[0] : null, // Ambil URL gambar pertama
            
            // --- DATA MOCK UNTUK KELENGKAPAN SCHEMA MARKUP DI NEXT.JS ---
            'location' => 'Jakarta, Indonesia', 
            'currency' => 'IDR',
            'sku' => 'PROD-'.$product->id,
            'brand' => 'Bengkel Pedia',
            'rating' => 4.5,        // Ganti dengan logic perhitungan ulasan aktual
            'review_count' => 120,  // Ganti dengan jumlah ulasan aktual
            'in_stock' => $product->stock > 0, 
        ], 200);
    }
    
    // ================================================================
    // 🔥 METHOD BARU: GET ALL SLUGS (Untuk Dynamic Sitemap) 🔥
    // ================================================================
    public function getAllSlugs()
    {
        // Ambil hanya kolom 'slug' dari semua produk
        $slugs = Product::pluck('slug')->all();

        return response()->json([
            'slugs' => $slugs
        ], 200);
    }

    // ================================================================
    // STORE PRODUCT
    // =================================================================
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
        
        $files = $request->file('images'); 

        if (is_array($files)) {
            $publicImagesPath = public_path('images');
            if (!is_dir($publicImagesPath)) {
                mkdir($publicImagesPath, 0755, true);
            }

            foreach ($files as $img) {
                if ($img && $img->isValid()) { 
                    $filename = time() . '_' . Str::random(10) . '.' . $img->getClientOriginalExtension();
                    
                    $img->move($publicImagesPath, $filename);
                    $imageNames[] = $filename;
                }
            }
        }
        
        if (empty($imageNames)) {
            return response()->json(['message' => 'Gagal menyimpan gambar. Pastikan format gambar benar.'], 422);
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
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
        
        // Ambil URL gambar lama yang tersimpan sebagai JSON string/array di DB
        $currentRawJson = $product->getRawOriginal('img_url') ?? '[]';
        $imageNamesToDelete = json_decode($currentRawJson, true) ?? [];

        // Penanganan jika img_url bukan array JSON (legacy data)
        if (!is_array($imageNamesToDelete) && is_string($currentRawJson) && !Str::startsWith($currentRawJson, '[')) {
             $imageNamesToDelete = [$currentRawJson];
        }
        
        $imageNamesToSave = $imageNamesToDelete;

        $files = $request->file('images');

        if ($request->hasFile('images') && is_array($files)) {
            
            // 1. Hapus gambar lama
            $publicImagesPath = public_path('images');
            foreach ($imageNamesToDelete as $img) {
                if (is_string($img) && !empty($img)) {
                    $filePath = $publicImagesPath . DIRECTORY_SEPARATOR . $img;
                    if (File::exists($filePath)) {
                        File::delete($filePath);
                    }
                }
            }
            
            // 2. Upload gambar baru
            $imageNamesToSave = []; 
            if (!is_dir($publicImagesPath)) {
                mkdir($publicImagesPath, 0755, true);
            }

            foreach ($files as $img) {
                if ($img && $img->isValid()) {
                    $filename = time() . '_' . Str::random(10) . '.' . $img->getClientOriginalExtension();
                    $img->move($publicImagesPath, $filename);
                    $imageNamesToSave[] = $filename;
                }
            }
        }

        $product->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'jenis_barang' => $request->jenis_barang,
            'img_url' => $imageNamesToSave,
        ]);

        return response()->json([
            'message' => 'Produk berhasil diupdate',
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'img_urls' => $product->image_urls,
            ]
        ]);
    }

    // ================================================================
    // DELETE PRODUCT
    // ================================================================
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        
        $currentRawJson = $product->getRawOriginal('img_url') ?? '[]';
        $imageNames = json_decode($currentRawJson, true) ?? [];

        if (!is_array($imageNames) && is_string($currentRawJson) && !Str::startsWith($currentRawJson, '[')) {
             $imageNames = [$currentRawJson];
        }
        
        if (!empty($imageNames)) {
            $publicImagesPath = public_path('images');
            foreach ($imageNames as $img) {
                if (is_string($img) && !empty($img)) {
                    $filePath = $publicImagesPath . DIRECTORY_SEPARATOR . $img;
                    if (File::exists($filePath)) {
                        File::delete($filePath);
                    }
                }
            }
        }

        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus'
        ]);
    }

    // ================================================================
    // SEARCH FOR CASHIER (SUDAH DIAMANKAN)
    // ================================================================
    public function searchForCashier(Request $request)
    {
        $keyword = $request->input('q');

        if (empty($keyword)) {
            return response()->json(['products' => []], 200);
        }

        $products = Product::where('name', 'LIKE', "%{$keyword}%")
                           ->orWhere('slug', 'LIKE', "%{$keyword}%")
                           ->orWhere('description', 'LIKE', "%{$keyword}%")
                           ->limit(10) // Batasi hasil pencarian
                           ->get()
                           ->map(function ($p) {
                               $imageUrls = $p->image_urls; // Ambil array URL gambar (dari accessor/cast)
                                
                               return [
                                   'id' => $p->id,
                                   'name' => $p->name,
                                   'price' => $p->price,
                                   'stock' => $p->stock,
                                   'jenis_barang' => $p->jenis_barang,
                                   // Akses yang aman: Cek apakah array dan memiliki elemen sebelum mengakses indeks 0
                                   'img_url_first' => (is_array($imageUrls) && count($imageUrls) > 0) ? $imageUrls[0] : null,
                               ];
                           });

        return response()->json(['products' => $products], 200);
    }
}