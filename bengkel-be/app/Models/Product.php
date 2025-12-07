<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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
        'img_url',
    ];

    // akses URL gambar otomatis
    public function getImageUrlAttribute()
    {
        if ($this->img_url) {
            return asset('storage/products/'.$this->img_url);
        }

        return asset('images/default_product.png'); // fallback
    }
}
