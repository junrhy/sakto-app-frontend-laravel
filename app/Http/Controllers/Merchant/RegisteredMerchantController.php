<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\MerchantProfile;
use App\Models\Project;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredMerchantController extends Controller
{
    protected string $apiUrl;
    protected string $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the merchant registration view.
     */
    public function create(Request $request): Response
    {
        $registrationEnabled = Setting::get('merchant_registration_enabled', 'true') === 'true';

        if (!$registrationEnabled) {
            return Inertia::render('Auth/RegistrationDisabled');
        }

        $projectParam = $request->query('project');
        $projectExists = false;

        if ($projectParam) {
            $projectExists = Project::where('identifier', $projectParam)->exists();
        }

        $projects = Project::select('identifier', 'name')->orderBy('name')->get();

        $businessTypes = [
            'retail',
            'restaurant',
            'service',
            'logistics',
            'healthcare',
            'technology',
            'education',
            'finance',
            'manufacturing',
            'hospitality',
        ];

        return Inertia::render('Merchant/Auth/Register', [
            'projects' => $projects,
            'projectParam' => $projectParam,
            'projectExists' => $projectExists,
            'businessTypes' => $businessTypes,
        ]);
    }

    /**
     * Handle an incoming merchant registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $registrationEnabled = Setting::get('merchant_registration_enabled', 'true') === 'true';

        if (!$registrationEnabled) {
            abort(403, 'Merchant registration is currently disabled.');
        }

        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'business_type' => 'nullable|string|max:150',
            'industry' => 'nullable|string|max:150',
            'website' => 'nullable|url|max:255',
            'contact_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone_number' => [
                'required',
                'string',
                'max:20',
                'regex:/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/',
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'project_identifier' => 'nullable|string|exists:projects,identifier',
            'street' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:120',
            'state' => 'nullable|string|max:120',
            'country' => 'nullable|string|max:120',
            'postal_code' => 'nullable|string|max:20',
        ], [
            'phone_number.regex' => 'The phone number format is invalid. Please use a valid format (e.g., +1 (555) 123-4567).',
        ]);

        $user = User::create([
            'name' => $validated['contact_name'],
            'email' => $validated['email'],
            'contact_number' => $validated['phone_number'],
            'password' => Hash::make($validated['password']),
            'project_identifier' => $validated['project_identifier'] ?? 'merchant',
            'user_type' => 'merchant',
        ]);

        MerchantProfile::create([
            'user_id' => $user->id,
            'business_name' => $validated['business_name'],
            'business_type' => $validated['business_type'] ?? null,
            'industry' => $validated['industry'] ?? null,
            'website' => $validated['website'] ?? null,
            'phone' => $validated['phone_number'],
            'street' => $validated['street'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'country' => $validated['country'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
        ]);

        if ($validated['street'] ?? false) {
            UserAddress::create([
                'user_id' => $user->id,
                'address_type' => 'business',
                'street' => $validated['street'],
                'unit_number' => null,
                'city' => $validated['city'] ?? '',
                'state' => $validated['state'] ?? '',
                'postal_code' => $validated['postal_code'] ?? '',
                'country' => $validated['country'] ?? '',
                'phone' => $validated['phone_number'],
                'is_primary' => true,
            ]);
        }

        event(new Registered($user));

        if ($this->apiUrl && $this->apiToken) {
            try {
                Http::withToken($this->apiToken)->post("{$this->apiUrl}/clients", [
                    'name' => $validated['business_name'],
                    'email' => $validated['email'],
                    'client_identifier' => $user->identifier,
                    'referrer' => 'merchant-portal',
                ]);
            } catch (\Throwable $e) {
                \Log::warning('Failed to register merchant with external API', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Auth::login($user);

        return redirect()->route('merchant.dashboard');
    }
}
