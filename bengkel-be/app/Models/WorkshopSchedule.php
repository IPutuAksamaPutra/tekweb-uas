<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkshopSchedule extends Model {
    protected $fillable = ['day','open_time','close_time','is_closed'];
}

