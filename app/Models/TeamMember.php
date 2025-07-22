<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class TeamMember extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'identifier',
        'first_name',
        'last_name',
        'email',
        'contact_number',
        'password',
        'roles',
        'allowed_apps',
        'last_logged_in',
        'user_identifier',
        'project_identifier',
        'is_active',
        'email_verified',
        'email_verified_at',
        'profile_picture',
        'notes',
        'permissions',
        'timezone',
        'language',
        'password_changed_at',
        'last_activity_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'roles' => 'array',
            'allowed_apps' => 'array',
            'permissions' => 'array',
            'is_active' => 'boolean',
            'email_verified' => 'boolean',
            'email_verified_at' => 'datetime',
            'last_logged_in' => 'datetime',
            'password_changed_at' => 'datetime',
            'last_activity_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($teamMember) {
            $teamMember->identifier = (string) Str::uuid();
        });

        static::updating(function ($teamMember) {
            if ($teamMember->isDirty('password')) {
                $teamMember->password_changed_at = now();
            }
        });
    }

    /**
     * Get the user that owns the team member.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_identifier', 'identifier');
    }

    /**
     * Get the project that owns the team member.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_identifier', 'identifier');
    }

    /**
     * Get the full name of the team member.
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Check if the team member has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return in_array($role, $this->roles ?? []);
    }

    /**
     * Check if the team member has any of the specified roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return !empty(array_intersect($roles, $this->roles ?? []));
    }

    /**
     * Check if the team member has access to a specific app.
     */
    public function hasAppAccess(string $appIdentifier): bool
    {
        return in_array($appIdentifier, $this->allowed_apps ?? []);
    }

    /**
     * Check if the team member has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions ?? []);
    }

    /**
     * Set the password and hash it.
     */
    public function setPasswordAttribute($value): void
    {
        $this->attributes['password'] = Hash::make($value);
    }

    /**
     * Update the last login timestamp.
     */
    public function updateLastLogin(): void
    {
        $this->update(['last_logged_in' => now()]);
    }

    /**
     * Update the last activity timestamp.
     */
    public function updateLastActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Mark the email as verified.
     */
    public function markEmailAsVerified(): void
    {
        $this->update([
            'email_verified' => true,
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'identifier';
    }
}
