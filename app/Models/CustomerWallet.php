<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerWallet extends Model
{
    protected $fillable = [
        'customer_id',
        'client_identifier',
        'balance',
        'currency',
        'is_active',
        'last_reconciled_at',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'is_active' => 'boolean',
        'last_reconciled_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class, 'wallet_id');
    }

    public function credit(float $amount): void
    {
        $this->balance = bcadd($this->balance, $amount, 2);
    }

    public function debit(float $amount): void
    {
        $this->balance = bcsub($this->balance, $amount, 2);
    }
}

