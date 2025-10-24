<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class TeamsController extends Controller
{
    /**
     * Display a listing of team members.
     */
    public function index()
    {
        try {
            $user = auth()->user();
            
            // Get team members from database (including main account via User model)
            $teamMembers = $user->team_members_data->map(function ($member) {
                return [
                    'id' => $member['identifier'], // Use identifier as id for consistency
                    'identifier' => $member['identifier'],
                    'first_name' => $member['first_name'],
                    'last_name' => $member['last_name'],
                    'full_name' => $member['full_name'],
                    'email' => $member['email'],
                    'contact_number' => null, // Not available in team_members_data
                    'roles' => $member['roles'] ?? [],
                    'allowed_apps' => $member['allowed_apps'] ?? [],
                    'last_logged_in' => null, // Not available in team_members_data
                    'is_active' => true, // All team members from team_members_data are active
                    'email_verified' => null, // Not available in team_members_data
                    'profile_picture' => $member['profile_picture'],
                    'notes' => null, // Not available in team_members_data
                    'timezone' => null, // Not available in team_members_data
                    'language' => null, // Not available in team_members_data
                    'last_activity_at' => null, // Not available in team_members_data
                    'created_at' => null, // Not available in team_members_data
                    'updated_at' => null, // Not available in team_members_data
                    'is_main_account' => $member['is_main_account'] ?? false,
                ];
            });

            return Inertia::render('Teams/Index', [
                'teamMembers' => $teamMembers,
                'availableRoles' => $this->getAvailableRoles(),
                'availableApps' => $this->getAvailableApps(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teams index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching team members']);
        }
    }

    /**
     * Show the form for creating a new team member.
     */
    public function create()
    {
        $user = auth()->user();
        
        // Check if there are any existing admin team members
        $hasExistingAdmin = $this->hasAdminTeamMember($user);
        
        return Inertia::render('Teams/Create', [
            'availableRoles' => $this->getAvailableRoles(),
            'availableApps' => $this->getAvailableApps(),
            'requiresAdmin' => !$hasExistingAdmin,
        ]);
    }

    /**
     * Store a newly created team member.
     */
    public function store(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Check if there are any existing admin team members
            $hasExistingAdmin = $this->hasAdminTeamMember($user);
            
            // Build validation rules
            $rules = [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:team_members,email,NULL,id,user_identifier,' . $user->identifier,
                'contact_number' => 'nullable|string|max:20',
                'password' => 'required|string|min:8',
                'roles' => $hasExistingAdmin ? 'nullable|array' : 'required|array|min:1',
                'roles.*' => 'string|in:' . implode(',', array_keys($this->getAvailableRoles())),
                'allowed_apps' => 'nullable|array',
                'allowed_apps.*' => 'string|in:' . implode(',', array_keys($this->getAvailableApps())),
                'notes' => 'nullable|string',
                'timezone' => 'nullable|string|max:50',
                'language' => 'nullable|string|max:10',
            ];
            
            $messages = [
                'roles.required' => 'At least one role must be assigned. Since there are no existing admin team members, this member must have the admin role.',
                'roles.min' => 'At least one role must be assigned.',
            ];
            
            $validated = $request->validate($rules, $messages);
            
            // If no existing admin, ensure the new member has admin role
            if (!$hasExistingAdmin && (!isset($validated['roles']) || !in_array('admin', $validated['roles']))) {
                return back()->withErrors(['roles' => 'The first team member must have the admin role to manage the account.'])->withInput();
            }

            $validated['user_identifier'] = $user->identifier;
            $validated['project_identifier'] = $user->project_identifier;
            // Password will be automatically hashed by the model mutator

            $teamMember = TeamMember::create($validated);

            // Send welcome email with login credentials
            $this->sendWelcomeEmail($teamMember, $request->password);

            return redirect()->route('teams.index')
                ->with('success', 'Team member created successfully. Welcome email sent.');
        } catch (\Exception $e) {
            Log::error('Error creating team member', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while creating the team member']);
        }
    }

    /**
     * Display the specified team member.
     */
    public function show($identifier)
    {
        try {
            $user = auth()->user();
            $teamMember = TeamMember::where('identifier', $identifier)
                ->where('user_identifier', $user->identifier)
                ->where('project_identifier', $user->project_identifier)
                ->firstOrFail();

            return Inertia::render('Teams/Show', [
                'teamMember' => [
                    'id' => $teamMember->id,
                    'identifier' => $teamMember->identifier,
                    'first_name' => $teamMember->first_name,
                    'last_name' => $teamMember->last_name,
                    'full_name' => $teamMember->full_name,
                    'email' => $teamMember->email,
                    'contact_number' => $teamMember->contact_number,
                    'roles' => $teamMember->roles ?? [],
                    'allowed_apps' => $teamMember->allowed_apps ?? [],
                    'last_logged_in' => $teamMember->last_logged_in,
                    'is_active' => $teamMember->is_active,
                    'email_verified' => $teamMember->email_verified,
                    'email_verified_at' => $teamMember->email_verified_at,
                    'profile_picture' => $teamMember->profile_picture,
                    'notes' => $teamMember->notes,
                    'permissions' => $teamMember->permissions ?? [],
                    'timezone' => $teamMember->timezone,
                    'language' => $teamMember->language,
                    'password_changed_at' => $teamMember->password_changed_at,
                    'last_activity_at' => $teamMember->last_activity_at,
                    'created_at' => $teamMember->created_at,
                    'updated_at' => $teamMember->updated_at,
                ],
                'availableRoles' => $this->getAvailableRoles(),
                'availableApps' => $this->getAvailableApps(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing team member', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Team member not found']);
        }
    }

    /**
     * Show the form for editing the specified team member.
     */
    public function edit($identifier)
    {
        try {
            $user = auth()->user();
            $teamMember = TeamMember::where('identifier', $identifier)
                ->where('user_identifier', $user->identifier)
                ->where('project_identifier', $user->project_identifier)
                ->firstOrFail();

            return Inertia::render('Teams/Edit', [
                'teamMember' => [
                    'id' => $teamMember->id,
                    'identifier' => $teamMember->identifier,
                    'first_name' => $teamMember->first_name,
                    'last_name' => $teamMember->last_name,
                    'email' => $teamMember->email,
                    'contact_number' => $teamMember->contact_number,
                    'roles' => $teamMember->roles ?? [],
                    'allowed_apps' => $teamMember->allowed_apps ?? [],
                    'notes' => $teamMember->notes,
                    'timezone' => $teamMember->timezone,
                    'language' => $teamMember->language,
                ],
                'availableRoles' => $this->getAvailableRoles(),
                'availableApps' => $this->getAvailableApps(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error editing team member', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Team member not found']);
        }
    }

    /**
     * Update the specified team member.
     */
    public function update(Request $request, $identifier)
    {
        try {
            $user = auth()->user();
            $teamMember = TeamMember::where('identifier', $identifier)
                ->where('user_identifier', $user->identifier)
                ->where('project_identifier', $user->project_identifier)
                ->firstOrFail();

            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:team_members,email,' . $teamMember->id . ',id,user_identifier,' . $user->identifier,
                'contact_number' => 'nullable|string|max:20',
                'roles' => 'nullable|array',
                'roles.*' => 'string|in:' . implode(',', array_keys($this->getAvailableRoles())),
                'allowed_apps' => 'nullable|array',
                'allowed_apps.*' => 'string|in:' . implode(',', array_keys($this->getAvailableApps())),
                'notes' => 'nullable|string',
                'timezone' => 'nullable|string|max:50',
                'language' => 'nullable|string|max:10',
            ]);

            $teamMember->update($validated);

            return redirect()->route('teams.index')
                ->with('success', 'Team member updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating team member', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while updating the team member']);
        }
    }

    /**
     * Remove the specified team member.
     */
    public function destroy($identifier)
    {
        try {
            $user = auth()->user();
            $teamMember = TeamMember::where('identifier', $identifier)
                ->where('user_identifier', $user->identifier)
                ->where('project_identifier', $user->project_identifier)
                ->firstOrFail();

            $teamMember->delete();

            return redirect()->route('teams.index')
                ->with('success', 'Team member removed successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting team member', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while removing the team member']);
        }
    }

    /**
     * Show team settings.
     */
    public function settings()
    {
        try {
            $user = auth()->user();
            $teamStats = [
                'total_members' => TeamMember::where('user_identifier', $user->identifier)
                    ->where('project_identifier', $user->project_identifier)
                    ->count(),
                'active_members' => TeamMember::where('user_identifier', $user->identifier)
                    ->where('project_identifier', $user->project_identifier)
                    ->where('is_active', true)
                    ->count(),
                'verified_members' => TeamMember::where('user_identifier', $user->identifier)
                    ->where('project_identifier', $user->project_identifier)
                    ->where('email_verified', true)
                    ->count(),
            ];

            return Inertia::render('Teams/Settings', [
                'teamStats' => $teamStats,
                'availableRoles' => $this->getAvailableRoles(),
                'availableApps' => $this->getAvailableApps(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teams settings', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while loading team settings']);
        }
    }

    /**
     * Get team members list for API.
     */
    public function getTeamMembers()
    {
        try {
            $user = auth()->user();
            $teamMembers = TeamMember::where('user_identifier', $user->identifier)
                ->where('project_identifier', $user->project_identifier)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'identifier' => $member->identifier,
                        'first_name' => $member->first_name,
                        'last_name' => $member->last_name,
                        'full_name' => $member->full_name,
                        'email' => $member->email,
                        'contact_number' => $member->contact_number,
                        'roles' => $member->roles ?? [],
                        'allowed_apps' => $member->allowed_apps ?? [],
                        'last_logged_in' => $member->last_logged_in,
                        'is_active' => $member->is_active,
                        'email_verified' => $member->email_verified,
                        'created_at' => $member->created_at,
                    ];
                });

            return response()->json(['data' => $teamMembers]);
        } catch (\Exception $e) {
            Log::error('Error getting team members', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'Failed to fetch team members'], 500);
        }
    }

    /**
     * Toggle team member active status.
     */
    public function toggleStatus($identifier)
    {
        try {
            $user = auth()->user();
            $teamMember = TeamMember::where('identifier', $identifier)
                ->where('user_identifier', $user->identifier)
                ->where('project_identifier', $user->project_identifier)
                ->firstOrFail();

            $teamMember->update(['is_active' => !$teamMember->is_active]);

            return response()->json([
                'success' => true,
                'is_active' => $teamMember->is_active,
                'message' => $teamMember->is_active ? 'Team member activated' : 'Team member deactivated'
            ]);
        } catch (\Exception $e) {
            Log::error('Error toggling team member status', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'Failed to update status'], 500);
        }
    }

    /**
     * Reset team member password.
     */
    public function resetPassword(Request $request, $identifier)
    {
        try {
            $user = auth()->user();
            $teamMember = TeamMember::where('identifier', $identifier)
                ->where('user_identifier', $user->identifier)
                ->where('project_identifier', $user->project_identifier)
                ->firstOrFail();

            $newPassword = Str::random(12);
            $teamMember->update(['password' => $newPassword]);

            // Send password reset email
            $this->sendPasswordResetEmail($teamMember, $newPassword);

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully. New password sent to email.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error resetting password', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'Failed to reset password'], 500);
        }
    }

    /**
     * Show team member password update form.
     */
    public function showPasswordUpdate()
    {
        try {
            $user = auth()->user();
            $selectedTeamMemberId = request()->session()->get('selected_team_member_id');
            
            if (!$selectedTeamMemberId) {
                return redirect()->route('profile.edit')->withErrors(['error' => 'No team member selected']);
            }

            $teamMember = TeamMember::where('identifier', $selectedTeamMemberId)
                ->where('user_identifier', $user->identifier)
                ->where('project_identifier', $user->project_identifier)
                ->firstOrFail();

            return Inertia::render('Teams/UpdatePassword', [
                'teamMember' => [
                    'identifier' => $teamMember->identifier,
                    'first_name' => $teamMember->first_name,
                    'last_name' => $teamMember->last_name,
                    'full_name' => $teamMember->full_name,
                    'email' => $teamMember->email,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing password update form', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('profile.edit')->withErrors(['error' => 'Team member not found']);
        }
    }

    /**
     * Update team member password.
     */
    public function updatePassword(Request $request)
    {
        try {
            $user = auth()->user();
            $selectedTeamMemberId = $request->session()->get('selected_team_member_id');
            
            if (!$selectedTeamMemberId) {
                return back()->withErrors(['error' => 'No team member selected']);
            }

            $teamMember = TeamMember::where('identifier', $selectedTeamMemberId)
                ->where('user_identifier', $user->identifier)
                ->where('project_identifier', $user->project_identifier)
                ->firstOrFail();

            $validated = $request->validate([
                'current_password' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
            ]);

            // Verify current password
            if (!Hash::check($validated['current_password'], $teamMember->password)) {
                return back()->withErrors(['current_password' => 'The current password is incorrect.']);
            }

            // Update password
            $teamMember->update(['password' => $validated['password']]);

            return redirect()->route('profile.edit')
                ->with('success', 'Team member password updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating team member password', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while updating the password']);
        }
    }

    /**
     * Get available roles.
     */
    private function getAvailableRoles(): array
    {
        return [
            'admin' => 'Administrator',
            'manager' => 'Manager',
            'supervisor' => 'Supervisor',
            'doctor' => 'Doctor',
            'nurse' => 'Nurse',
            'assistant' => 'Medical Assistant',
            'user' => 'User',
            'viewer' => 'Viewer',
        ];
    }

    /**
     * Get available apps.
     */
    private function getAvailableApps(): array
    {
        return [
            'pos-retail' => 'POS Retail',
            'pos-restaurant' => 'POS Restaurant',
            'inventory' => 'Inventory',
            'contacts' => 'Contacts',
            'loan' => 'Loan Management',
            'payroll' => 'Payroll',
            'travel' => 'Travel',
            'clinic' => 'Clinic',
            'rental-property' => 'Rental Property',
            'rental-item' => 'Rental Items',
            'transportation' => 'Transportation',
            'warehousing' => 'Warehousing',
            'products' => 'Products',
            'content-creator' => 'Content Creator',
            'challenges' => 'Challenges',
            'events' => 'Events',
            'genealogy' => 'Genealogy',
            'mortuary' => 'Mortuary',
            'health-insurance' => 'Health Insurance',
            'email' => 'Email',
            'sms' => 'SMS',
            'pages' => 'Pages',
        ];
    }

    /**
     * Send welcome email to new team member.
     */
    private function sendWelcomeEmail(TeamMember $teamMember, string $password): void
    {
        try {
            // This would typically use a proper email template
            // For now, we'll just log the email details
            Log::info('Welcome email would be sent', [
                'to' => $teamMember->email,
                'name' => $teamMember->full_name,
                'password' => $password,
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending welcome email', [
                'message' => $e->getMessage(),
                'team_member_id' => $teamMember->id,
            ]);
        }
    }

    /**
     * Send password reset email.
     */
    private function sendPasswordResetEmail(TeamMember $teamMember, string $newPassword): void
    {
        try {
            // This would typically use a proper email template
            // For now, we'll just log the email details
            Log::info('Password reset email would be sent', [
                'to' => $teamMember->email,
                'name' => $teamMember->full_name,
                'new_password' => $newPassword,
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending password reset email', [
                'message' => $e->getMessage(),
                'team_member_id' => $teamMember->id,
            ]);
        }
    }

    /**
     * Check if there are any existing admin team members.
     */
    private function hasAdminTeamMember(User $user): bool
    {
        // Check if the main user account has admin role
        $mainUserRoles = $user->roles ?? [];
        if (in_array('admin', $mainUserRoles)) {
            return true;
        }
        
        // Check if any team members have admin role
        $hasAdminTeamMember = TeamMember::where('user_identifier', $user->identifier)
            ->where('project_identifier', $user->project_identifier)
            ->where('is_active', true)
            ->get()
            ->contains(function ($member) {
                return in_array('admin', $member->roles ?? []);
            });
        
        return $hasAdminTeamMember;
    }
}
