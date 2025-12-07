<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // Tambahkan ini jika belum ada
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Use HasFactory adalah praktik terbaik untuk seeding/testing
    use HasFactory; 

    // Laravel secara default mencari 'created_at' dan 'updated_at'.
    // Jika Anda menggunakan 'create_at' dan 'update_at', Anda perlu memberitahu Laravel
    const CREATED_AT = 'create_at'; 
    const UPDATED_AT = 'update_at';

    // Set $timestamps ke false sudah benar jika Anda mendefinisikan kolom sendiri
    // Namun, jika Anda menggunakan konstanta di atas, Anda bisa hapus baris ini,
    // atau biarkan $timestamps = true (default).
    // Saya akan hapus $timestamps = false karena kita sudah mendefinisikan nama konstanta di atas.

    protected $table = 'products';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'jenis_barang',
        // --- TAMBAHAN PENTING ---
        'img_url', // Wajib ditambahkan agar bisa di-Mass Assign saat CREATE/UPDATE
        'create_at', // Pertahankan jika ini nama kolom Anda
        'update_at', // Pertahankan jika ini nama kolom Anda
    ];

    // Kolom date yang harus diubah menjadi instance Carbon
    protected $dates = [self::CREATED_AT, self::UPDATED_AT]; 
    // Jika Anda menggunakan kolom default (created_at, updated_at), baris ini tidak perlu.

    // -------------------------------------------------------------
    // ACCESSSOR untuk kemudahan mendapatkan URL gambar publik
    // -------------------------------------------------------------
    /**
     * Accessor untuk mendapatkan URL gambar produk yang lengkap.
     * Dipanggil sebagai $product->image_url
     * Akan merujuk ke /storage/products/nama-file.jpg
     */
    public function getImageUrlAttribute()
    {
        // Pastikan img_url memiliki nilai di database (e.g., products/filename.jpg)
        if ($this->img_url) {
            // Menggunakan helper asset('storage/') untuk mendapatkan URL publik
            // Ini berfungsi karena Controller menyimpan path relatif ke disk 'public'.
            return asset('storage/' . $this->img_url);
        }

        // Kembalikan URL gambar default jika tidak ada gambar
        return asset('images/default_product.png'); 
    }

    // -------------------------------------------------------------
    // RELASI
    // -------------------------------------------------------------
    /**
     * Relasi: Produk dimiliki oleh satu Category
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}