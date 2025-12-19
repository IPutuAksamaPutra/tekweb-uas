<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Casts\Attribute;

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
     * ⚠️ DISENGAJA TIDAK CEK File::exists() (Railway tidak support filesystem persisten)
     */
    protected function imageUrls(): Attribute
    {
        return Attribute::make(
            get: function () {
                $value = $this->getRawOriginal('img_url');
                $defaultUrl = asset('images/default_product.png');
                $urls = [];

                // Ambil nama file mentah (logika lama DIPERTAHANKAN)
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
                        if (is_string($fileName) && $fileName !== '') {
                            $urls[] = asset('images/' . $fileName);
                        }
                    }
                }

                return $urls ?: [$defaultUrl];
            }
        );
    }
}
