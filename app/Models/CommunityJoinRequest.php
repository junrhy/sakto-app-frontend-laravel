<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CommunityJoinRequest extends Model
{
    protected $fillable = [
        'community_id',
        'customer_id',
        'status',
        'approval_token',
        'approved_at',
        'denied_at',
        'message',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'denied_at' => 'datetime',
    ];

    /**
     * Boot method to generate approval token
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->approval_token)) {
                $model->approval_token = Str::random(64);
            }
        });
    }

    /**
     * Get the community (user)
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(User::class, 'community_id');
    }

    /**
     * Get the customer
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Check if request is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if request is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if request is denied
     */
    public function isDenied(): bool
    {
        return $this->status === 'denied';
    }

    /**
     * Approve the join request
     */
    public function approve(): void
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);
    }

    /**
     * Deny the join request
     */
    public function deny(): void
    {
        $this->update([
            'status' => 'denied',
            'denied_at' => now(),
        ]);
    }
}
