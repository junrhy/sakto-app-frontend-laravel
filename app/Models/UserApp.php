<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserApp extends Model
{
    protected $fillable = [
        'user_identifier',
        'module_identifier',
        'billing_type',
        'price_paid',
        'invoice_id',
        'payment_status',
        'payment_transaction_id',
        'next_billing_date',
        'auto_renew',
        'cancelled_at',
        'cancellation_reason',
        'billing_metadata',
    ];

    protected $casts = [
        'price_paid' => 'decimal:2',
        'next_billing_date' => 'date',
        'auto_renew' => 'boolean',
        'cancelled_at' => 'datetime',
        'billing_metadata' => 'array',
    ];

    // Billing type constants
    public const BILLING_FREE = 'free';
    public const BILLING_ONE_TIME = 'one_time';
    public const BILLING_SUBSCRIPTION = 'subscription';

    // Payment status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';
    public const STATUS_REFUNDED = 'refunded';

    /**
     * Get the user that owns the app
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_identifier', 'identifier');
    }

    /**
     * Get the module associated with this user app
     */
    public function module()
    {
        return $this->belongsTo(Module::class, 'module_identifier', 'identifier');
    }

    /**
     * Scope to get apps for a specific user
     */
    public function scopeForUser($query, string $userIdentifier)
    {
        return $query->where('user_identifier', $userIdentifier);
    }

    /**
     * Scope to get apps for a specific module
     */
    public function scopeForModule($query, string $moduleIdentifier)
    {
        return $query->where('module_identifier', $moduleIdentifier);
    }

    /**
     * Get the invoice associated with this user app.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Scope to get apps by billing type.
     */
    public function scopeByBillingType($query, string $billingType)
    {
        return $query->where('billing_type', $billingType);
    }

    /**
     * Scope to get apps by payment status.
     */
    public function scopeByPaymentStatus($query, string $status)
    {
        return $query->where('payment_status', $status);
    }

    /**
     * Scope to get subscription apps that need billing.
     */
    public function scopeNeedsBilling($query)
    {
        return $query->where('billing_type', self::BILLING_SUBSCRIPTION)
                    ->where('payment_status', self::STATUS_PAID)
                    ->where('auto_renew', true)
                    ->where('cancelled_at', null)
                    ->where('next_billing_date', '<=', now());
    }

    /**
     * Check if the app is paid.
     */
    public function isPaid(): bool
    {
        return $this->payment_status === self::STATUS_PAID;
    }

    /**
     * Check if the app is a subscription.
     */
    public function isSubscription(): bool
    {
        return $this->billing_type === self::BILLING_SUBSCRIPTION;
    }

    /**
     * Mark app as paid.
     */
    public function markAsPaid(string $transactionId = null): void
    {
        $this->update([
            'payment_status' => self::STATUS_PAID,
            'payment_transaction_id' => $transactionId,
        ]);

        // Set next billing date for subscriptions
        if ($this->isSubscription() && $this->auto_renew) {
            $this->update([
                'next_billing_date' => now()->addMonth(),
            ]);
        }
    }

    /**
     * Cancel the app subscription.
     */
    public function cancel(string $reason = null): void
    {
        $this->update([
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'auto_renew' => false,
        ]);
    }
}
