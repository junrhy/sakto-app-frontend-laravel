<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'contact_number',
        'app_currency',
        'theme',
        'theme_color',
        'google_id',
        'project_identifier',
        'identifier',
        'is_admin',
        'slug',
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
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_identifier', 'identifier');
    }

    public function currentDashboard(): HasOne
    {
        return $this->hasOne(Dashboard::class, 'user_id', 'id')->where('is_default', true);
    }

    public function latestWidget(): HasOne
    {
        return $this->hasOne(Widget::class, 'user_id', 'id')->latestOfMany();
    }

    /**
     * Get the user's active subscription.
     */
    public function subscription()
    {
        return $this->hasOne(UserSubscription::class, 'user_identifier', 'identifier')
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->with('plan');
    }

    /**
     * Check if the user is an admin.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->is_admin;
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($user) {
            $user->identifier = (string) Str::uuid();
            
            // Generate slug from name if not provided
            if (empty($user->slug)) {
                $user->slug = $user->generateSlug();
            }
        });

        static::updating(function ($user) {
            // Regenerate slug if name changed
            if ($user->isDirty('name') && !$user->isDirty('slug')) {
                $user->slug = $user->generateSlug();
            }
        });
    }

    /**
     * Generate a unique slug for the user
     */
    public function generateSlug(): string
    {
        $baseSlug = Str::slug($this->name);
        $slug = $baseSlug;
        $counter = 1;
        
        // Ensure unique slug
        while (static::where('slug', $slug)->where('id', '!=', $this->id)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the short URL for this user
     */
    public function getShortUrlAttribute(): string
    {
        return route('member.short', ['identifier' => $this->slug ?? $this->id]);
    }
}
