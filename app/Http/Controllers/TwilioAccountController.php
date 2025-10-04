<?php

namespace App\Http\Controllers;

use App\Models\TwilioAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class TwilioAccountController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display Twilio account setup page
     */
    public function index()
    {
        $clientIdentifier = auth()->user()->identifier;
        
        $accounts = TwilioAccount::where('client_identifier', $clientIdentifier)
            ->orderBy('is_verified', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('SMS/Twilio/Setup', [
            'accounts' => $accounts,
            'hasActiveAccount' => $accounts->where('is_active', true)->where('is_verified', true)->count() > 0
        ]);
    }

    /**
     * Store a new Twilio account
     */
    public function store(Request $request)
    {
        $request->validate([
            'account_name' => 'required|string|max:255',
            'account_sid' => 'required|string|max:255',
            'auth_token' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'default_country_code' => 'nullable|string|max:5',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;

            // Test the Twilio credentials
            $client = new Client($request->account_sid, $request->auth_token);
            $account = $client->api->v2010->accounts($request->account_sid)->fetch();

            // Create the account
            $twilioAccount = TwilioAccount::create([
                'client_identifier' => $clientIdentifier,
                'account_name' => $request->account_name,
                'account_sid' => $request->account_sid,
                'auth_token' => $request->auth_token,
                'phone_number' => $request->phone_number,
                'default_country_code' => $request->default_country_code ?? '+1',
                'is_active' => true,
                'is_verified' => true,
                'last_verified_at' => now(),
            ]);

            return redirect()->back()->with('success', 'Twilio account added successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to create Twilio account: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to verify Twilio credentials: ' . $e->getMessage());
        }
    }

    /**
     * Update an existing Twilio account
     */
    public function update(Request $request, TwilioAccount $twilioAccount)
    {
        $request->validate([
            'account_name' => 'required|string|max:255',
            'account_sid' => 'required|string|max:255',
            'auth_token' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'default_country_code' => 'nullable|string|max:5',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;

            // Ensure the account belongs to the current user
            if ($twilioAccount->client_identifier !== $clientIdentifier) {
                return redirect()->back()->with('error', 'Unauthorized access to account');
            }

            // Test the Twilio credentials
            $client = new Client($request->account_sid, $request->auth_token);
            $account = $client->api->v2010->accounts($request->account_sid)->fetch();

            // Update the account
            $twilioAccount->update([
                'account_name' => $request->account_name,
                'account_sid' => $request->account_sid,
                'auth_token' => $request->auth_token,
                'phone_number' => $request->phone_number,
                'default_country_code' => $request->default_country_code ?? '+1',
                'is_verified' => true,
                'last_verified_at' => now(),
            ]);

            return redirect()->back()->with('success', 'Twilio account updated successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to update Twilio account: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to verify Twilio credentials: ' . $e->getMessage());
        }
    }

    /**
     * Verify Twilio account credentials
     */
    public function verify(TwilioAccount $twilioAccount)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;

            // Ensure the account belongs to the current user
            if ($twilioAccount->client_identifier !== $clientIdentifier) {
                return response()->json(['error' => 'Unauthorized access to account'], 403);
            }

            // Test the Twilio credentials
            $client = new Client($twilioAccount->account_sid, $twilioAccount->auth_token);
            $account = $client->api->v2010->accounts($twilioAccount->account_sid)->fetch();

            // Update verification status
            $twilioAccount->update([
                'is_verified' => true,
                'last_verified_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Twilio account verified successfully!',
                'account_balance' => $account->balance,
                'currency' => $account->currency
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to verify Twilio account: ' . $e->getMessage());
            
            // Update verification status to false
            $twilioAccount->update([
                'is_verified' => false,
            ]);

            return response()->json([
                'error' => 'Failed to verify Twilio credentials: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Toggle account active status
     */
    public function toggleActive(TwilioAccount $twilioAccount)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;

            // Ensure the account belongs to the current user
            if ($twilioAccount->client_identifier !== $clientIdentifier) {
                return redirect()->back()->with('error', 'Unauthorized access to account');
            }

            $twilioAccount->update([
                'is_active' => !$twilioAccount->is_active
            ]);

            $status = $twilioAccount->is_active ? 'activated' : 'deactivated';
            return redirect()->back()->with('success', "Twilio account {$status} successfully!");
        } catch (\Exception $e) {
            Log::error('Failed to toggle Twilio account status: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update account status');
        }
    }

    /**
     * Delete a Twilio account
     */
    public function destroy(TwilioAccount $twilioAccount)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;

            // Ensure the account belongs to the current user
            if ($twilioAccount->client_identifier !== $clientIdentifier) {
                return redirect()->back()->with('error', 'Unauthorized access to account');
            }

            $twilioAccount->delete();

            return redirect()->back()->with('success', 'Twilio account deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to delete Twilio account: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete account');
        }
    }
}
