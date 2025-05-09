<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;
    
     protected $fillable = [
        'category_id', 'name', 'description', 'image', 'price'
    ];

    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function taskers() {
        return $this->belongsToMany(Tasker::class, 'service_tasker');
    }

    public function bookings() {
        return $this->hasMany(Booking::class);
    }

    public function serviceReviews() {
        return $this->hasMany(ServiceReview::class);
    }
}
