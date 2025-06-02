<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    protected $fillable = ['tasker_id', 'user_id', 'is_like'];

    public function tasker()
    {
        return $this->belongsTo(Tasker::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}