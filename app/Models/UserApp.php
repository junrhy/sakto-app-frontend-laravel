<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserApp extends Model
{
    protected $fillable = [
        'user_identifier',
        'module_identifier',
    ];

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
}
