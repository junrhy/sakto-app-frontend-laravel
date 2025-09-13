<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = [
        'name',
        'identifier',
        'title',
        'route',
        'visible',
        'description',
        'price',
        'categories',
        'coming_soon',
        'pricing_type',
        'included_in_plans',
        'bg_color',
        'icon',
        'rating',
        'order',
        'is_active'
    ];

    protected $casts = [
        'visible' => 'boolean',
        'coming_soon' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'rating' => 'decimal:1',
        'categories' => 'array',
        'included_in_plans' => 'array',
        'order' => 'integer'
    ];

    /**
     * Scope to get only active modules
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get only visible modules
     */
    public function scopeVisible($query)
    {
        return $query->where('visible', true);
    }

    /**
     * Scope to order modules by order field
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('title');
    }

    /**
     * Get modules that are included in specific plans
     */
    public function scopeIncludedInPlans($query, array $plans)
    {
        return $query->where(function ($q) use ($plans) {
            foreach ($plans as $plan) {
                $q->orWhereJsonContains('included_in_plans', $plan);
            }
        });
    }

    /**
     * Check if module is included in a specific plan
     */
    public function isIncludedInPlan(string $plan): bool
    {
        return in_array($plan, $this->included_in_plans ?? []);
    }

    /**
     * Get the route for the module
     */
    public function getRouteAttribute($value)
    {
        // If route is null, generate default route from identifier
        if (empty($value)) {
            return "/dashboard?app={$this->identifier}";
        }
        return $value;
    }
}
