<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkingHour extends Model
{
     use HasFactory;

    protected $fillable = [
        'tasker_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_active'
    ];

    public function tasker()
    {
        return $this->belongsTo(Tasker::class);
    }
}
