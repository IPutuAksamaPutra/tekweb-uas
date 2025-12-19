<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Casts\Attribute; 
use Illuminate\Support\Facades\File; // Tambahkan untuk cek keberadaan file di public_path

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'price', 'stock', 'jenis_barang', 'img_url',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'img_url' => 'array', 
    ];

    /**
     * Accessor untuk mendapatkan daftar URL gambar produk.
     * Menggunakan asset() dengan path 'images/' karena controller menyimpan di public/images.
     */
   protected function imageUrls(): Attribute
{
    return Attribute::make(
        get: function () {
            $value = $this->getRawOriginal('img_url');
            $defaultUrl = asset('images/default_product.png');
            $urls = [];

            if (is_string($value)) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $value = $decoded;
                } else {
                    $value = [$value];
                }
            }

            if (is_array($value)) {
                foreach ($value as $fileName) {
                    if ($fileName) {
                        // ⬇️ LANGSUNG URL, JANGAN CEK FILE
                        $urls[] = asset('images/' . $fileName);
                    }
                }
            }

            return $urls ?: [$defaultUrl];
        }
    );
}

}