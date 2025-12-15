<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Import Attribute tidak diperlukan jika Accessor dihapus
// use Illuminate\Database\Eloquent\Casts\Attribute; 

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
    
    // 🔥 DIHAPUS: protected $appends = ['user_name'];
    // Karena logika penambahan 'user_name' sudah dilakukan di Controller::pendingForCashier

    // Relasi User
    public function user()
    {
        // Parameter kedua ('user_id') adalah foreign key, parameter ketiga ('id') adalah primary key dari target (User)
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // 🔥 DIHAPUS: protected function userName(): Attribute
}