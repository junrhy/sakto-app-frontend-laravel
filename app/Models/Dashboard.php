<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dashboard extends Model
{
    protected $fillable = [
        'name',
        'user_id',
        'widgets',
        'favorite',
        'column_count'
    ];

    protected $casts = [
        'widgets' => 'array',
        'favorite' => 'boolean',
        'column_count' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function widgets()
    {
        return $this->hasMany(Widget::class);
    }
}
