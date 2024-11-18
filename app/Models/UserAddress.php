<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    protected $fillable = [
        'user_id',
        'address_type',
        'street',
        'unit_number',
        'city',
        'state',
        'postal_code',
        'country',
        'phone',
        'is_primary',
    ];
}
