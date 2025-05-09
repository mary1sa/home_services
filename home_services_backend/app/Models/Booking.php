<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'tasker_id', 'service_id', 'booking_date', 'details', 'status'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function tasker() {
        return $this->belongsTo(Tasker::class);
    }

    public function service() {
        return $this->belongsTo(Service::class);
    }

    public function payment() {
        return $this->hasOne(Payment::class);
    }

    public function invoice() {
        return $this->hasOne(Invoice::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }
}
