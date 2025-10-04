<?php

namespace App\Http\Controllers;

use App\Models\ViberAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ViberAccountController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display Viber account setup page
     */
    public function index()
    {
        $clientIdentifier = auth()->user()->identifier;
        
        $accounts = ViberAccount::where('client_identifier', $clientIdentifier)
            ->orderBy('is_verified', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('SMS/Viber/Setup', [
            'accounts' => $accounts,
            'hasActiveAccount' => $accounts->where('is_active', true)->where('is_verified', true)->count() > 0
        ]);
    }

    /**
     * Store a new Viber account
     */
    public function store(Request $request)
    {
        $request->validate([
            'account_name' => 'required|string|max:255',
            'auth_token' => 'required|string',
            'webhook_url' => 'nullable|url',
            'webhook_events' => 'nullable|array',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;

            // Verify the Viber Public Account credentials
            $verificationResult = $this->verifyViberCredentials($request->auth_token);

            if (!$verificationResult['success']) {
                return response()->json([
                    'error' => 'Invalid Viber credentials: ' . $verificationResult['message']
                ], 400);
            }

            // Create the Viber account
            $account = ViberAccount::create([
                'client_identifier' => $clientIdentifier,
                'account_name' => $request->account_name,
                'auth_token' => $request->auth_token,
                'webhook_url' => $request->webhook_url,
                'webhook_events' => $request->webhook_events,
                'is_active' => true,
                'is_verified' => true,
                'last_verified_at' => now(),
                'public_account_id' => $verificationResult['public_account_id'],
                'uri' => $verificationResult['uri'],
                'icon' => $verificationResult['icon'],
                'background' => $verificationResult['background'],
                'category' => $verificationResult['category'],
                'subcategory' => $verificationResult['subcategory'],
                'location' => $verificationResult['location'],
                'country' => $verificationResult['country'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Viber account connected successfully!',
                'account' => $account
            ]);

        } catch (\Exception $e) {
            Log::error('Viber account creation failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier
            ]);

            return response()->json([
                'error' => 'Failed to create Viber account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing Viber account
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'account_name' => 'required|string|max:255',
            'auth_token' => 'required|string',
            'webhook_url' => 'nullable|url',
            'webhook_events' => 'nullable|array',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $account = ViberAccount::where('id', $id)
                ->where('client_identifier', $clientIdentifier)
                ->firstOrFail();

            // Verify the Viber Public Account credentials
            $verificationResult = $this->verifyViberCredentials($request->auth_token);

            if (!$verificationResult['success']) {
                return response()->json([
                    'error' => 'Invalid Viber credentials: ' . $verificationResult['message']
                ], 400);
            }

            // Update the account
            $account->update([
                'account_name' => $request->account_name,
                'auth_token' => $request->auth_token,
                'webhook_url' => $request->webhook_url,
                'webhook_events' => $request->webhook_events,
                'is_verified' => true,
                'last_verified_at' => now(),
                'public_account_id' => $verificationResult['public_account_id'],
                'uri' => $verificationResult['uri'],
                'icon' => $verificationResult['icon'],
                'background' => $verificationResult['background'],
                'category' => $verificationResult['category'],
                'subcategory' => $verificationResult['subcategory'],
                'location' => $verificationResult['location'],
                'country' => $verificationResult['country'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Viber account updated successfully!',
                'account' => $account
            ]);

        } catch (\Exception $e) {
            Log::error('Viber account update failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier,
                'account_id' => $id
            ]);

            return response()->json([
                'error' => 'Failed to update Viber account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a Viber account
     */
    public function destroy($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $account = ViberAccount::where('id', $id)
                ->where('client_identifier', $clientIdentifier)
                ->firstOrFail();

            $account->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Viber account deactivated successfully!'
            ]);

        } catch (\Exception $e) {
            Log::error('Viber account deletion failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier,
                'account_id' => $id
            ]);

            return response()->json([
                'error' => 'Failed to delete Viber account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test Viber account connection
     */
    public function test($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $account = ViberAccount::where('id', $id)
                ->where('client_identifier', $clientIdentifier)
                ->where('is_active', true)
                ->firstOrFail();

            // Test the connection by getting account info
            $response = Http::withHeaders([
                'X-Viber-Auth-Token' => $account->auth_token,
                'Content-Type' => 'application/json'
            ])->get('https://chatapi.viber.com/pa/get_account_info');

            if ($response->successful()) {
                $account->update([
                    'is_verified' => true,
                    'last_verified_at' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Viber account connection test successful!',
                    'account_info' => $response->json()
                ]);
            } else {
                return response()->json([
                    'error' => 'Connection test failed: ' . $response->body()
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to test Viber account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify Viber Public Account credentials
     */
    private function verifyViberCredentials($authToken)
    {
        try {
            // Test auth token by getting account info
            $response = Http::withHeaders([
                'X-Viber-Auth-Token' => $authToken,
                'Content-Type' => 'application/json'
            ])->get('https://chatapi.viber.com/pa/get_account_info');

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'message' => 'Invalid auth token'
                ];
            }

            $accountData = $response->json();

            return [
                'success' => true,
                'public_account_id' => $accountData['id'] ?? null,
                'uri' => $accountData['uri'] ?? null,
                'icon' => $accountData['icon'] ?? null,
                'background' => $accountData['background'] ?? null,
                'category' => $accountData['category'] ?? null,
                'subcategory' => $accountData['subcategory'] ?? null,
                'location' => $accountData['location'] ?? null,
                'country' => $accountData['country'] ?? null,
                'message' => 'Credentials verified successfully'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage()
            ];
        }
    }
}
