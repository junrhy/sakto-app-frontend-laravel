<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WhatsAppAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_identifier',
        'account_name',
        'access_token',
        'phone_number_id',
        'business_account_id',
        'webhook_verify_token',
        'phone_number',
        'display_name',
        'is_active',
        'is_verified',
        'webhook_urls',
        'last_verified_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
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
