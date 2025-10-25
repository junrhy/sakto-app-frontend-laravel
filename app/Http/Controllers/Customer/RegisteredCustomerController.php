<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserAddress;
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

class RegisteredCustomerController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the customer registration view.
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
        
        return Inertia::render('Customer/Auth/Register', [
            'projects' => $projects,
            'projectParam' => $projectParam,
            'projectExists' => $projectExists
        ]);
    }

    /**
     * Handle an incoming customer registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Check if registration is enabled
        $registrationEnabled = Setting::get('registration_enabled', 'true') === 'true';
        
        if (!$registrationEnabled) {
            abort(403, 'Customer registration is currently disabled.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone_number' => [
                'required',
                'string',
                'max:20',
                'regex:/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/'
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'project_identifier' => 'required|string|exists:projects,identifier',
            // Address fields
            'street' => 'required|string|max:255',
            'unit_number' => 'nullable|string|max:50',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
        ], [
            'phone_number.regex' => 'The phone number format is invalid. Please use a valid format (e.g., +1 (555) 123-4567).'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'project_identifier' => $request->project_identifier,
            'user_type' => 'customer',
        ]);

        // Create primary address for the customer
        UserAddress::create([
            'user_id' => $user->id,
            'address_type' => 'home',
            'street' => $request->street,
            'unit_number' => $request->unit_number,
            'city' => $request->city,
            'state' => $request->state,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
            'phone' => $request->phone_number,
            'is_primary' => true,
        ]);

        event(new Registered($user));

        // Create a default dashboard for the customer
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

        return redirect(route('customer.verification.notice', absolute: false));
    }
}

