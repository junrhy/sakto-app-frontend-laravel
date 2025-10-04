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
            'provider' => 'required|string|in:facebook,infobip',
            'access_token' => 'nullable|string',
            'infobip_api_key' => 'nullable|string',
            'phone_number_id' => 'nullable|string',
            'infobip_sender_number' => 'nullable|string',
            'business_account_id' => 'nullable|string',
            'webhook_verify_token' => 'nullable|string',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $provider = $request->provider;

            // Validate provider-specific required fields
            if ($provider === 'facebook') {
                $request->validate([
                    'access_token' => 'required|string',
                    'phone_number_id' => 'required|string',
                    'business_account_id' => 'required|string',
                ]);
            } elseif ($provider === 'infobip') {
                $request->validate([
                    'infobip_api_key' => 'required|string',
                    'infobip_sender_number' => 'required|string',
                ]);
            }

            // Verify the credentials based on provider
            if ($provider === 'facebook') {
                $verificationResult = $this->verifyFacebookCredentials(
                    $request->access_token,
                    $request->phone_number_id,
                    $request->business_account_id
                );
            } else {
                $verificationResult = $this->verifyInfobipCredentials(
                    $request->infobip_api_key,
                    $request->infobip_sender_number
                );
            }

            if (!$verificationResult['success']) {
                return redirect()->back()->withErrors(['error' => 'Invalid WhatsApp credentials: ' . $verificationResult['message']]);
            }

            // Create the WhatsApp account
            $accountData = [
                'client_identifier' => $clientIdentifier,
                'account_name' => $request->account_name,
                'provider' => $provider,
                'is_active' => true,
                'is_verified' => true,
                'last_verified_at' => now(),
            ];

            // Add provider-specific fields
            if ($provider === 'facebook') {
                $accountData = array_merge($accountData, [
                    'access_token' => $request->access_token,
                    'phone_number_id' => $request->phone_number_id,
                    'business_account_id' => $request->business_account_id,
                    'webhook_verify_token' => $request->webhook_verify_token,
                    'phone_number' => $verificationResult['phone_number'],
                    'display_name' => $verificationResult['display_name'],
                ]);
            } else {
                $accountData = array_merge($accountData, [
                    'access_token' => 'infobip_account', // Placeholder for Infobip accounts
                    'phone_number_id' => $request->infobip_sender_number, // Use sender number as phone_number_id for Infobip
                    'business_account_id' => 'infobip', // Placeholder for Infobip accounts
                    'infobip_api_key' => $request->infobip_api_key,
                    'infobip_sender_number' => $request->infobip_sender_number,
                    'phone_number' => $verificationResult['phone_number'],
                    'display_name' => $verificationResult['display_name'],
                    'available_templates' => $verificationResult['templates'] ?? [],
                ]);
            }

            $account = WhatsAppAccount::create($accountData);

            return redirect()->back()->with('message', 'WhatsApp account connected successfully!');

        } catch (\Exception $e) {
            Log::error('WhatsApp account creation failed', [
                'error' => $e->getMessage(),
                'user' => auth()->user()->identifier
            ]);

            return redirect()->back()->withErrors(['error' => 'Failed to create WhatsApp account: ' . $e->getMessage()]);
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

            // Test connection based on provider
            if ($account->isFacebook()) {
                // Test Facebook API connection
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
                        'message' => 'Facebook WhatsApp account connection test successful!',
                        'account_info' => $response->json()
                    ]);
                } else {
                    return response()->json([
                        'error' => 'Connection test failed: ' . $response->body()
                    ], 400);
                }
            } else if ($account->isInfobip()) {
                // Test Infobip API connection
                $testPayload = [
                    'messages' => [
                        [
                            'from' => $account->infobip_sender_number,
                            'to' => '639260049848', // Test number
                            'messageId' => 'test_' . uniqid(),
                            'content' => [
                                'templateName' => 'test_whatsapp_template_en',
                                'templateData' => [
                                    'body' => [
                                        'placeholders' => ['Test']
                                    ]
                                ],
                                'language' => 'en'
                            ]
                        ]
                    ]
                ];

                $response = Http::withHeaders([
                    'Authorization' => "App {$account->infobip_api_key}",
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json'
                ])->post(config('services.whatsapp.infobip.api_url') . '/message/template', $testPayload);

                if ($response->successful()) {
                    $account->update([
                        'is_verified' => true,
                        'last_verified_at' => now()
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Infobip WhatsApp account connection test successful!',
                        'account_info' => $response->json()
                    ]);
                } else {
                    return response()->json([
                        'error' => 'Connection test failed: ' . $response->body()
                    ], 400);
                }
            } else {
                return response()->json([
                    'error' => 'Unknown provider type'
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to test WhatsApp account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify Facebook WhatsApp Business API credentials
     */
    private function verifyFacebookCredentials($accessToken, $phoneNumberId, $businessAccountId)
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
                'message' => 'Facebook WhatsApp credentials verified successfully'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Verify Infobip WhatsApp API credentials
     */
    private function verifyInfobipCredentials($apiKey, $senderNumber)
    {
        try {
            // Test API key by sending a test template message
            $apiUrl = config('services.whatsapp.infobip.api_url');
            $testPayload = [
                'messages' => [
                    [
                        'from' => $senderNumber,
                        'to' => '639260049848', // Test number
                        'messageId' => 'test_' . uniqid(),
                        'content' => [
                            'templateName' => 'test_whatsapp_template_en',
                            'templateData' => [
                                'body' => [
                                    'placeholders' => ['Test']
                                ]
                            ],
                            'language' => 'en'
                        ]
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => "App {$apiKey}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->post($apiUrl . '/message/template', $testPayload);

            if ($response->successful()) {
                // Get available templates
                $templatesResponse = Http::withHeaders([
                    'Authorization' => "App {$apiKey}",
                    'Accept' => 'application/json'
                ])->get($apiUrl . '/template');

                $templates = [];
                if ($templatesResponse->successful()) {
                    $templatesData = $templatesResponse->json();
                    $templates = $templatesData['templates'] ?? [];
                }

                return [
                    'success' => true,
                    'phone_number' => $senderNumber,
                    'display_name' => 'Infobip WhatsApp Account',
                    'templates' => $templates,
                    'message' => 'Infobip WhatsApp credentials verified successfully'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Invalid Infobip API key or sender number'
                ];
            }

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create a new WhatsApp template
     */
    public function createTemplate(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer|exists:whats_app_accounts,id',
            'template' => 'required|array',
            'template.name' => 'required|string|max:255',
            'template.language' => 'required|string|max:10',
            'template.category' => 'required|string|in:UTILITY,MARKETING,AUTHENTICATION',
            'template.components' => 'required|array',
        ]);

        $account = WhatsAppAccount::where('id', $request->account_id)
            ->where('client_identifier', auth()->user()->identifier)
            ->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp account not found'
            ], 404);
        }

        if (!$account->isInfobip()) {
            return response()->json([
                'success' => false,
                'message' => 'Template creation is only available for Infobip accounts'
            ], 400);
        }

        try {
            $template = $request->template;
            
            // For now, we'll store the template locally in the database
            // In a real implementation, you would also create it via Infobip API
            $availableTemplates = $account->available_templates ?? [];
            
            // Check if template name already exists
            $existingTemplate = collect($availableTemplates)->firstWhere('name', $template['name']);
            if ($existingTemplate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Template name already exists'
                ], 400);
            }

            // Add template to the list
            $availableTemplates[] = $template;
            
            // Update the account with the new template
            $account->update([
                'available_templates' => $availableTemplates
            ]);

            Log::info('WhatsApp template created', [
                'account_id' => $account->id,
                'template_name' => $template['name'],
                'client_identifier' => auth()->user()->identifier
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Template created successfully',
                'template' => $template
            ]);

        } catch (\Exception $e) {
            Log::error('Template creation failed', [
                'error' => $e->getMessage(),
                'account_id' => $request->account_id,
                'template' => $request->template
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a WhatsApp template
     */
    public function deleteTemplate(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer|exists:whats_app_accounts,id',
            'template_name' => 'required|string|max:255',
        ]);

        $account = WhatsAppAccount::where('id', $request->account_id)
            ->where('client_identifier', auth()->user()->identifier)
            ->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp account not found'
            ], 404);
        }

        if (!$account->isInfobip()) {
            return response()->json([
                'success' => false,
                'message' => 'Template deletion is only available for Infobip accounts'
            ], 400);
        }

        try {
            $availableTemplates = $account->available_templates ?? [];
            
            // Remove the template from the list
            $availableTemplates = collect($availableTemplates)->reject(function ($template) use ($request) {
                return $template['name'] === $request->template_name;
            })->values()->toArray();

            // Update the account
            $account->update([
                'available_templates' => $availableTemplates
            ]);

            Log::info('WhatsApp template deleted', [
                'account_id' => $account->id,
                'template_name' => $request->template_name,
                'client_identifier' => auth()->user()->identifier
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Template deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Template deletion failed', [
                'error' => $e->getMessage(),
                'account_id' => $request->account_id,
                'template_name' => $request->template_name
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete template: ' . $e->getMessage()
            ], 500);
        }
    }
}
