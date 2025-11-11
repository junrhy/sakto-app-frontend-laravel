<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    protected $fillable = [
        'wallet_id',
        'customer_id',
        'client_identifier',
        'type',
        'status',
        'amount',
        'balance_before',
        'balance_after',
        'reference',
        'description',
        'source_wallet_id',
        'target_wallet_id',
        'created_by',
        'metadata',
        'transaction_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array',
        'transaction_at' => 'datetime',
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(CustomerWallet::class, 'wallet_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function sourceWallet(): BelongsTo
    {
        return $this->belongsTo(CustomerWallet::class, 'source_wallet_id');
    }

    public function targetWallet(): BelongsTo
    {
        return $this->belongsTo(CustomerWallet::class, 'target_wallet_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

