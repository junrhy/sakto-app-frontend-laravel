<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SubscriptionLimitService
{
    protected $apiUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Check if user can create a resource based on their subscription limits
     *
     * @param string $app App identifier (e.g., 'pos_restaurant', 'inventory')
     * @param string $resource Resource type (e.g., 'tables', 'reservations', 'menu_items')
     * @param string|null $userIdentifier User identifier (defaults to authenticated user)
     * @return array ['allowed' => bool, 'current' => int, 'limit' => int, 'message' => string]
     */
    public function canCreate(string $app, string $resource, ?string $userIdentifier = null): array
    {
        $user = $userIdentifier ? User::where('identifier', $userIdentifier)->first() : auth()->user();

        if (!$user) {
            return [
                'allowed' => false,
                'current' => 0,
                'limit' => 0,
                'message' => 'User not found'
            ];
        }

        // Get user's subscription
        $subscription = $user->subscription;

        // If no subscription, check if user is on trial or is admin
        if (!$subscription) {
            if ($user->onTrial() || $user->is_admin) {
                // Trial users get Basic Plan limits
                return $this->checkWithDefaults($app, $resource, $user);
            }

            return [
                'allowed' => false,
                'current' => 0,
                'limit' => 0,
                'message' => 'No active subscription. Please subscribe to continue.'
            ];
        }

        $plan = $subscription->plan;

        if (!$plan) {
            return [
                'allowed' => false,
                'current' => 0,
                'limit' => 0,
                'message' => 'Invalid subscription plan'
            ];
        }

        // Get limit from plan
        $limits = $plan->limits ?? [];
        $appLimits = $limits[$app] ?? [];
        $limit = $appLimits[$resource] ?? null;

        // If no limit defined, allow (unlimited)
        if ($limit === null || $limit === -1) {
            return [
                'allowed' => true,
                'current' => $this->getCurrentCount($app, $resource, $user->identifier),
                'limit' => -1,
                'message' => 'Unlimited'
            ];
        }

        // Get current count
        $current = $this->getCurrentCount($app, $resource, $user->identifier);

        $allowed = $current < $limit;

        return [
            'allowed' => $allowed,
            'current' => $current,
            'limit' => $limit,
            'message' => $allowed 
                ? "You can create " . ($limit - $current) . " more " . $resource
                : "You have reached your limit of {$limit} {$resource}. Please upgrade your plan."
        ];
    }

    /**
     * Get current count of resources for a user
     *
     * @param string $app App identifier
     * @param string $resource Resource type
     * @param string $userIdentifier User identifier
     * @return int
     */
    protected function getCurrentCount(string $app, string $resource, string $userIdentifier): int
    {
        try {
            // Map resource types to API endpoints
            $endpointMap = [
                'fnb' => [
                    'tables' => 'fnb-tables',
                    'reservations' => 'fnb-reservations',
                    'menu_items' => 'fnb-menu-items',
                    'online_stores' => 'fnb-online-stores',
                ],
                // Add more project types as needed
                // 'community' => [...],
                // 'logistics' => [...],
                // 'medical' => [...],
            ];

            $endpoint = $endpointMap[$app][$resource] ?? null;

            if (!$endpoint) {
                Log::warning("No endpoint mapping for {$app}.{$resource}");
                return 0;
            }

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/{$endpoint}?client_identifier={$userIdentifier}");

            if (!$response->successful()) {
                Log::error("Failed to get count for {$app}.{$resource}", [
                    'response' => $response->body()
                ]);
                return 0;
            }

            $data = $response->json();
            
            // Handle different response structures
            if (isset($data['data'])) {
                // Try with endpoint as-is (e.g., 'fnb-tables')
                // Then try with underscores (e.g., 'fnb_tables')
                // Then try with resource name
                $endpointWithUnderscore = str_replace('-', '_', $endpoint);
                
                $resourceData = $data['data'][$endpoint] 
                    ?? $data['data'][$endpointWithUnderscore] 
                    ?? $data['data'][$resource] 
                    ?? $data['data'];
                
                if (is_array($resourceData)) {
                    return count($resourceData);
                }
            } else if (is_array($data)) {
                // Some APIs return the array directly without wrapping in 'data'
                // This handles cases like reservations that return [item1, item2, ...]
                return count($data);
            }

            return 0;
        } catch (\Exception $e) {
            Log::error("Error getting current count for {$app}.{$resource}", [
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }

    /**
     * Check with default limits (for trial users)
     *
     * @param string $app
     * @param string $resource
     * @param User $user
     * @return array
     */
    protected function checkWithDefaults(string $app, string $resource, User $user): array
    {
        // Default limits for trial users (Basic Plan limits)
        $defaultLimits = [
            'fnb' => [
                'tables' => 10,
                'reservations' => 300,
                'menu_items' => 100,
                'online_stores' => 1,
            ],
        ];

        $limit = $defaultLimits[$app][$resource] ?? -1;
        $current = $this->getCurrentCount($app, $resource, $user->identifier);

        if ($limit === -1) {
            return [
                'allowed' => true,
                'current' => $current,
                'limit' => -1,
                'message' => 'Unlimited (Trial)'
            ];
        }

        $allowed = $current < $limit;

        return [
            'allowed' => $allowed,
            'current' => $current,
            'limit' => $limit,
            'message' => $allowed 
                ? "Trial: You can create " . ($limit - $current) . " more " . $resource
                : "Trial limit reached: {$limit} {$resource}. Subscribe to get more!"
        ];
    }

    /**
     * Get usage summary for an app
     *
     * @param string $app App identifier
     * @param string|null $userIdentifier User identifier
     * @return array
     */
    public function getUsageSummary(string $app, ?string $userIdentifier = null): array
    {
        $user = $userIdentifier ? User::where('identifier', $userIdentifier)->first() : auth()->user();

        if (!$user) {
            return [];
        }

        $subscription = $user->subscription;
        $plan = $subscription->plan ?? null;

        $limits = $plan->limits ?? [];
        $appLimits = $limits[$app] ?? [];

        $summary = [];

        foreach ($appLimits as $resource => $limit) {
            $current = $this->getCurrentCount($app, $resource, $user->identifier);
            
            $summary[$resource] = [
                'current' => $current,
                'limit' => $limit,
                'percentage' => $limit > 0 ? round(($current / $limit) * 100, 2) : 0,
                'remaining' => $limit > 0 ? max(0, $limit - $current) : -1,
                'unlimited' => $limit === -1,
            ];
        }

        return $summary;
    }
}

