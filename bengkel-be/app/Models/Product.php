<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
     * Accessor imageUrls
     * Mengirimkan array nama file mentah ke Frontend.
     */
    protected function imageUrls(): Attribute
    {
        return Attribute::make(
            get: function () {
                $value = $this->getRawOriginal('img_url');
                
                if (is_string($value)) {
                    $decoded = json_decode($value, true);
                    $value = (json_last_error() === JSON_ERROR_NONE) ? $decoded : [$value];
                }

                if (is_array($value)) {
                    // Hanya ambil nama filenya saja, jangan pakai asset()
                    return array_filter($value);
                }

                return [];
            }
        );
    }
}