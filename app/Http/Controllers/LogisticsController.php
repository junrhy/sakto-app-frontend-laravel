<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LogisticsController extends Controller
{
    protected $apiUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the logistics landing page.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        return Inertia::render('Landing/Logistics/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    /**
     * Display the logistics show page with truck fleet.
     *
     * @param Request $request
     * @param string $identifier
     * @return \Inertia\Response
     */
    public function show(Request $request, $identifier)
    {
        return Inertia::render('Landing/Logistics/Show', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'identifier' => $identifier,
        ]);
    }

    // ==================== TRUCK MANAGEMENT (READ-ONLY) ====================

    /**
     * Get all trucks with filtering and pagination.
     */
    public function getTrucks(Request $request)
    {
        try {
            $request->validate([
                'client_identifier' => 'required|string'
            ]);

            $clientIdentifier = $request->input('client_identifier');
            $request->merge(['client_identifier' => $clientIdentifier]);
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/fleet', $request->all());
            
            // The backend API returns the data directly as an array
            $data = $response->json();
            
            // Check if the response is successful
            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch trucks from API',
                    'error' => $data['message'] ?? 'Unknown error'
                ], $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch trucks', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trucks',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search for user by identifier.
     */
    public function searchUser(Request $request)
    {
        try {
            $request->validate([
                'client_identifier' => 'required|string'
            ]);

            $clientIdentifier = $request->input('client_identifier');
            
            // Search in the local database for users with this identifier
            $user = \App\Models\User::where('identifier', $clientIdentifier)
                ->select('id', 'name', 'email', 'identifier')
                ->first();

            if ($user) {
                return response()->json([
                    'success' => true,
                    'data' => $user
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                    'error' => 'No user found with the provided identifier'
                ], 404);
            }
        } catch (\Exception $e) {
            Log::error('Failed to search user', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to search user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
