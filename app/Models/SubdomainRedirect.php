<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubdomainRedirect extends Model
{
    use HasFactory;

    protected $fillable = [
        'subdomain',
        'destination_url',
        'http_status',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'http_status' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

