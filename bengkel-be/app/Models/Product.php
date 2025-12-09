<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Casts\Attribute; // <-- Pastikan ini diimpor!

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'jenis_barang',
        'img_url', // Ini akan menyimpan hanya NAMA FILE
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];

    /**
     * Accessor untuk mendapatkan URL gambar penuh.
     * Nama method harus getImgUrlAttribute
     */
    public function getImgUrlAttribute(string $value = null): string
    {
        // Jika kolom img_url di database memiliki nilai (bukan NULL)
        if ($value) {
            $pathWithFolder = 'products/' . $value;

            // Cek apakah file benar-benar ada di storage/app/public/products/
            if (Storage::disk('public')->exists($pathWithFolder)) {
                // Gunakan asset() untuk mendapatkan base URL + storage/path
                return asset('storage/' . $pathWithFolder);
            }
        }

        // URL fallback (default) jika tidak ada gambar atau file tidak ditemukan
        return asset('images/default_product.png'); 
    }
}