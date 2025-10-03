<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsWhatsAppController extends Controller
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
        
        // Get user's WhatsApp accounts
        $accounts = WhatsAppAccount::where('client_identifier', $clientIdentifier)
            ->where('is_active', true)
            ->where('is_verified', true)
            ->get();

        $hasActiveAccount = $accounts->count() > 0;

        return Inertia::render('SMS/WhatsApp/Index', [
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
            'account_id' => 'nullable|integer|exists:whats_app_accounts,id',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get the WhatsApp account to use
            if ($request->has('account_id')) {
                $account = WhatsAppAccount::where('id', $request->account_id)
                    ->where('client_identifier', $clientIdentifier)
                    ->where('is_active', true)
                    ->where('is_verified', true)
                    ->first();
            } else {
                // Use the primary account
                $account = WhatsAppAccount::where('client_identifier', $clientIdentifier)
                    ->where('is_active', true)
                    ->where('is_verified', true)
                    ->orderBy('is_verified', 'desc')
                    ->orderBy('created_at', 'asc')
                    ->first();
            }
            
            if (!$account) {
                return response()->json([
                    'error' => 'No active WhatsApp account found. Please set up your WhatsApp account first.'
                ], 400);
            }

            $recipients = $request->input('to');
            $message = $request->input('message');
            $results = [];

            foreach ($recipients as $recipient) {
                try {
                    // Send message via WhatsApp Business API
                    $apiUrl = config('services.whatsapp.api_url');
                    $response = Http::withToken($account->access_token)
                        ->post("{$apiUrl}/{$account->phone_number_id}/messages", [
                            'messaging_product' => 'whatsapp',
                            'to' => $recipient,
                            'type' => 'text',
                            'text' => [
                                'body' => $message
                            ]
                        ]);

                    if ($response->successful()) {
                        $responseData = $response->json();
                        $results[] = [
                            'recipient' => $recipient,
                            'message_id' => $responseData['messages'][0]['id'] ?? 'wa_' . uniqid(),
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
                    Log::error('WhatsApp message sending failed', [
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
                'message' => 'WhatsApp messages processed',
                'results' => $results
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsApp message sending failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier
            ]);

            return response()->json([
                'error' => 'Failed to send WhatsApp message: ' . $e->getMessage()
            ], 500);
        }
    }

    }
