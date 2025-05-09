<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceTasker extends Model
{
    use HasFactory;
    
     protected $fillable = [
        'tasker_id', 'service_id'
    ];
}
