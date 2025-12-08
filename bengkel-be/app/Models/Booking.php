<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    // Relasi User
    public function user()
    {
          return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Hapus relasi service karena tidak ada lagi kolom services_id
}