<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model {
    protected $fillable = [
        'user_id','vehicle','booking_date','status','notes'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}

