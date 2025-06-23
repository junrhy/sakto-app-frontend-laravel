<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\SubscriptionController;

class CheckSubscriptionAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        // Get the current route name
        $routeName = $request->route()->getName();

        // Get the app name from the route or request
        $appName = $this->getAppNameFromRoute($routeName, $request);
        
        if (!$appName) {
            return $next($request);
        }

        // Get user's active subscription
        $subscriptionController = app()->make(SubscriptionController::class);
        $activeSubscription = $subscriptionController->getActiveSubscription($user->identifier)->getData();

        if (!$activeSubscription->active) {
            return redirect()->route('subscriptions.index')
                ->with('error', 'You need an active subscription to access this feature.');
        }

        $planSlug = $activeSubscription->subscription->plan->slug ?? null;

        // Check if the app is included in the user's subscription plan
        if (!$this->isAppIncludedInPlan($appName, $planSlug)) {
            return redirect()->route('apps')
                ->with('flash.message', 'Your current subscription plan does not include access to this feature. Please upgrade your plan to access this feature.')
                ->with('flash.type', 'error');
        }

        return $next($request);
    }

    /**
     * Get the app name from the route or request
     */
    private function getAppNameFromRoute(string $routeName, Request $request): ?string
    {
        // Map route prefixes to app names as defined in apps.tsx
        $routeToAppMap = [
            'clinic' => 'Clinic',
            'pos-retail' => 'Retail',
            'pos-restaurant' => 'F&B',
            'warehousing' => 'Warehousing',
            'transportation' => 'Transportation',
            'rental-item' => 'Rental',
            'rental-property' => 'Real Estate',
            'loan' => 'Lending',
            'payroll' => 'Payroll',
            'travel' => 'Travel',
            'sms' => 'SMS',
            'email' => 'Email',
            'contacts' => 'Contacts',
            'family-tree' => 'Family Tree',
            'events' => 'Events',
            'challenges' => 'Challenges',
            'content-creator' => 'Content Creator',
            'products' => 'Products',
            'pages' => 'Pages',
            'healthcare' => 'Healthcare',
            'mortuary' => 'Mortuary'
        ];

        // Check route prefix
        foreach ($routeToAppMap as $prefix => $appName) {
            if (strpos($routeName, $prefix) === 0) {
                return $appName;
            }
        }

        // Check query parameter for dashboard routes
        if ($routeName === 'dashboard' && $request->has('app')) {
            $appParam = $request->query('app');
            $appParamToNameMap = [
                'retail' => 'Retail',
                'fnb' => 'F&B',
                'clinic' => 'Clinic',
                'lending' => 'Lending',
                'rental-item' => 'Rental',
                'real-estate' => 'Real Estate',
                'transportation' => 'Transportation',
                'warehousing' => 'Warehousing',
                'payroll' => 'Payroll',
                'travel' => 'Travel',
                'sms' => 'SMS',
                'email' => 'Email',
                'contacts' => 'Contacts',
                'family-tree' => 'Family Tree',
                'events' => 'Events',
                'challenges' => 'Challenges',
                'content-creator' => 'Content Creator',
                'products' => 'Products',
                'pages' => 'Pages',
                'healthcare' => 'Healthcare',
                'mortuary' => 'Mortuary'
            ];

            return $appParamToNameMap[$appParam] ?? null;
        }

        return null;
    }

    /**
     * Check if the app is included in the subscription plan
     */
    private function isAppIncludedInPlan(string $appName, ?string $planSlug): bool
    {
        if (!$planSlug) {
            return false;
        }

        // Get apps configuration
        $appsConfig = config('apps');
        
        // Find the app in the configuration
        foreach ($appsConfig as $app) {
            if ($app['title'] === $appName) {
                return in_array($planSlug, $app['includedInPlans'] ?? []);
            }
        }

        return false;
    }
} 