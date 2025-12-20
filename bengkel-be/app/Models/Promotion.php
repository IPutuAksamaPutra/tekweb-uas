<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'discount_type', 
        'discount_value', 
        'start_date', 
        'end_date', 
        'is_active',
    ];

    /**
     * Casting tipe data agar konsisten saat dikirim ke Frontend (Next.js)
     */
    protected $casts = [
        'is_active' => 'boolean',
        'discount_value' => 'float',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    /**
     * Relasi ke produk (Pastikan nama tabel pivot benar)
     */
    public function products()
    {
        // Gunakan withTimestamps jika tabel pivot memiliki kolom created_at/updated_at
        return $this->belongsToMany(Product::class, 'product_promotion', 'promotion_id', 'product_id')
                    ->withTimestamps(); 
    }
}