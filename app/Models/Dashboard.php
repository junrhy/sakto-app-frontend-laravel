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
        'column_count'
    ];

    protected $casts = [
        'widgets' => 'array',
        'is_starred' => 'boolean',
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
