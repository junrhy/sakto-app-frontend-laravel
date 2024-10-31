<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Widget extends Model
{
    protected $fillable = [
        'type',
        'column',
        'dashboard_id',
        'user_id'
    ];

    public function dashboard()
    {
        return $this->belongsTo(Dashboard::class);
    }
}
