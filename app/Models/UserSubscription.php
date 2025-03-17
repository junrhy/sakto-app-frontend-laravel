<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class UserSubscription extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_identifier',
        'subscription_plan_id',
        'start_date',
        'end_date',
        'status',
        'cancelled_at',
        'payment_method',
        'payment_transaction_id',
        'amount_paid',
        'proof_of_payment',
        'auto_renew',
        'cancellation_reason',
        'last_credit_date',
        'maya_checkout_id',
        'maya_subscription_id',
        'maya_payment_token_id',
        'next_billing_date',
        'billing_cycle',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'cancelled_at' => 'datetime',
        'amount_paid' => 'decimal:2',
        'auto_renew' => 'boolean',
        'last_credit_date' => 'datetime',
        'next_billing_date' => 'datetime',
    ];

    /**
     * The possible status values.
     *
     * @var array<string>
     */
    public const STATUS_ACTIVE = 'active';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_PENDING = 'pending';
    public const STATUS_FAILED = 'failed';

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subscription) {
            $subscription->identifier = (string) Str::uuid();
        });
    }

    /**
     * Get the subscription plan that owns the subscription.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    /**
     * Check if the subscription is active.
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE && $this->end_date > now();
    }

    /**
     * Check if the subscription is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if the subscription is expired.
     */
    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED || $this->end_date < now();
    }

    /**
     * Check if the subscription is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if the subscription payment failed.
     */
    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Check if the subscription has a Maya subscription ID.
     */
    public function hasMayaSubscription(): bool
    {
        return !empty($this->maya_subscription_id);
    }

    /**
     * Cancel the subscription.
     */
    public function cancel(string $reason = null): bool
    {
        $this->status = self::STATUS_CANCELLED;
        $this->cancelled_at = now();
        $this->cancellation_reason = $reason;
        $this->auto_renew = false;
        
        return $this->save();
    }
}
