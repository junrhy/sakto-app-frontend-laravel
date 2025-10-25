<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCustomer extends Model
{
    protected $table = 'user_customers';

    protected $fillable = [
        'user_id',
        'customer_id',
        'relationship_type',
        'is_active',
        'total_spent',
        'total_orders',
        'first_purchase_at',
        'last_purchase_at',
        'metadata',
    ];

    protected $casts = [
        'first_purchase_at' => 'datetime',
        'last_purchase_at' => 'datetime',
        'is_active' => 'boolean',
        'total_spent' => 'decimal:2',
        'total_orders' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Get the business (user type account)
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the customer (customer type account)
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Check if customer is active
     */
    public function isActiveCustomer(): bool
    {
        return $this->is_active === true;
    }

    /**
     * Check if customer has made purchases
     */
    public function hasPurchases(): bool
    {
        return $this->total_orders > 0;
    }

    /**
     * Get customer value tier based on spending
     */
    public function getValueTier(): string
    {
        if ($this->total_spent >= 10000) return 'VIP';
        if ($this->total_spent >= 5000) return 'Gold';
        if ($this->total_spent >= 1000) return 'Silver';
        return 'Bronze';
    }
}