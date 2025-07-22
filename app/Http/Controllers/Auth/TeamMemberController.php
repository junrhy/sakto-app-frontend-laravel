<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TeamMemberController extends Controller
{
    /**
     * Show the team member selection page.
     */
    public function showSelection(): Response
    {
        $user = Auth::user();
        
        $teamMembers = TeamMember::where('user_identifier', $user->identifier)
            ->where('project_identifier', $user->project_identifier)
            ->where('is_active', true)
            ->get();

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
        ]);
    }

    /**
     * Show the team member authentication page.
     */
    public function showAuthentication(Request $request): Response
    {
        $request->validate([
            'team_member_id' => 'required|string|exists:team_members,identifier',
        ]);

        $teamMember = TeamMember::where('identifier', $request->team_member_id)
            ->where('user_identifier', Auth::user()->identifier)
            ->where('project_identifier', Auth::user()->project_identifier)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('Auth/TeamMemberAuthentication', [
            'teamMember' => [
                'identifier' => $teamMember->identifier,
                'first_name' => $teamMember->first_name,
                'last_name' => $teamMember->last_name,
                'full_name' => $teamMember->full_name,
                'email' => $teamMember->email,
                'profile_picture' => $teamMember->profile_picture,
            ],
        ]);
    }

    /**
     * Authenticate the team member with password.
     */
    public function authenticate(Request $request)
    {
        $request->validate([
            'team_member_id' => 'required|string|exists:team_members,identifier',
            'password' => 'required|string',
        ]);

        $teamMember = TeamMember::where('identifier', $request->team_member_id)
            ->where('user_identifier', Auth::user()->identifier)
            ->where('project_identifier', Auth::user()->project_identifier)
            ->where('is_active', true)
            ->firstOrFail();

        // Verify password
        if (!Hash::check($request->password, $teamMember->password)) {
            throw ValidationException::withMessages([
                'password' => 'The provided password is incorrect.',
            ]);
        }

        // Store selected team member in session
        $request->session()->put('selected_team_member_id', $teamMember->identifier);
        
        // Update last login timestamp
        $teamMember->updateLastLogin();

        // Redirect to intended page or dashboard
        return redirect()->intended(route('home', absolute: false));
    }

    /**
     * Switch to a different team member.
     */
    public function switch(Request $request)
    {
        $request->validate([
            'team_member_id' => 'required|string|exists:team_members,identifier',
        ]);

        $teamMember = TeamMember::where('identifier', $request->team_member_id)
            ->where('user_identifier', Auth::user()->identifier)
            ->where('project_identifier', Auth::user()->project_identifier)
            ->where('is_active', true)
            ->firstOrFail();

        // Store selected team member in session
        $request->session()->put('selected_team_member_id', $teamMember->identifier);

        return redirect()->back()->with('success', 'Switched to ' . $teamMember->full_name);
    }

    /**
     * Clear the selected team member from session.
     */
    public function clear(Request $request)
    {
        $request->session()->forget('selected_team_member_id');
        
        return redirect()->route('team-member.select');
    }
} 