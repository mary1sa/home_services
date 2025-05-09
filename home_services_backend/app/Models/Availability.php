<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{
    use HasFactory;

    protected $fillable = [
        'tasker_id',
        'available_date',
        'start_time',
        'end_time'
    ];

    public function tasker()
    {
        return $this->belongsTo(Tasker::class);
    }
}
