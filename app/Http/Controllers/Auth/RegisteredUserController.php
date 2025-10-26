<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Dashboard;
use App\Models\Project;
use App\Models\Setting;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        // Check if registration is enabled
        $registrationEnabled = Setting::get('registration_enabled', 'true') === 'true';
        
        if (!$registrationEnabled) {
            return Inertia::render('Auth/RegistrationDisabled');
        }
        
        // Get project parameter from URL
        $projectParam = $request->query('project');
        $projectExists = false;
        
        // Check if project exists in database
        if ($projectParam) {
            $projectExists = Project::where('identifier', $projectParam)->exists();
        }
        
        $projects = Project::select('identifier', 'name')->get();
        
        return Inertia::render('Auth/Register', [
            'projects' => $projects,
            'projectParam' => $projectParam,
            'projectExists' => $projectExists
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Check if registration is enabled
        $registrationEnabled = Setting::get('registration_enabled', 'true') === 'true';
        
        if (!$registrationEnabled) {
            abort(403, 'User registration is currently disabled.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'project_identifier' => 'required|string|exists:projects,identifier',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'project_identifier' => $request->project_identifier,
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
                'name' => $request->name,
                'email' => $request->email,
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

        return redirect(route('verification.notice'));
    }
}
