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
        // ❌ Hapus with('category') karena relasi sudah dihapus/diubah.
        $products = Product::all(); 

        return response()->json([
            'message' => 'Daftar produk berhasil diambil.',
            'products' => $products
        ]);
    }

    // ======================= CREATE PRODUCT =======================
    public function store(Request $request)
    {
        // 💡 PERUBAHAN KRUSIAL: category_id diganti category_type dengan validasi IN
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:products,name',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'img_url' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
            'jenis_barang' => 'required|in:Sparepart,Aksesoris', // 💡 Perubahan Validasi
        ]);

        if ($validator->fails()) {
            // Mengembalikan error 422 (Unprocessable Entity)
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $imagePath = null;
        $folder = 'products';

        if($request->hasFile('img_url')){
            $file = $request->file('img_url');
            $fileName = time().'_'.Str::slug($request->name).'.'.$file->getClientOriginalExtension();
            
            // Simpan file ke disk 'public'
            $file->storeAs($folder, $fileName, 'public'); 

            // Simpan path relatif ke database.
            $imagePath = $folder.'/'.$fileName; 
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'img_url' => $imagePath,
            'jenis_barang' => $request->jenis_barang, // 💡 Perubahan Field
        ]);

        return response()->json([
            'message' => 'Produk berhasil dibuat.',
            'product' => $product
        ], 201);
    }

    // ======================= DETAIL PRODUCT =======================
    public function show(Product $product)
    {
        // ❌ Hapus load('category')
        return response()->json([
            'message' => 'Detail produk berhasil diambil.',
            'product' => $product 
        ]);
    }

    // ======================= UPDATE PRODUCT =======================
    public function update(Request $request, Product $product)
    {
        // 💡 PERUBAHAN KRUSIAL: category_id diganti category_type
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:products,name,' . $product->id,
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'img_url' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'jenis_barang' => 'required|in:Sparepart,Aksesoris', // 💡 Perubahan Validasi
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $folder = 'products';

        // Jika upload gambar baru maka hapus gambar lama
        if ($request->hasFile('img_url')) {

            // Hapus gambar lama
            if($product->img_url){
                Storage::disk('public')->delete($product->img_url);
            }

            $file = $request->file('img_url');
            $fileName = time().'_'.Str::slug($request->name).'.'.$file->getClientOriginalExtension();
            
            // Simpan ke disk 'public'
            $file->storeAs($folder, $fileName, 'public');

            // Simpan path relatif baru ke Model
            $product->img_url = $folder.'/'.$fileName;
        }

        $product->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'jenis_barang' => $request->jenis_barang, // 💡 Perubahan Field
        ]);

        // ❌ Hapus load('category')
        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'product' => $product 
        ], 200);
    }

    // ======================= DELETE PRODUCT =======================
    public function destroy(Product $product)
    {
        // Hapus gambar dari storage 
        if($product->img_url){
            Storage::disk('public')->delete($product->img_url);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus.'
        ], 200);
    }
}