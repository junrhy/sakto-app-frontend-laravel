<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\TeamMember;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\RedirectResponse;

class TeamMemberSelectionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply this middleware to authenticated users
        if (!Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        // Check if user has team members
        $teamMembers = TeamMember::where('user_identifier', $user->identifier)
            ->where('project_identifier', $user->project_identifier)
            ->where('is_active', true)
            ->get();

        // If no team members, proceed normally
        if ($teamMembers->isEmpty()) {
            return $next($request);
        }

        // Check if a team member is already selected in session
        $selectedTeamMemberId = $request->session()->get('selected_team_member_id');
        
        // If team member is already selected, proceed
        if ($selectedTeamMemberId) {
            $selectedTeamMember = $teamMembers->firstWhere('identifier', $selectedTeamMemberId);
            if ($selectedTeamMember) {
                return $next($request);
            }
        }

        // Exclude certain routes from team member selection
        $excludedRoutes = [
            'team-member.select',
            'team-member.authenticate',
            'logout',
            'admin.*',
        ];

        foreach ($excludedRoutes as $route) {
            if ($request->routeIs($route)) {
                return $next($request);
            }
        }

        // If this is an API request, return a JSON response
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Team member selection required',
                'redirect' => route('team-member.select')
            ], 403);
        }

        // Redirect to team member selection page
        return Inertia::render('Auth/TeamMemberSelection', [
            'teamMembers' => $teamMembers->map(function ($member) {
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
            }),
        ])->toResponse($request);
    }
} 