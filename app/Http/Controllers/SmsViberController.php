<?php

namespace App\Http\Controllers;

use App\Models\ViberAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsViberController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index()
    {
        $clientIdentifier = auth()->user()->identifier;
        
        // Get user's Viber accounts
        $accounts = ViberAccount::where('client_identifier', $clientIdentifier)
            ->where('is_active', true)
            ->where('is_verified', true)
            ->get();

        $hasActiveAccount = $accounts->count() > 0;

        return Inertia::render('SMS/Viber/Index', [
            'messages' => [], // TODO: Fetch messages from your database
            'stats' => [
                'sent' => 0,
                'delivered' => 0,
                'failed' => 0
            ],
            'accounts' => $accounts,
            'hasActiveAccount' => $hasActiveAccount
        ]);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'to' => 'required|array',
            'to.*' => 'required|string',
            'message' => 'required|string|max:1000',
            'account_id' => 'nullable|integer|exists:viber_accounts,id',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get the Viber account to use
            if ($request->has('account_id')) {
                $account = ViberAccount::where('id', $request->account_id)
                    ->where('client_identifier', $clientIdentifier)
                    ->where('is_active', true)
                    ->where('is_verified', true)
                    ->first();
            } else {
                // Use the primary account
                $account = ViberAccount::where('client_identifier', $clientIdentifier)
                    ->where('is_active', true)
                    ->where('is_verified', true)
                    ->orderBy('is_verified', 'desc')
                    ->orderBy('created_at', 'asc')
                    ->first();
            }
            
            if (!$account) {
                return response()->json([
                    'error' => 'No active Viber account found. Please set up your Viber account first.'
                ], 400);
            }

            $recipients = $request->input('to');
            $message = $request->input('message');
            $results = [];

            foreach ($recipients as $recipient) {
                try {
                    // Send message via Viber Public Account API
                    $response = Http::withHeaders([
                        'X-Viber-Auth-Token' => $account->auth_token,
                        'Content-Type' => 'application/json'
                    ])->post('https://chatapi.viber.com/pa/send_message', [
                        'receiver' => $recipient,
                        'type' => 'text',
                        'text' => $message,
                        'sender' => [
                            'name' => $account->account_name,
                            'avatar' => $account->icon
                        ]
                    ]);

                    if ($response->successful()) {
                        $responseData = $response->json();
                        $results[] = [
                            'recipient' => $recipient,
                            'message_id' => $responseData['message_token'] ?? 'viber_' . uniqid(),
                            'status' => 'sent'
                        ];
                    } else {
                        $results[] = [
                            'recipient' => $recipient,
                            'message_id' => null,
                            'status' => 'failed',
                            'error' => $response->body()
                        ];
                    }
                } catch (\Exception $e) {
                    Log::error('Viber message sending failed', [
                        'error' => $e->getMessage(),
                        'recipient' => $recipient,
                        'account_id' => $account->id
                    ]);
                    
                    $results[] = [
                        'recipient' => $recipient,
                        'message_id' => null,
                        'status' => 'failed',
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Viber messages processed',
                'results' => $results
            ]);
        } catch (\Exception $e) {
            Log::error('Viber message sending failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier
            ]);

            return response()->json([
                'error' => 'Failed to send Viber message: ' . $e->getMessage()
            ], 500);
        }
    }
}
