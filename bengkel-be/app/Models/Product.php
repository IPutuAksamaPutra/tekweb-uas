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
                
                // Ganti defaultUrl sesuai dengan lokasi default di public/images
                $defaultUrl = asset('images/default_product.png'); 
                $urls = [];
                $imageFileNames = [];

                // --- 1. Logika Pengambilan Nama File Mentah (TETAP SAMA) ---
                if (is_string($value) && !empty($value)) {
                    $decoded = json_decode($value, true);
                    
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $imageFileNames = $decoded;
                    } elseif (!Str::startsWith($value, '[') && !Str::endsWith($value, ']')) {
                        $imageFileNames = [$value]; 
                    }
                } 
                elseif (is_array($value)) {
                    $imageFileNames = $value;
                }
                // --- 1. Logika Pengambilan Nama File Mentah (AKHIR) ---


                // --- 2. Logika Konversi ke URL (REVISI DI SINI) ---
                if (!empty($imageFileNames)) {
                    foreach ($imageFileNames as $fileName) {
                        if (!is_string($fileName) || empty($fileName)) {
                            continue; 
                        }
                        
                        // 🔥 REVISI: Path file di public/images
                        $publicPath = public_path('images/' . $fileName); 

                        // Gunakan File::exists() untuk cek di filesystem lokal (public_path)
                        if (File::exists($publicPath)) {
                            // URL yang akan digunakan di frontend: 'http://localhost:8000/images/namafile.jpg'
                            $urls[] = asset('images/' . $fileName); 
                        } else {
                            $urls[] = $defaultUrl;
                        }
                    }
                }

                // --- 3. Selalu Kembalikan Array ---
                if (empty($urls)) {
                    return [$defaultUrl];
                }

                return $urls;
            },
        );
    }
}