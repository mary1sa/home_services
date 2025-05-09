<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id', 'invoice_number', 'invoice_date', 'total'
    ];

    public function booking() {
        return $this->belongsTo(Booking::class);
    }
}
