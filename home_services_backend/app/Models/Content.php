<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
     use HasFactory;

    protected $fillable = [
        'section_name',
        'title',
        'content',
        'image',
        'status'
    ];
    protected $table = 'content';
}
