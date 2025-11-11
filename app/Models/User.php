<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;
use LemonSqueezy\Laravel\Billable;
use App\Models\CustomerWallet;
use App\Models\WalletTransaction;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, Billable;

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
        'user_type',
        'trial_started_at',
        'trial_ends_at',
        'trial_expired_notification_sent',
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
            'trial_started_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'trial_expired_notification_sent' => 'boolean',
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
     * Get the user's subscription data for frontend consumption.
     */
    public function getSubscriptionDataAttribute()
    {
        $subscription = $this->subscription;
        
        if (!$subscription) {
            return null;
        }
        
        return [
            'id' => $subscription->id,
            'identifier' => $subscription->identifier,
            'status' => $subscription->status,
            'start_date' => $subscription->start_date,
            'end_date' => $subscription->end_date,
            'plan' => $subscription->plan ? [
                'id' => $subscription->plan->id,
                'name' => $subscription->plan->name,
                'slug' => $subscription->plan->slug,
                'unlimited_access' => $subscription->plan->unlimited_access,
                'features' => $subscription->plan->features,
            ] : null,
        ];
    }

    /**
     * Get the user's project data for frontend consumption.
     */
    public function getProjectDataAttribute()
    {
        $project = $this->project;
        
        if (!$project) {
            return null;
        }
        
        return [
            'id' => $project->id,
            'name' => $project->name,
            'identifier' => $project->identifier,
            'enabledModules' => $project->enabledModules,
        ];
    }

    /**
     * Get the user's team members data for frontend consumption.
     */
    public function getTeamMembersDataAttribute()
    {
        return \App\Models\TeamMember::where('user_identifier', $this->identifier)
            ->where('project_identifier', $this->project_identifier)
            ->where('is_active', true)
            ->get()
            ->map(function ($member) {
                return [
                    'identifier' => $member->identifier,
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'full_name' => $member->full_name,
                    'email' => $member->email,
                    'roles' => $member->roles ?? [],
                    'allowed_apps' => $member->allowed_apps ?? [],
                    'profile_picture' => $member->profile_picture,
                ];
            });
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(CustomerWallet::class, 'customer_id');
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class, 'customer_id');
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

    /**
     * Start a free trial for the user.
     *
     * @param int $days Number of days for the trial (default: 14)
     * @return bool
     */
    public function startTrial(int $days = 14): bool
    {
        // Don't start trial if user already has an active subscription
        if ($this->hasActiveSubscription()) {
            return false;
        }

        // Don't start trial if user already had a trial
        if ($this->hasHadTrial()) {
            return false;
        }

        $this->trial_started_at = now();
        $this->trial_ends_at = now()->addDays($days);
        $this->trial_expired_notification_sent = false;

        return $this->save();
    }

    /**
     * Check if the user is currently on a trial.
     *
     * @return bool
     */
    public function onTrial(): bool
    {
        return $this->trial_ends_at !== null && 
               $this->trial_ends_at->isFuture();
    }

    /**
     * Check if the user has ever had a trial.
     *
     * @return bool
     */
    public function hasHadTrial(): bool
    {
        return $this->trial_started_at !== null;
    }

    /**
     * Check if the user's trial has expired.
     *
     * @return bool
     */
    public function trialExpired(): bool
    {
        return $this->trial_ends_at !== null && 
               $this->trial_ends_at->isPast();
    }

    /**
     * Get the number of days remaining in the trial.
     *
     * @return int
     */
    public function trialDaysRemaining(): int
    {
        if (!$this->onTrial()) {
            return 0;
        }

        return max(0, now()->diffInDays($this->trial_ends_at, false));
    }

    /**
     * Check if the user has an active subscription.
     *
     * @return bool
     */
    public function hasActiveSubscription(): bool
    {
        return $this->subscription !== null;
    }

    /**
     * Check if the user has access to premium features.
     * Returns true if user has active subscription OR is on valid trial.
     *
     * @return bool
     */
    public function hasAccess(): bool
    {
        return $this->hasActiveSubscription() || $this->onTrial();
    }

    /**
     * Get the trial data for frontend consumption.
     */
    public function getTrialDataAttribute()
    {
        if (!$this->trial_started_at) {
            return [
                'active' => false,
                'started_at' => null,
                'ends_at' => null,
                'days_remaining' => 0,
                'expired' => false,
            ];
        }

        return [
            'active' => $this->onTrial(),
            'started_at' => $this->trial_started_at,
            'ends_at' => $this->trial_ends_at,
            'days_remaining' => $this->trialDaysRemaining(),
            'expired' => $this->trialExpired(),
        ];
    }

    /**
     * Check if the user is a customer.
     *
     * @return bool
     */
    public function isCustomer(): bool
    {
        return $this->user_type === 'customer';
    }

    /**
     * Check if the user is a merchant.
     */
    public function isMerchant(): bool
    {
        return $this->user_type === 'merchant';
    }

    /**
     * Check if the user is an employee.
     */
    public function isEmployee(): bool
    {
        return $this->user_type === 'employee';
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        if ($this->isCustomer()) {
            $this->notify(new \App\Notifications\CustomerVerifyEmail);
        } else {
            parent::sendEmailVerificationNotification();
        }
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
            
            // Auto-start 14-day trial for new users (except admin users and customer type)
            if (!$user->is_admin && $user->user_type !== 'customer') {
                $user->trial_started_at = now();
                $user->trial_ends_at = now()->addDays(14);
                $user->trial_expired_notification_sent = false;
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

    /**
     * Get the merchant profile associated with the user.
     */
    public function merchantProfile(): HasOne
    {
        return $this->hasOne(MerchantProfile::class);
    }

    /**
     * Get all customers for this business (user type account)
     */
    public function customers(): HasMany
    {
        return $this->hasMany(UserCustomer::class, 'user_id');
    }

    /**
     * Get all businesses this customer is connected to (customer type account)
     */
    public function businesses(): HasMany
    {
        return $this->hasMany(UserCustomer::class, 'customer_id');
    }

    /**
     * Check if this user (business) has customers
     */
    public function hasCustomers(): bool
    {
        return $this->customers()->where('is_active', true)->exists();
    }

    /**
     * Check if this customer is connected to any business
     */
    public function isConnectedToBusiness(): bool
    {
        return $this->businesses()->where('is_active', true)->exists();
    }

    /**
     * Get active customers for this business
     */
    public function getActiveCustomersAttribute()
    {
        return $this->customers()
            ->with('customer')
            ->where('is_active', true)
            ->get()
            ->pluck('customer');
    }

    /**
     * Get total number of customers for this business
     */
    public function getTotalCustomersAttribute(): int
    {
        return $this->customers()->where('is_active', true)->count();
    }

    /**
     * Get all businesses this customer belongs to
     */
    public function getMyBusinessesAttribute()
    {
        return $this->businesses()
            ->with('business')
            ->where('is_active', true)
            ->get()
            ->pluck('business');
    }
}
