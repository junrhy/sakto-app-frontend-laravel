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
                return redirect()->back()->withErrors([
                    'auth_token' => 'Invalid Viber credentials: ' . $verificationResult['message']
                ]);
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

            return redirect()->back()->with('success', 'Viber account connected successfully!');

        } catch (\Exception $e) {
            Log::error('Viber account creation failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier
            ]);

            return redirect()->back()->withErrors([
                'general' => 'Failed to create Viber account: ' . $e->getMessage()
            ]);
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
     * Test Viber account connection using Infobip API
     */
    public function test($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $account = ViberAccount::where('id', $id)
                ->where('client_identifier', $clientIdentifier)
                ->where('is_active', true)
                ->firstOrFail();

            // Test the connection by sending a test message
            $response = Http::withHeaders([
                'Authorization' => 'App ' . $account->auth_token,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->post('https://api.infobip.com/viber/2/messages', [
                'messages' => [
                    [
                        'sender' => $account->account_name,
                        'destinations' => [['to' => '639260049848']], // Test number
                        'content' => [
                            'text' => 'Connection test message',
                            'type' => 'TEXT'
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $account->update([
                    'is_verified' => true,
                    'last_verified_at' => now()
                ]);

                $responseData = $response->json();
                return response()->json([
                    'success' => true,
                    'message' => 'Viber account connection test successful!',
                    'bulk_id' => $responseData['bulkId'] ?? null,
                    'message_id' => $responseData['messages'][0]['messageId'] ?? null
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
     * Verify Viber Public Account credentials using Infobip API
     */
    private function verifyViberCredentials($authToken)
    {
        try {
            // Test auth token by sending a test message to verify credentials
            $response = Http::withHeaders([
                'Authorization' => 'App ' . $authToken,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->post('https://api.infobip.com/viber/2/messages', [
                'messages' => [
                    [
                        'sender' => 'TestSender',
                        'destinations' => [['to' => '639260049848']], // Test number
                        'content' => [
                            'text' => 'Test message for credential verification',
                            'type' => 'TEXT'
                        ]
                    ]
                ]
            ]);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'message' => 'Invalid auth token or API credentials'
                ];
            }

            $responseData = $response->json();
            
            // Extract account info from response or use defaults
            return [
                'success' => true,
                'public_account_id' => 'infobip_viber_account',
                'uri' => 'infobip_viber_uri',
                'icon' => null,
                'background' => null,
                'category' => 'Business',
                'subcategory' => 'Messaging',
                'location' => null,
                'country' => 'PH',
                'message' => 'Infobip Viber credentials verified successfully'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage()
            ];
        }
    }
}
