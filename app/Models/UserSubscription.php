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
    ];

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
        return $this->status === 'active' && $this->end_date > now();
    }

    /**
     * Check if the subscription is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if the subscription is expired.
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired' || $this->end_date < now();
    }

    /**
     * Cancel the subscription.
     */
    public function cancel(string $reason = null): bool
    {
        $this->status = 'cancelled';
        $this->cancelled_at = now();
        $this->cancellation_reason = $reason;
        $this->auto_renew = false;
        
        return $this->save();
    }
}
