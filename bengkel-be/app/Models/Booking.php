<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute; // PENTING: Import Attribute

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'jenis_kendaraan',
        'nama_kendaraan',
        'jenis_service',
        'booking_date',
        'no_wa',
        'notes',
        'status',
    ];

    // ✅ Tambahkan properti 'user_name' ke array/JSON output
    protected $appends = ['user_name']; 
    
    // Opsional: Sembunyikan objek 'user' bersarang jika Anda hanya ingin 'user_name'
    // protected $hidden = ['user'];

    // Relasi User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Accessor untuk mendapatkan nama pengguna (user_name).
     * Dipanggil setelah relasi 'user' dimuat (eager loaded).
     */
    protected function userName(): Attribute
    {
        return Attribute::make(
            // Pastikan relasi 'user' sudah dimuat, lalu ambil namanya
            get: fn () => $this->user->name ?? null, 
        );
    }
}