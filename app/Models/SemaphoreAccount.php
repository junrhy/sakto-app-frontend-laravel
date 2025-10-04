<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SemaphoreAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_identifier',
        'account_name',
        'api_key',
        'sender_name',
        'is_active',
        'is_verified',
        'last_verified_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
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
            ->where('is_verified', true);
    }

    /**
     * Scope to get active and verified accounts for a client
     */
    public function scopeActiveAndVerified($query, $clientIdentifier)
    {
        return $query->where('client_identifier', $clientIdentifier)
            ->where('is_active', true)
            ->where('is_verified', true);
    }
}
