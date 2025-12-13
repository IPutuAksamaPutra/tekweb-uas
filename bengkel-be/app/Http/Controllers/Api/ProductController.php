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
    // SHOW DETAIL PRODUCT
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
    // STORE PRODUCT (DIPERBAIKI UNTUK MULTI-IMAGE)
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
                    // 🔥 PERUBAHAN: Menggunakan Str::random(10) untuk keunikan yang lebih baik
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
    // UPDATE PRODUCT (DIPERBAIKI UNTUK MULTI-IMAGE)
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
        
        $currentRawJson = $product->getRawOriginal('img_url') ?? '[]';
        $imageNamesToDelete = json_decode($currentRawJson, true) ?? [];

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
                    // 🔥 PERUBAHAN: Menggunakan Str::random(10) untuk keunikan yang lebih baik
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
    // DELETE PRODUCT (TETAP SAMA, KARENA LOGIKA ANDA SUDAH BENAR)
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
    
    // ... (Fungsi lain seperti searchForCashier)
}