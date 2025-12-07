<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $table = 'cart_items';
    public $timestamps = true;

    protected $fillable = [
        'user_id',    // Wajib ada di fillable karena Anda baru menambahkannya ke tabel
        'product_id',
        'quantity',
    ];

    /**
     * Relasi: Item keranjang dimiliki oleh satu Produk.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
    
    /**
     * Relasi: Item keranjang dimiliki oleh satu User (pemilik keranjang).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}