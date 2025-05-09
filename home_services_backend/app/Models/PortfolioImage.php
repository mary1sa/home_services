<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'tasker_id',
        'image_path',
        'title',
        'description'
    ];

    public function tasker()
    {
        return $this->belongsTo(Tasker::class);
    }
}
