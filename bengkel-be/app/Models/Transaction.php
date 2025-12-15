<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database (sesuai migrasi Anda).
     */
    protected $table = 'transactions'; 

    /**
     * Kolom yang dapat diisi secara massal (mass assignable).
     */
    protected $fillable = [
        'cashier_user_id',
        'payment_method',
        'total_amount',
        'paid_amount',
        'change_amount',
        'transaction_date',
    ];

    /**
     * Relasi: Satu Transaksi memiliki banyak Item Transaksi.
     */
    public function items()
    {
        return $this->hasMany(TransactionItem::class, 'transaction_id');
    }

    /**
     * Relasi: Transaksi diproses oleh Kasir (User).
     */
    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_user_id');
    }
}