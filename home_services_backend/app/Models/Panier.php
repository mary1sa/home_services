<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Panier extends Model
{
     use HasFactory;

    protected $fillable = ['user_id', 'tasker_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tasker()
    {
        return $this->belongsTo(Tasker::class);
    }
}
