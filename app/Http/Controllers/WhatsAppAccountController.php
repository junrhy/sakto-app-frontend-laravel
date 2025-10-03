<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class WhatsAppAccountController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display WhatsApp account setup page
     */
    public function index()
    {
        $clientIdentifier = auth()->user()->identifier;
        
        $accounts = WhatsAppAccount::where('client_identifier', $clientIdentifier)
            ->orderBy('is_verified', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('SMS/WhatsApp/Setup', [
            'accounts' => $accounts,
            'hasActiveAccount' => $accounts->where('is_active', true)->where('is_verified', true)->count() > 0
        ]);
    }

    /**
     * Store a new WhatsApp account
     */
    public function store(Request $request)
    {
        $request->validate([
            'account_name' => 'required|string|max:255',
            'access_token' => 'required|string',
            'phone_number_id' => 'required|string',
            'business_account_id' => 'required|string',
            'webhook_verify_token' => 'nullable|string',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;

            // Verify the WhatsApp Business API credentials
            $verificationResult = $this->verifyWhatsAppCredentials(
                $request->access_token,
                $request->phone_number_id,
                $request->business_account_id
            );

            if (!$verificationResult['success']) {
                return response()->json([
                    'error' => 'Invalid WhatsApp credentials: ' . $verificationResult['message']
                ], 400);
            }

            // Create the WhatsApp account
            $account = WhatsAppAccount::create([
                'client_identifier' => $clientIdentifier,
                'account_name' => $request->account_name,
                'access_token' => $request->access_token,
                'phone_number_id' => $request->phone_number_id,
                'business_account_id' => $request->business_account_id,
                'webhook_verify_token' => $request->webhook_verify_token,
                'phone_number' => $verificationResult['phone_number'],
                'display_name' => $verificationResult['display_name'],
                'is_active' => true,
                'is_verified' => true,
                'last_verified_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp account connected successfully!',
                'account' => $account
            ]);

        } catch (\Exception $e) {
            Log::error('WhatsApp account creation failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier
            ]);

            return response()->json([
                'error' => 'Failed to create WhatsApp account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing WhatsApp account
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'account_name' => 'required|string|max:255',
            'access_token' => 'required|string',
            'phone_number_id' => 'required|string',
            'business_account_id' => 'required|string',
            'webhook_verify_token' => 'nullable|string',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $account = WhatsAppAccount::where('id', $id)
                ->where('client_identifier', $clientIdentifier)
                ->firstOrFail();

            // Verify the WhatsApp Business API credentials
            $verificationResult = $this->verifyWhatsAppCredentials(
                $request->access_token,
                $request->phone_number_id,
                $request->business_account_id
            );

            if (!$verificationResult['success']) {
                return response()->json([
                    'error' => 'Invalid WhatsApp credentials: ' . $verificationResult['message']
                ], 400);
            }

            // Update the account
            $account->update([
                'account_name' => $request->account_name,
                'access_token' => $request->access_token,
                'phone_number_id' => $request->phone_number_id,
                'business_account_id' => $request->business_account_id,
                'webhook_verify_token' => $request->webhook_verify_token,
                'phone_number' => $verificationResult['phone_number'],
                'display_name' => $verificationResult['display_name'],
                'is_verified' => true,
                'last_verified_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp account updated successfully!',
                'account' => $account
            ]);

        } catch (\Exception $e) {
            Log::error('WhatsApp account update failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier,
                'account_id' => $id
            ]);

            return response()->json([
                'error' => 'Failed to update WhatsApp account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a WhatsApp account
     */
    public function destroy($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $account = WhatsAppAccount::where('id', $id)
                ->where('client_identifier', $clientIdentifier)
                ->firstOrFail();

            $account->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp account deactivated successfully!'
            ]);

        } catch (\Exception $e) {
            Log::error('WhatsApp account deletion failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier,
                'account_id' => $id
            ]);

            return response()->json([
                'error' => 'Failed to delete WhatsApp account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test WhatsApp account connection
     */
    public function test($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $account = WhatsAppAccount::where('id', $id)
                ->where('client_identifier', $clientIdentifier)
                ->where('is_active', true)
                ->firstOrFail();

            // Test the connection by getting account info
            $apiUrl = config('services.whatsapp.api_url');
            $response = Http::withToken($account->access_token)
                ->get("{$apiUrl}/{$account->phone_number_id}");

            if ($response->successful()) {
                $account->update([
                    'is_verified' => true,
                    'last_verified_at' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'WhatsApp account connection test successful!',
                    'account_info' => $response->json()
                ]);
            } else {
                return response()->json([
                    'error' => 'Connection test failed: ' . $response->body()
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to test WhatsApp account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify WhatsApp Business API credentials
     */
    private function verifyWhatsAppCredentials($accessToken, $phoneNumberId, $businessAccountId)
    {
        try {
            // Test access token by getting phone number info
            $apiUrl = config('services.whatsapp.api_url');
            $response = Http::withToken($accessToken)
                ->get("{$apiUrl}/{$phoneNumberId}");

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'message' => 'Invalid access token or phone number ID'
                ];
            }

            $phoneData = $response->json();
            
            // Get business account info
            $businessResponse = Http::withToken($accessToken)
                ->get("{$apiUrl}/{$businessAccountId}");

            if (!$businessResponse->successful()) {
                return [
                    'success' => false,
                    'message' => 'Invalid business account ID'
                ];
            }

            $businessData = $businessResponse->json();

            return [
                'success' => true,
                'phone_number' => $phoneData['display_phone_number'] ?? null,
                'display_name' => $businessData['name'] ?? null,
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
