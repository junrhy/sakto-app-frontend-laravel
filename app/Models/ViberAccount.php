<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ViberAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_identifier',
        'account_name',
        'auth_token',
        'webhook_url',
        'webhook_events',
        'is_active',
        'is_verified',
        'last_verified_at',
        'public_account_id',
        'uri',
        'icon',
        'background',
        'category',
        'subcategory',
        'location',
        'country',
        'webhook_urls',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'webhook_events' => 'array',
        'webhook_urls' => 'array',
        'last_verified_at' => 'datetime',
    ];

    /**
     * Scope to get active accounts for a client
     */
    public function scopeActive($query, $clientIdentifier)
    {
        return $query->where('client_identifier', $clientIdentifier)
                    ->where('is_active', true);
    }

    /**
     * Scope to get verified accounts for a client
     */
    public function scopeVerified($query, $clientIdentifier)
    {
        return $query->where('client_identifier', $clientIdentifier)
                    ->where('is_verified', true)
                    ->where('is_active', true);
    }

    /**
     * Get the primary account for a client
     */
    public function scopePrimary($query, $clientIdentifier)
    {
        return $query->where('client_identifier', $clientIdentifier)
                    ->where('is_active', true)
                    ->orderBy('is_verified', 'desc')
                    ->orderBy('created_at', 'asc');
    }
}
