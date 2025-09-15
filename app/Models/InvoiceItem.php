<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'item_type',
        'item_identifier',
        'description',
        'quantity',
        'unit_price',
        'total_price',
        'metadata',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'quantity' => 'integer',
        'metadata' => 'array',
    ];

    // Item type constants
    public const TYPE_SUBSCRIPTION_PLAN = 'subscription_plan';
    public const TYPE_APP_PURCHASE = 'app_purchase';
    public const TYPE_APP_SUBSCRIPTION = 'app_subscription';

    /**
     * Get the invoice that owns the item.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the module associated with this item (for app purchases/subscriptions).
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'item_identifier', 'identifier');
    }

    /**
     * Get the subscription plan associated with this item.
     */
    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'item_identifier', 'id');
    }

    /**
     * Calculate total price based on quantity and unit price.
     */
    public function calculateTotalPrice(): float
    {
        return $this->quantity * $this->unit_price;
    }

    /**
     * Scope to get items by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('item_type', $type);
    }

    /**
     * Scope to get app-related items.
     */
    public function scopeAppItems($query)
    {
        return $query->whereIn('item_type', [self::TYPE_APP_PURCHASE, self::TYPE_APP_SUBSCRIPTION]);
    }
}
