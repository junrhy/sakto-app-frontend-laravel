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
            'message' => 'nullable|string|max:1000',
            'account_id' => 'nullable|integer|exists:whats_app_accounts,id',
            'message_type' => 'nullable|string|in:text,template',
            'template_name' => 'nullable|string',
            'template_data' => 'nullable|array',
        ]);

        // Additional validation: ensure either message or template data is provided
        $messageType = $request->input('message_type', 'text');
        if ($messageType === 'template') {
            if (empty($request->input('template_name'))) {
                return redirect()->back()->withErrors(['template_name' => 'Template name is required for template messages.']);
            }
            if (empty($request->input('template_data.placeholders'))) {
                return redirect()->back()->withErrors(['template_data' => 'Template placeholders are required for template messages.']);
            }
        } else {
            if (empty($request->input('message'))) {
                return redirect()->back()->withErrors(['message' => 'Message is required for text messages.']);
            }
        }

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

            // Debug logging for account
            Log::info('WhatsApp account retrieved', [
                'account_id' => $account->id,
                'provider' => $account->provider,
                'infobip_sender_number' => $account->infobip_sender_number,
                'phone_number_id' => $account->phone_number_id,
                'is_active' => $account->is_active,
                'is_verified' => $account->is_verified
            ]);

            $recipients = $request->input('to');
            $message = $request->input('message');
            $messageType = $request->input('message_type', 'text');
            $templateName = $request->input('template_name');
            $templateData = $request->input('template_data', []);
            $results = [];

            foreach ($recipients as $recipient) {
                try {
                    if ($account->isInfobip()) {
                        $result = $this->sendInfobipMessage($account, $recipient, $message, $messageType, $templateName, $templateData);
                    } else {
                        $result = $this->sendFacebookMessage($account, $recipient, $message, $messageType, $templateName, $templateData);
                    }
                    
                    $results[] = $result;
                } catch (\Exception $e) {
                    Log::error('WhatsApp message sending failed', [
                        'error' => $e->getMessage(),
                        'recipient' => $recipient,
                        'account_id' => $account->id,
                        'provider' => $account->provider
                    ]);
                    
                    $results[] = [
                        'recipient' => $recipient,
                        'message_id' => null,
                        'status' => 'failed',
                        'error' => $e->getMessage()
                    ];
                }
            }

            return redirect()->back()->with('message', 'WhatsApp messages sent successfully!');
        } catch (\Exception $e) {
            Log::error('WhatsApp message sending failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier
            ]);

            return redirect()->back()->withErrors(['error' => 'Failed to send WhatsApp message: ' . $e->getMessage()]);
        }
    }

    /**
     * Send message via Infobip WhatsApp API
     */
    private function sendInfobipMessage($account, $recipient, $message, $messageType, $templateName, $templateData)
    {
        $apiKey = $account->getApiKey();
        $senderNumber = $account->getSenderNumber();
        $messageId = 'wa_' . uniqid();
        
        // Debug logging
        Log::info('Infobip send message debug', [
            'account_id' => $account->id,
            'provider' => $account->provider,
            'infobip_sender_number' => $account->infobip_sender_number,
            'phone_number_id' => $account->phone_number_id,
            'sender_number' => $senderNumber,
            'api_key' => $apiKey ? 'present' : 'missing'
        ]);
        
        // Format sender number for Infobip (remove + prefix)
        $formattedSenderNumber = ltrim($senderNumber, '+');
        
        // Format recipient number for Infobip (remove + prefix)
        $formattedRecipient = ltrim($recipient, '+');

        if ($messageType === 'template' && $templateName) {
            // Send template message
            $payload = [
                'messages' => [
                    [
                        'from' => $formattedSenderNumber,
                        'to' => $formattedRecipient,
                        'messageId' => $messageId,
                        'content' => [
                            'templateName' => $templateName,
                            'templateData' => [
                                'body' => [
                                    'placeholders' => $templateData['placeholders'] ?? []
                                ]
                            ],
                            'language' => $templateData['language'] ?? 'en'
                        ]
                    ]
                ]
            ];
        } else {
            // Send text message using the working template
            $payload = [
                'messages' => [
                    [
                        'from' => $formattedSenderNumber,
                        'to' => $formattedRecipient,
                        'messageId' => $messageId,
                        'content' => [
                            'templateName' => 'test_whatsapp_template_en', // Use the working template
                            'templateData' => [
                                'body' => [
                                    'placeholders' => [$message] // Put the text message in placeholders
                                ]
                            ],
                            'language' => 'en'
                        ]
                    ]
                ]
            ];
        }

        // Use template endpoint for all messages (Infobip requires this)
        $endpoint = '/message/template';
        $apiUrl = config('services.whatsapp.infobip.api_url') . $endpoint;
        
        Log::info('Infobip API call details', [
            'api_url' => $apiUrl,
            'endpoint' => $endpoint,
            'payload' => $payload
        ]);
        
        try {
            $response = Http::withHeaders([
                'Authorization' => "App {$apiKey}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->post($apiUrl, $payload);
        } catch (\Exception $e) {
            Log::error('Infobip API call failed', [
                'error' => $e->getMessage(),
                'api_url' => $apiUrl,
                'payload' => $payload
            ]);
            throw $e;
        }

        // Log the full response for debugging
        Log::info('Infobip API response', [
            'status' => $response->status(),
            'headers' => $response->headers(),
            'body' => $response->body(),
            'payload_sent' => $payload
        ]);

        if ($response->successful()) {
            $responseData = $response->json();
            return [
                'recipient' => $recipient,
                'message_id' => $responseData['messages'][0]['messageId'] ?? $messageId,
                'status' => $this->mapInfobipStatus($responseData['messages'][0]['status']['name'] ?? 'PENDING_ENROUTE'),
                'provider' => 'infobip'
            ];
        } else {
            return [
                'recipient' => $recipient,
                'message_id' => null,
                'status' => 'failed',
                'error' => $response->body(),
                'provider' => 'infobip'
            ];
        }
    }

    /**
     * Send message via Facebook WhatsApp Business API
     */
    private function sendFacebookMessage($account, $recipient, $message, $messageType, $templateName, $templateData)
    {
        $apiUrl = config('services.whatsapp.api_url');
        $accessToken = $account->getApiKey();
        $phoneNumberId = $account->getSenderNumber();
        
        if ($messageType === 'template' && $templateName) {
            // Send template message (Facebook format)
            $payload = [
                'messaging_product' => 'whatsapp',
                'to' => $recipient,
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => [
                        'code' => $templateData['language'] ?? 'en'
                    ],
                    'components' => [
                        [
                            'type' => 'body',
                            'parameters' => array_map(function($placeholder) {
                                return ['type' => 'text', 'text' => $placeholder];
                            }, $templateData['placeholders'] ?? [])
                        ]
                    ]
                ]
            ];
        } else {
            // Send text message
            $payload = [
                'messaging_product' => 'whatsapp',
                'to' => $recipient,
                'type' => 'text',
                'text' => [
                    'body' => $message
                ]
            ];
        }

        $response = Http::withToken($accessToken)
            ->post("{$apiUrl}/{$phoneNumberId}/messages", $payload);

        if ($response->successful()) {
            $responseData = $response->json();
            return [
                'recipient' => $recipient,
                'message_id' => $responseData['messages'][0]['id'] ?? 'wa_' . uniqid(),
                'status' => 'sent',
                'provider' => 'facebook'
            ];
        } else {
            return [
                'recipient' => $recipient,
                'message_id' => null,
                'status' => 'failed',
                'error' => $response->body(),
                'provider' => 'facebook'
            ];
        }
    }

    /**
     * Map Infobip status to our internal status
     */
    private function mapInfobipStatus($infobipStatus)
    {
        $statusMap = [
            'PENDING_ENROUTE' => 'sent',
            'SENT_TO_HANDSET' => 'delivered',
            'DELIVERED_TO_HANDSET' => 'delivered',
            'EXPIRED_EXPIRED' => 'failed',
            'REJECTED' => 'failed',
            'UNDELIVERABLE' => 'failed',
        ];

        return $statusMap[$infobipStatus] ?? 'sent';
    }
}
