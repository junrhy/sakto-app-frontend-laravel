<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Illuminate\Support\Facades\Log;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $selectedTeamMember = null;
        $user = null;
        
        try {
            // Get authenticated user with multiple fallback methods
            $user = $request->user();
            
            // If user is null, try alternative methods
            if (!$user) {
                $user = auth()->user();
            }
            
            // If still null, check if there's a user ID in session
            if (!$user && $request->session()->has('auth.user')) {
                $userId = $request->session()->get('auth.user');
                if ($userId) {
                    $user = \App\Models\User::find($userId);
                }
            }
            
            // Log authentication status for debugging
            if (config('app.debug')) {
                Log::info('Authentication check in HandleInertiaRequests', [
                    'user_authenticated' => !is_null($user),
                    'user_id' => $user?->id,
                    'user_email' => $user?->email,
                    'session_id' => $request->session()->getId(),
                    'request_url' => $request->url(),
                    'auth_check' => auth()->check(),
                    'auth_user' => auth()->user()?->id,
                    'session_has_user' => $request->session()->has('auth.user'),
                    'session_user_id' => $request->session()->get('auth.user'),
                    'request_user_method' => $request->user()?->id,
                    'auth_user_method' => auth()->user()?->id,
                ]);
            }
            
            if ($user) {
                // Load user with relationships (subscription already includes plan)
                $user->load(['subscription', 'project']);
                
                // Get selected team member from session
                if ($request->session()->has('selected_team_member_id')) {
                    $selectedTeamMember = $user->team_members_data->firstWhere('identifier', $request->session()->get('selected_team_member_id'));
                }
                
                // Log successful authentication for debugging (remove in production)
                if (config('app.debug')) {
                    Log::info('User authenticated in HandleInertiaRequests', [
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'has_subscription' => !is_null($user->subscription_data),
                        'has_project' => !is_null($user->project_data),
                        'team_members_count' => $user->team_members_data->count(),
                        'selected_team_member' => !is_null($selectedTeamMember),
                    ]);
                }
            } else {
                // Log when user is not authenticated
                if (config('app.debug')) {
                    Log::warning('User not authenticated in HandleInertiaRequests', [
                        'request_url' => $request->url(),
                        'session_id' => $request->session()->getId(),
                        'auth_check' => auth()->check(),
                        'session_has_user' => $request->session()->has('auth.user'),
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Log the error but don't break the application
            Log::error('Error loading user data in HandleInertiaRequests: ' . $e->getMessage(), [
                'user_id' => $user?->id,
                'request_url' => $request->url(),
            ]);
            
            // Reset variables to prevent errors
            $user = null;
            $selectedTeamMember = null;
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'contact_number' => $user->contact_number,
                    'email_verified_at' => $user->email_verified_at,
                    'is_admin' => $user->is_admin,
                    'identifier' => $user->identifier,
                    'project_identifier' => $user->project_identifier,
                    'app_currency' => $user->app_currency,
                    'theme' => $user->theme,
                    'theme_color' => $user->theme_color,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                    'subscription' => $user->subscription_data,
                ] : null,
                'project' => $user ? $user->project_data : null,
                // enabledModules is stored as JSON in DB but cast as array in Project model
                // We need to access it as array key, not object property
                'modules' => $user && $user->project_data && isset($user->project_data['enabledModules']) 
                    ? (is_array($user->project_data['enabledModules']) 
                        ? $user->project_data['enabledModules'] 
                        : [])
                    : [],
                'teamMembers' => $user ? $user->team_members_data : [],
                'selectedTeamMember' => $selectedTeamMember,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'app' => [
                'name' => config('app.name'),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('flash.message'),
                'type' => fn () => $request->session()->get('flash.type'),
            ],
        ];
    }
}
