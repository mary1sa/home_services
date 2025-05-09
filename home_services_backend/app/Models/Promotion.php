<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
     use HasFactory;

    protected $fillable = ['name', 'discount_type', 'discount_value', 'start_date', 'end_date', 'is_active'];

    public function codes()
    {
        return $this->hasMany(PromotionCode::class);
    }
}
