<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromotionCode extends Model
{
     use HasFactory;

    protected $fillable = ['promotion_id', 'code'];

    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }
}
