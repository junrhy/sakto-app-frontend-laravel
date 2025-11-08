<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TravelController extends Controller
{
    protected string $apiUrl;
    protected string $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Render the travel packages management page.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $clientIdentifier = $this->getClientIdentifier();

            $packagesResponse = $this->apiGet('/travel-packages', [
                'client_identifier' => $clientIdentifier,
                'per_page' => $request->integer('per_page', 10),
            ]);

            if (!$packagesResponse->successful()) {
                throw new \Exception('Failed to load travel packages: ' . $packagesResponse->body());
            }

            return Inertia::render('Travel/Packages/Index', [
                'packages' => $packagesResponse->json(),
                'filters' => [
                    'status' => $request->get('status') ?? null,
                    'package_type' => $request->get('package_type') ?? null,
                ],
                'appCurrency' => $this->getAppCurrency(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Travel packages index failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('dashboard')->with('error', 'Unable to load travel packages at the moment.');
        }
    }

    /**
     * Render the travel bookings management page.
     */
    public function bookings(): Response|RedirectResponse
    {
        try {
            $clientIdentifier = $this->getClientIdentifier();

            $bookingsResponse = $this->apiGet('/travel-bookings', [
                'client_identifier' => $clientIdentifier,
                'per_page' => 10,
            ]);

            if (!$bookingsResponse->successful()) {
                throw new \Exception('Failed to load travel bookings: ' . $bookingsResponse->body());
            }

            $packagesResponse = $this->apiGet('/travel-packages', [
                'client_identifier' => $clientIdentifier,
                'per_page' => 100,
            ]);

            $packages = $packagesResponse->successful() ? $packagesResponse->json('data') : [];

            return Inertia::render('Travel/Bookings/Index', [
                'bookings' => $bookingsResponse->json(),
                'packages' => $packages,
                'appCurrency' => $this->getAppCurrency(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Travel bookings index failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('travel.packages.index')->with('error', 'Unable to load travel bookings at the moment.');
        }
    }

    /**
     * Retrieve packages from backend API.
     */
    public function getPackages(Request $request)
    {
        try {
            $payload = array_merge(
                $request->only(['status', 'package_type', 'search', 'is_featured', 'per_page', 'page']),
                ['client_identifier' => $this->getClientIdentifier()]
            );

            $response = $this->apiGet('/travel-packages', $payload);

            if (!$response->successful()) {
                throw new \Exception('Failed to fetch travel packages: ' . $response->body());
            }

            return response()->json($response->json(), $response->status());
        } catch (\Throwable $e) {
            Log::error('Travel getPackages failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to fetch travel packages.',
            ], 500);
        }
    }

    /**
     * Store a package via backend API.
     */
    public function storePackage(Request $request)
    {
        try {
            $payload = array_merge(
                $request->only([
                    'title',
                    'slug',
                    'tagline',
                    'description',
                    'duration_days',
                    'duration_label',
                    'price',
                    'inclusions',
                    'package_type',
                    'status',
                    'is_featured',
                    'media',
                ]),
                ['client_identifier' => $this->getClientIdentifier()]
            );

            $response = $this->apiPost('/travel-packages', $payload);

            if (!$response->successful()) {
                throw new \Exception('Failed to create travel package: ' . $response->body());
            }

            return response()->json($response->json(), 201);
        } catch (\Throwable $e) {
            Log::error('Travel storePackage failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to create travel package.',
            ], 500);
        }
    }

    /**
     * Update a package via backend API.
     */
    public function updatePackage(Request $request, int $id)
    {
        try {
            $payload = array_merge(
                $request->only([
                    'title',
                    'slug',
                    'tagline',
                    'description',
                    'duration_days',
                    'duration_label',
                    'price',
                    'inclusions',
                    'package_type',
                    'status',
                    'is_featured',
                    'media',
                ]),
                ['client_identifier' => $this->getClientIdentifier()]
            );

            $response = $this->apiPut("/travel-packages/{$id}", $payload);

            if (!$response->successful()) {
                throw new \Exception('Failed to update travel package: ' . $response->body());
            }

            return response()->json($response->json(), $response->status());
        } catch (\Throwable $e) {
            Log::error('Travel updatePackage failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to update travel package.',
            ], 500);
        }
    }

    /**
     * Delete a package via backend API.
     */
    public function deletePackage(int $id)
    {
        try {
            $response = $this->apiDelete("/travel-packages/{$id}", [
                'client_identifier' => $this->getClientIdentifier(),
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to delete travel package: ' . $response->body());
            }

            return response()->json($response->json(), $response->status());
        } catch (\Throwable $e) {
            Log::error('Travel deletePackage failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to delete travel package.',
            ], 500);
        }
    }

    /**
     * Retrieve bookings via backend API.
     */
    public function getBookings(Request $request)
    {
        try {
            $payload = array_merge(
                $request->only([
                    'status',
                    'payment_status',
                    'from_date',
                    'to_date',
                    'search',
                    'travel_package_id',
                    'per_page',
                    'page',
                ]),
                ['client_identifier' => $this->getClientIdentifier()]
            );

            $response = $this->apiGet('/travel-bookings', $payload);

            if (!$response->successful()) {
                throw new \Exception('Failed to fetch travel bookings: ' . $response->body());
            }

            return response()->json($response->json(), $response->status());
        } catch (\Throwable $e) {
            Log::error('Travel getBookings failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to fetch travel bookings.',
            ], 500);
        }
    }

    /**
     * Store a booking via backend API.
     */
    public function storeBooking(Request $request)
    {
        try {
            $payload = array_merge(
                $request->only([
                    'travel_package_id',
                    'booking_reference',
                    'customer_name',
                    'customer_email',
                    'customer_contact_number',
                    'travel_date',
                    'travelers_count',
                    'total_price',
                    'status',
                    'payment_status',
                    'notes',
                    'metadata',
                ]),
                ['client_identifier' => $this->getClientIdentifier()]
            );

            $response = $this->apiPost('/travel-bookings', $payload);

            if (!$response->successful()) {
                throw new \Exception('Failed to create travel booking: ' . $response->body());
            }

            return response()->json($response->json(), 201);
        } catch (\Throwable $e) {
            Log::error('Travel storeBooking failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to create travel booking.',
            ], 500);
        }
    }

    /**
     * Update a booking via backend API.
     */
    public function updateBooking(Request $request, int $id)
    {
        try {
            $payload = array_merge(
                $request->only([
                    'travel_package_id',
                    'booking_reference',
                    'customer_name',
                    'customer_email',
                    'customer_contact_number',
                    'travel_date',
                    'travelers_count',
                    'total_price',
                    'status',
                    'payment_status',
                    'notes',
                    'metadata',
                ]),
                ['client_identifier' => $this->getClientIdentifier()]
            );

            $response = $this->apiPut("/travel-bookings/{$id}", $payload);

            if (!$response->successful()) {
                throw new \Exception('Failed to update travel booking: ' . $response->body());
            }

            return response()->json($response->json(), $response->status());
        } catch (\Throwable $e) {
            Log::error('Travel updateBooking failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to update travel booking.',
            ], 500);
        }
    }

    /**
     * Delete a booking via backend API.
     */
    public function deleteBooking(int $id)
    {
        try {
            $response = $this->apiDelete("/travel-bookings/{$id}", [
                'client_identifier' => $this->getClientIdentifier(),
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to delete travel booking: ' . $response->body());
            }

            return response()->json($response->json(), $response->status());
        } catch (\Throwable $e) {
            Log::error('Travel deleteBooking failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to delete travel booking.',
            ], 500);
        }
    }

    /**
     * Public travel profile page.
     */
    public function show(string $identifier)
    {
        try {
            // Check if identifier is numeric (ID) or string (slug)
            $travel = null;

            if (is_numeric($identifier)) {
                $travel = \App\Models\User::where('project_identifier', 'travel')
                    ->where('id', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            } else {
                $travel = \App\Models\User::where('project_identifier', 'travel')
                    ->where('slug', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            }

            if (!$travel) {
                abort(404, 'Travel service not found');
            }

            return Inertia::render('Public/Travel/Show', [
                'travel' => $travel,
                'identifier' => $identifier,
                'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
                'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
                'auth' => [
                    'user' => auth()->user(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('TravelController show error: ' . $e->getMessage());
            abort(500, 'Unable to load travel information');
        }
    }

    /**
     * Helper to perform GET requests to backend API.
     */
    protected function apiGet(string $endpoint, array $query = [])
    {
        return Http::withToken($this->apiToken)
            ->acceptJson()
            ->timeout(config('http.timeout', 15))
            ->get($this->buildEndpoint($endpoint), $query);
    }

    /**
     * Helper to perform POST requests to backend API.
     */
    protected function apiPost(string $endpoint, array $payload = [])
    {
        return Http::withToken($this->apiToken)
            ->acceptJson()
            ->timeout(config('http.timeout', 15))
            ->post($this->buildEndpoint($endpoint), $payload);
    }

    /**
     * Helper to perform PUT requests to backend API.
     */
    protected function apiPut(string $endpoint, array $payload = [])
    {
        return Http::withToken($this->apiToken)
            ->acceptJson()
            ->timeout(config('http.timeout', 15))
            ->put($this->buildEndpoint($endpoint), $payload);
    }

    /**
     * Helper to perform DELETE requests to backend API.
     */
    protected function apiDelete(string $endpoint, array $query = [])
    {
        return Http::withToken($this->apiToken)
            ->acceptJson()
            ->timeout(config('http.timeout', 15))
            ->delete($this->buildEndpoint($endpoint), $query);
    }

    /**
     * Build full API endpoint URL.
     */
    protected function buildEndpoint(string $endpoint): string
    {
        return rtrim($this->apiUrl, '/') . $endpoint;
    }

    /**
     * Retrieve authenticated client identifier.
     */
    protected function getClientIdentifier(): string
    {
        $user = auth()->user();

        if (!$user || empty($user->identifier)) {
            throw new \RuntimeException('Authenticated user identifier is required for travel operations.');
        }

        return $user->identifier;
    }

    /**
     * Get decoded app currency preferences.
     */
    protected function getAppCurrency(): ?array
    {
        $user = auth()->user();
        $currency = $user?->app_currency;

        if (!$currency) {
            return null;
        }

        $decoded = json_decode($currency, true);

        return is_array($decoded) ? $decoded : null;
    }
}