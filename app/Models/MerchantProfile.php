<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MerchantProfile extends Model
{
    protected $fillable = [
        'user_id',
        'business_name',
        'business_type',
        'industry',
        'website',
        'phone',
        'street',
        'city',
        'state',
        'country',
        'postal_code',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
