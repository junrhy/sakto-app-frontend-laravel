<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Models\Dashboard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Auth\Events\Registered;  
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class GoogleController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                Auth::login($user);
                return redirect()->intended(route('home', absolute: false));
            }

            $projects = Project::select('identifier', 'name')->get();
            
            return Inertia::render('Auth/SelectProject', [
                'projects' => $projects,
                'googleUser' => [
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                ]
            ]);

        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Google authentication failed');
        }
    }

    public function register()
    {
        request()->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'google_id' => 'required|string',
            'project_identifier' => 'required|string|exists:projects,identifier',
        ]);

        $user = User::create([
            'name' => request('name'),
            'email' => request('email'),
            'google_id' => request('google_id'),
            'project_identifier' => request('project_identifier'),
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        event(new Registered($user));

        // Create a default dashboard for the user
        $dashboards = [
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'retail'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'fnb'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'lending'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'warehousing'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'transportation'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'rental-item'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'real-estate'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'clinic'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'loan'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'payroll'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'travel'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'sms'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'email'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'contacts'],
            ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'genealogy'],
        ];

        foreach ($dashboards as $dashboard) {
            if (!Dashboard::where('user_id', $user->id)
                ->where('app', $dashboard['app'])
                ->exists()) {
                Dashboard::create($dashboard);
            }
        }

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/clients", [
                'name' => request('name'),
                'email' => request('email'),
                'client_identifier' => $user->identifier,
                'referrer' => 'https://sakto.app',
            ]);

        if (!$response->successful()) {
            // Log the error or handle it appropriately
            \Log::error('Failed to create client in API', [
                'response' => $response->json(),
                'user' => $user->toArray()
            ]);
        }

        Auth::login($user);

        return redirect()->intended(route('home', absolute: false));
    }
} 