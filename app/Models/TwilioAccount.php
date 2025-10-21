<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TwilioAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_identifier',
        'account_name',
        'account_sid',
        'auth_token',
        'phone_number',
        'default_country_code',
        'is_active',
        'is_verified',
        'is_default',
        'last_verified_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'is_default' => 'boolean',
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

    /**
     * Get the default account for a client
     */
    public function scopeDefault($query, $clientIdentifier)
    {
        return $query->where('client_identifier', $clientIdentifier)
                    ->where('is_default', true)
                    ->where('is_active', true)
                    ->where('is_verified', true);
    }

    /**
     * Set this account as default and unset all other default accounts for the same client
     */
    public function setAsDefault()
    {
        // Start a transaction to ensure data consistency
        \DB::transaction(function () {
            // Unset all other default accounts for this client
            self::where('client_identifier', $this->client_identifier)
                ->where('id', '!=', $this->id)
                ->update(['is_default' => false]);

            // Set this account as default
            $this->update(['is_default' => true]);
        });
    }

    /**
     * Unset this account as default
     */
    public function unsetAsDefault()
    {
        $this->update(['is_default' => false]);
    }

    /**
     * Get default account or fallback to first active verified account
     */
    public static function getDefaultOrFirst($clientIdentifier)
    {
        // First try to get the default account
        $default = self::default($clientIdentifier)->first();
        
        if ($default) {
            return $default;
        }

        // Fallback to first active verified account
        return self::verified($clientIdentifier)->first();
    }
}
