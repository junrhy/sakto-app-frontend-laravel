<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequiresPremiumAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Allow access if user is not authenticated (will be handled by auth middleware)
        if (!$user) {
            return $next($request);
        }
        
        // Allow access for admin users
        if ($user->isAdmin()) {
            return $next($request);
        }
        
        // Check if user has access (active subscription OR active trial)
        if (!$user->hasAccess()) {
            // Log the access attempt for monitoring
            \Log::warning('Premium access denied', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'route' => $request->path(),
                'has_trial' => $user->trial_started_at !== null,
                'trial_expired' => $user->trialExpired(),
                'has_subscription' => $user->hasActiveSubscription(),
            ]);
            
            // Handle JSON requests (API calls)
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Premium access required. Please subscribe or start a trial to access this feature.',
                    'trial_expired' => $user->trialExpired(),
                    'has_trial' => $user->hasHadTrial(),
                    'redirect_url' => route('subscriptions.index'),
                ], 403);
            }
            
            // Handle web requests
            $message = 'You need an active subscription or trial to access this feature.';
            
            if ($user->trialExpired()) {
                $message = 'Your free trial has expired. Please subscribe to continue accessing premium features.';
            } elseif (!$user->hasHadTrial()) {
                $message = 'This is a premium feature. Start your 14-day free trial or subscribe to get access.';
            }
            
            return redirect()->route('subscriptions.index')
                ->with('error', $message);
        }
        
        return $next($request);
    }
}
