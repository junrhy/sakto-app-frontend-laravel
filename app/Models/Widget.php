<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Widget extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'column',
        'dashboard_id',
        'user_id'
    ];

    protected $casts = [
        'column' => 'integer',
    ];

    public function dashboard()
    {
        return $this->belongsTo(Dashboard::class);
    }
}
