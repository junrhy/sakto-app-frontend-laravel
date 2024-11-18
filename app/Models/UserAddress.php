<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    protected $fillable = [
        'user_id',
        'address1',
        'address2',
        'town',
        'state',
        'country',
    ];
}
