<?php

namespace App\Http\Controllers;

use App\Models\SemaphoreAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class SemaphoreAccountController extends Controller
{
    protected $apiUrl, $apiToken;
    protected $semaphoreApiEndpoint = 'https://api.semaphore.co/api/v4';

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display Semaphore account setup page
     */
    public function index()
    {
        $clientIdentifier = auth()->user()->identifier;
        
        $accounts = SemaphoreAccount::where('client_identifier', $clientIdentifier)
            ->orderBy('is_verified', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('SMS/Semaphore/Setup', [
            'accounts' => $accounts,
            'hasActiveAccount' => $accounts->where('is_active', true)->where('is_verified', true)->count() > 0
        ]);
    }

    /**
     * Store a new Semaphore account
     */
    public function store(Request $request)
    {
        $request->validate([
            'account_name' => 'required|string|max:255',
            'api_key' => 'required|string',
            'sender_name' => 'required|string|max:11', // Semaphore sender name limit
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;

            // Verify the API key by making a test request
            $response = Http::get($this->semaphoreApiEndpoint . '/account', [
                'apikey' => $request->api_key
            ]);

            if (!$response->successful()) {
                return back()->withErrors([
                    'api_key' => 'Invalid API key or Semaphore service unavailable'
                ]);
            }

            $accountData = $response->json();

            // Create the account
            $account = SemaphoreAccount::create([
                'client_identifier' => $clientIdentifier,
                'account_name' => $request->account_name,
                'api_key' => $request->api_key,
                'sender_name' => $request->sender_name,
                'is_verified' => true,
                'last_verified_at' => now(),
            ]);

            return back()->with('success', 'Semaphore account connected successfully!');
        } catch (\Exception $e) {
            Log::error('Semaphore account creation failed', [
                'error' => $e->getMessage(),
                'client_identifier' => auth()->user()->identifier
            ]);

            return back()->withErrors([
                'api_key' => 'Failed to connect to Semaphore account: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update a Semaphore account
     */
    public function update(Request $request, SemaphoreAccount $semaphoreAccount)
    {
        $request->validate([
            'account_name' => 'required|string|max:255',
            'api_key' => 'required|string',
            'sender_name' => 'required|string|max:11',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;

            // Verify the account belongs to the client
            if ($semaphoreAccount->client_identifier !== $clientIdentifier) {
                return back()->withErrors(['error' => 'Unauthorized access']);
            }

            // Verify the API key by making a test request
            $response = Http::get($this->semaphoreApiEndpoint . '/account', [
                'apikey' => $request->api_key
            ]);

            if (!$response->successful()) {
                return back()->withErrors([
                    'api_key' => 'Invalid API key or Semaphore service unavailable'
                ]);
            }

            // Update the account
            $semaphoreAccount->update([
                'account_name' => $request->account_name,
                'api_key' => $request->api_key,
                'sender_name' => $request->sender_name,
                'is_verified' => true,
                'last_verified_at' => now(),
            ]);

            return back()->with('success', 'Semaphore account updated successfully!');
        } catch (\Exception $e) {
            Log::error('Semaphore account update failed', [
                'error' => $e->getMessage(),
                'account_id' => $semaphoreAccount->id,
                'client_identifier' => auth()->user()->identifier
            ]);

            return back()->withErrors([
                'api_key' => 'Failed to update Semaphore account: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete a Semaphore account
     */
    public function destroy(SemaphoreAccount $semaphoreAccount)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;

            // Verify the account belongs to the client
            if ($semaphoreAccount->client_identifier !== $clientIdentifier) {
                return back()->withErrors(['error' => 'Unauthorized access']);
            }

            $semaphoreAccount->delete();

            return back()->with('success', 'Semaphore account deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Semaphore account deletion failed', [
                'error' => $e->getMessage(),
                'account_id' => $semaphoreAccount->id,
                'client_identifier' => auth()->user()->identifier
            ]);

            return back()->withErrors(['error' => 'Failed to delete Semaphore account']);
        }
    }

    /**
     * Toggle account active status
     */
    public function toggleActive(SemaphoreAccount $semaphoreAccount)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;

            // Verify the account belongs to the client
            if ($semaphoreAccount->client_identifier !== $clientIdentifier) {
                return response()->json(['error' => 'Unauthorized access'], 403);
            }

            $semaphoreAccount->update([
                'is_active' => !$semaphoreAccount->is_active
            ]);

            $status = $semaphoreAccount->is_active ? 'activated' : 'deactivated';
            return response()->json([
                'success' => true,
                'message' => "Semaphore account {$status} successfully",
                'is_active' => $semaphoreAccount->is_active
            ]);
        } catch (\Exception $e) {
            Log::error('Semaphore account toggle failed', [
                'error' => $e->getMessage(),
                'account_id' => $semaphoreAccount->id,
                'client_identifier' => auth()->user()->identifier
            ]);

            return response()->json(['error' => 'Failed to toggle account status'], 500);
        }
    }

    /**
     * Test Semaphore account connection
     */
    public function test(SemaphoreAccount $semaphoreAccount)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;

            // Verify the account belongs to the client
            if ($semaphoreAccount->client_identifier !== $clientIdentifier) {
                return response()->json(['error' => 'Unauthorized access'], 403);
            }

            // Test the connection by fetching account info
            $response = Http::get($this->semaphoreApiEndpoint . '/account', [
                'apikey' => $semaphoreAccount->api_key
            ]);

            if ($response->successful()) {
                $accountData = $response->json();
                
                // Update verification status
                $semaphoreAccount->update([
                    'is_verified' => true,
                    'last_verified_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Semaphore account connection test successful!',
                    'account_balance' => $accountData['credit_balance'] ?? 0,
                    'currency' => 'PHP'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to connect to Semaphore API'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Semaphore account test failed', [
                'error' => $e->getMessage(),
                'account_id' => $semaphoreAccount->id,
                'client_identifier' => auth()->user()->identifier
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Connection test failed: ' . $e->getMessage()
            ]);
        }
    }
}
