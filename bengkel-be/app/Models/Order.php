<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
  protected $fillable = [
    'user_id', 'items', 'name', 'no_tlp', 'address',
    'delivery', 'payment', 'total', 'status'
];

protected $casts = [
    'items' => 'array'  // kalian tetap bisa ambil sebagai array saat get
];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

      public function review()
  {
    return $this->hasOne(Review::class);
  }

}

