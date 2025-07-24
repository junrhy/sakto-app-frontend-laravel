<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use App\Models\Project;

class UserAdminController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query();
        
        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        // Filter by admin status
        if ($request->has('admin_filter') && $request->admin_filter !== 'all') {
            $isAdmin = $request->admin_filter === 'admin';
            $query->where('is_admin', $isAdmin);
        }

        // Filter by project
        if ($request->has('project_filter') && $request->project_filter !== 'all') {
            $query->where('project_identifier', $request->project_filter);
        }
        
        $users = $query->orderBy('created_at', 'desc')
                      ->paginate(10)
                      ->withQueryString();

        // Fetch credit balances for each user
        $apiUrl = config('api.url');
        $apiToken = config('api.token');
        
        $users->getCollection()->transform(function ($user) use ($apiUrl, $apiToken) {
            $credits = 0;
            $pendingCredits = 0;
            
            try {
                $response = \Illuminate\Support\Facades\Http::withToken($apiToken)
                    ->get("{$apiUrl}/credits/{$user->identifier}/balance");
                
                if ($response->successful()) {
                    $data = $response->json();
                    $credits = $data['available_credit'] ?? 0;
                    $pendingCredits = $data['pending_credit'] ?? 0;
                }
            } catch (\Exception $e) {
                // Log error but continue with default values
                \Log::error("Failed to fetch credits for user {$user->identifier}: " . $e->getMessage());
            }
            
            $user->credits = $credits;
            $user->pending_credits = $pendingCredits;
            
            return $user;
        });

        $projects = Project::select('id', 'name', 'identifier')->get();
        
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search ?? '',
                'admin_filter' => $request->admin_filter ?? 'all',
                'project_filter' => $request->project_filter ?? 'all',
            ],
            'projects' => $projects,
        ]);
    }
    
    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        $projects = Project::select('id', 'name', 'identifier')->get();
        
        return Inertia::render('Admin/Users/Create', [
            'projects' => $projects,
        ]);
    }
    
    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'contact_number' => 'nullable|string|max:20',
            'is_admin' => 'boolean',
            'project_identifier' => 'required|string|max:255',
        ]);
        
        $validated['password'] = Hash::make($validated['password']);
        
        User::create($validated);
        
        return redirect()->route('admin.users.index')
                         ->with('success', 'User created successfully.');
    }
    
    /**
     * Show the form for editing the specified user.
     */
    public function edit($id)
    {
        $user = User::findOrFail($id);
        $projects = Project::select('id', 'name', 'identifier')->get();
        
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'projects' => $projects,
        ]);
    }
    
    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'contact_number' => 'nullable|string|max:20',
            'is_admin' => 'boolean',
            'project_identifier' => 'required|string|max:255',
        ]);
        
        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }
        
        $user->update($validated);
        
        return redirect()->route('admin.users.index')
                         ->with('success', 'User updated successfully.');
    }
    
    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting yourself
        if (auth()->id() === $user->id) {
            return redirect()->route('admin.users.index')
                             ->with('error', 'You cannot delete your own account.');
        }
        
        $user->delete();
        
        return redirect()->route('admin.users.index')
                         ->with('success', 'User deleted successfully.');
    }
    
    /**
     * Toggle admin status for a user.
     */
    public function toggleAdminStatus($id)
    {
        $user = User::findOrFail($id);
        $user->is_admin = !$user->is_admin;
        $user->save();

        return redirect()->back()->with('success', 'Admin status updated successfully.');
    }

    /**
     * Resend email verification for a user.
     */
    public function resendVerification($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->hasVerifiedEmail()) {
            return redirect()->back()->with('error', 'User email is already verified.');
        }

        $user->sendEmailVerificationNotification();

        return redirect()->back()->with('success', 'Verification email has been resent.');
    }
} 