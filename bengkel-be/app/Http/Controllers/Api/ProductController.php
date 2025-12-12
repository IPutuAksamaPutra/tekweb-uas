<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // ================================================================
    // GET ALL PRODUCTS (DIURUTKAN TERBARU DULU)
    // ================================================================
    public function index()
    {
        // 💡 PERBAIKAN: Gunakan latest() untuk mengurutkan berdasarkan created_at secara descending (Terbaru Dulu)
        $products = Product::latest()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'description' => $p->description,
                'price' => $p->price,
                'stock' => $p->stock,
                'jenis_barang' => $p->jenis_barang,
                // Menggunakan Accessor image_urls untuk mendapatkan array URL
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
                // Menggunakan Accessor image_urls
                'img_urls' => $product->image_urls, 
            ]
        ]);
    }

    // ================================================================
    // STORE PRODUCT (MULTI-IMAGE AMAN)
    // =================================================================
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'stock' => 'required|integer',
            'jenis_barang' => 'nullable|string',
            // Validasi array file
            'images' => 'required|array|max:5', 
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $imageNames = [];

        if ($request->hasFile('images')) {
            $files = $request->file('images'); 
            
            if (is_array($files)) {
                foreach ($files as $img) {
                    // 💡 Memastikan file valid sebelum disimpan
                    if ($img && $img->isValid()) { 
                        $filename = time() . '_' . uniqid() . '.' . $img->getClientOriginalExtension();
                        // Simpan ke storage/app/public/products
                        $img->storeAs('public/products', $filename);
                        $imageNames[] = $filename; // Tambahkan ke array
                    }
                }
            }
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'jenis_barang' => $request->jenis_barang,
            'img_url' => $imageNames, // Menyimpan array nama file mentah
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
    // UPDATE PRODUCT (GANTI SEMUA GAMBAR)
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
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048', // optional file
        ]);
        
        // Dapatkan nama file yang ada (mentah dari DB) untuk dihapus
        $currentRawJson = $product->getRawOriginal('img_url') ?? '[]';
        $imageNamesToDelete = json_decode($currentRawJson, true) ?? [];

        // Logika tambahan untuk menangani data lama yang bukan JSON array (string tunggal)
        if (!is_array($imageNamesToDelete) && is_string($currentRawJson) && !Str::startsWith($currentRawJson, '[')) {
             $imageNamesToDelete = [$currentRawJson];
        }
        
        $imageNamesToSave = $imageNamesToDelete;

        if ($request->hasFile('images')) {
            $files = $request->file('images');
            
            // Hapus gambar lama dari storage
            foreach ($imageNamesToDelete as $img) {
                if (is_string($img) && !empty($img)) {
                    Storage::delete('public/products/' . $img);
                }
            }
            
            // Upload gambar baru
            $imageNamesToSave = []; 
            if (is_array($files)) {
                foreach ($files as $img) {
                    if ($img && $img->isValid()) {
                        $filename = time() . '_' . uniqid() . '.' . $img->getClientOriginalExtension();
                        $img->storeAs('public/products', $filename);
                        $imageNamesToSave[] = $filename;
                    }
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
            'img_url' => $imageNamesToSave, // Menyimpan array nama file mentah
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
        
        // Dapatkan nama file yang ada (mentah dari DB) untuk dihapus
        $currentRawJson = $product->getRawOriginal('img_url') ?? '[]';
        $imageNames = json_decode($currentRawJson, true) ?? [];

        // Logika tambahan untuk menangani data lama yang bukan JSON array (string tunggal)
        if (!is_array($imageNames) && is_string($currentRawJson) && !Str::startsWith($currentRawJson, '[')) {
             $imageNames = [$currentRawJson];
        }
        
        // Hapus semua file gambar di storage
        if (!empty($imageNames)) {
            foreach ($imageNames as $img) {
                if (is_string($img) && !empty($img)) {
                    Storage::delete('public/products/' . $img);
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