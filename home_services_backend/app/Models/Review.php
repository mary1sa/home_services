<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tasker_id',
        'booking_id',
        'rating',
        'comment'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tasker()
    {
        return $this->belongsTo(Tasker::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function replies()
    {
        return $this->hasMany(ReviewReply::class);
    }
}
