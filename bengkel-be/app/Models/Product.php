<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Casts\Attribute; 

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'price', 'stock', 'jenis_barang', 'img_url',
    ];

    // Kolom di DB yang menyimpan JSON array nama file
    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'img_url' => 'array', 
    ];

    /**
     * Accessor untuk mendapatkan daftar URL gambar produk.
     * Logika ini dirancang untuk menangani:
     * 1. Data lama (single string filename)
     * 2. Data baru (JSON array of filenames)
     * 3. Data null/kosong
     */
    protected function imageUrls(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Ambil nilai mentah dari kolom img_url
                $value = $this->getRawOriginal('img_url'); 
                
                $defaultUrl = asset('images/default_product.png');
                $urls = [];
                $imageFileNames = [];

                // --- 1. Logika Pengambilan Nama File Mentah ---
                if (is_string($value) && !empty($value)) {
                    // Coba decode JSON
                    $decoded = json_decode($value, true);
                    
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        // Kasus A: String JSON valid (Data baru)
                        $imageFileNames = $decoded;
                    } elseif (!Str::startsWith($value, '[') && !Str::endsWith($value, ']') ) {
                        // Kasus B: String Tunggal (Data lama)
                        // Hanya tambahkan jika ini bukan string array yang gagal decode
                        $imageFileNames = [$value]; 
                    }
                } 
                elseif (is_array($value)) {
                    // Kasus C: Sudah array (Casting berhasil)
                    $imageFileNames = $value;
                }

                // --- 2. Logika Konversi ke URL ---
                if (!empty($imageFileNames)) {
                    foreach ($imageFileNames as $fileName) {
                        if (!is_string($fileName) || empty($fileName)) {
                            continue; 
                        }
                        // Path file di storage/app/public/
                        $storagePath = 'products/' . $fileName; 

                        if (Storage::disk('public')->exists($storagePath)) {
                            // URL yang akan digunakan di frontend
                            $urls[] = asset('storage/' . $storagePath); 
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