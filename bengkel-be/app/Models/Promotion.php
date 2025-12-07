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
     * Relasi Many-to-Many ke Product.
     */
    public function products()
    {
        // Secara default Laravel akan mencari tabel pivot 'product_promotion'
        return $this->belongsToMany(Product::class, 'product_promotion');
    }
    public function promotions()
    {
        // Secara default Laravel akan mencari tabel pivot 'product_promotion'
        return $this->belongsToMany(Promotion::class, 'product_promotion');
    }
}