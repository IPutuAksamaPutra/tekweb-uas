<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    use HasFactory;
    
    // Pastikan fillable diisi agar mass assignment berfungsi
    protected $fillable = [
        'transaction_id', 'product_id', 'booking_id', 'item_type',
        'item_name', 'price', 'quantity', 'subtotal'
    ];
    
    public function transaction()
    {
        // Asumsikan Model utama transaksi Anda bernama Transaction
        return $this->belongsTo(Transaction::class); 
    }
    
    // Relasi tambahan (Opsional, tapi disarankan)
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}