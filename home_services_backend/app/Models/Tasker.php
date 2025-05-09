<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tasker extends Model
{
    use HasFactory;
    
     protected $fillable = [
        'user_id', 'country', 'cin', 'certificate_police', 'bio', 'experience', 'photo', 'status'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function portfolioImages() {
        return $this->hasMany(PortfolioImage::class);
    }

    public function services() {
        return $this->belongsToMany(Service::class, 'service_tasker');
    }

    public function bookings() {
        return $this->hasMany(Booking::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }

     public function reviewReplies()
    {
        return $this->hasMany(ReviewReply::class);
    }

    public function availabilities() {
        return $this->hasMany(Availability::class);
    }

    public function workingHours() {
        return $this->hasMany(WorkingHour::class);
    }

    
}
