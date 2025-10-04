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

            // Format phone numbers to international format
            $formattedRecipients = [];
            foreach ($recipients as $recipient) {
                $formattedRecipients[] = $this->formatPhoneNumber($recipient);
            }

            try {
                // Send messages via Infobip Viber API (batch format)
                $response = Http::withHeaders([
                    'Authorization' => 'App ' . $account->auth_token,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ])->post('https://api.infobip.com/viber/2/messages', [
                    'messages' => [
                        [
                            'sender' => $account->account_name,
                            'destinations' => array_map(function($recipient) {
                                return ['to' => $recipient];
                            }, $formattedRecipients),
                            'content' => [
                                'text' => $message,
                                'type' => 'TEXT'
                            ]
                        ]
                    ]
                ]);

                if ($response->successful()) {
                    $responseData = $response->json();
                    $bulkId = $responseData['bulkId'] ?? null;
                    
                    // Process individual message results
                    if (isset($responseData['messages'])) {
                        foreach ($responseData['messages'] as $index => $messageResult) {
                            $results[] = [
                                'recipient' => $formattedRecipients[$index] ?? 'unknown',
                                'message_id' => $messageResult['messageId'] ?? 'viber_' . uniqid(),
                                'status' => $this->mapInfobipStatus($messageResult['status']['name'] ?? 'unknown'),
                                'bulk_id' => $bulkId
                            ];
                        }
                    } else {
                        // Fallback if no individual results
                        foreach ($formattedRecipients as $recipient) {
                            $results[] = [
                                'recipient' => $recipient,
                                'message_id' => 'viber_' . uniqid(),
                                'status' => 'sent',
                                'bulk_id' => $bulkId
                            ];
                        }
                    }
                } else {
                    Log::error('Infobip Viber API error', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                        'account_id' => $account->id
                    ]);
                    
                    foreach ($formattedRecipients as $recipient) {
                        $results[] = [
                            'recipient' => $recipient,
                            'message_id' => null,
                            'status' => 'failed',
                            'error' => 'API Error: ' . $response->body()
                        ];
                    }
                }
            } catch (\Exception $e) {
                Log::error('Viber message sending failed', [
                    'error' => $e->getMessage(),
                    'account_id' => $account->id
                ]);
                
                foreach ($formattedRecipients as $recipient) {
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

    /**
     * Format phone number to international format
     */
    private function formatPhoneNumber($phoneNumber)
    {
        // Remove any non-digit characters except +
        $cleaned = preg_replace('/[^\d+]/', '', $phoneNumber);
        
        // If it starts with +, return as is
        if (strpos($cleaned, '+') === 0) {
            return $cleaned;
        }
        
        // If it starts with 0, replace with country code
        if (strpos($cleaned, '0') === 0) {
            return '+63' . substr($cleaned, 1);
        }
        
        // If it's already 10-11 digits without country code, add +63
        if (strlen($cleaned) >= 10 && strlen($cleaned) <= 11) {
            return '+63' . $cleaned;
        }
        
        // If it's 12+ digits, assume it has country code but no +
        if (strlen($cleaned) >= 12) {
            return '+' . $cleaned;
        }
        
        // Default: return as is
        return $cleaned;
    }

    /**
     * Map Infobip status to our internal status
     */
    private function mapInfobipStatus($infobipStatus)
    {
        $statusMap = [
            'PENDING_ACCEPTED' => 'sent',
            'PENDING' => 'sent',
            'SENT' => 'sent',
            'DELIVERED' => 'delivered',
            'UNDELIVERED' => 'failed',
            'EXPIRED' => 'failed',
            'REJECTED' => 'failed',
            'UNKNOWN' => 'failed'
        ];
        
        return $statusMap[$infobipStatus] ?? 'unknown';
    }
}
