<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dashboard extends Model
{
    protected $fillable = [
        'name',
        'user_id',
        'widgets',
        'is_starred',
        'column_count',
        'app',
        'is_default'
    ];

    protected $casts = [
        'widgets' => 'array',
        'is_starred' => 'boolean',
        'column_count' => 'integer',
        'is_default' => 'boolean'
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
