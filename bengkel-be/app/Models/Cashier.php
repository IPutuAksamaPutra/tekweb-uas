<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cashier extends Model
{
    use HasFactory;
    
    // 🔥 KOREKSI 1: Arahkan ke tabel 'transactions' yang baru
    // Asumsi tabel transaksi utama Anda kini bernama 'transactions'
    protected $table = 'transactions'; 

    // 🔥 KOREKSI 2: Perbarui fillable sesuai kolom tabel 'transactions' yang baru
    protected $fillable = [
        'cashier_user_id', // Tambahkan kolom FK Kasir
        'payment_method',
        'total_amount',    // Mengganti 'total' menjadi 'total_amount'
        'paid_amount',     // Kolom baru untuk uang yang diterima
        'change_amount',   // Kolom baru untuk kembalian
        'transaction_date',
    ];
    
    // Relasi 
    
    // 🔥 KOREKSI 3: Tambahkan relasi ke Detail Item (Baris paling penting)
    public function items()
    {
        // Menghubungkan ke Model TransactionItem yang baru Anda buat
        return $this->hasMany(TransactionItem::class, 'transaction_id');
    }
    
    // Relasi ke Kasir (User)
    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_user_id');
    }
    
    // Hapus relasi product() dan booking() yang lama karena kini ada di TransactionItem
    // public function product() // Dihapus
    // public function booking() // Dihapus
}