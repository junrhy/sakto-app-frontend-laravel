<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MayaPaymentService
{
    protected $baseUrl;
    protected $publicKey;
    protected $secretKey;
    protected $successUrl;
    protected $failureUrl;
    protected $cancelUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.maya.base_url');
        $this->publicKey = config('services.maya.public_key');
        $this->secretKey = config('services.maya.secret_key');
        $this->successUrl = config('services.maya.webhook_success_url');
        $this->failureUrl = config('services.maya.webhook_failure_url');
        $this->cancelUrl = config('services.maya.webhook_cancel_url');
    }

    /**
     * Create a checkout payment with Maya
     *
     * @param array $data
     * @return array
     */
    public function createCheckout(array $data)
    {
        try {
            // Add timeout and retry logic
            $maxRetries = 2;
            $attempt = 0;
            $lastException = null;
            
            while ($attempt <= $maxRetries) {
                try {
                    $response = Http::timeout(30) // Set a 30-second timeout
                        ->withHeaders([
                            'Content-Type' => 'application/json',
                            'Authorization' => 'Basic ' . base64_encode($this->publicKey . ':')
                        ])
                        ->post($this->baseUrl . '/checkout/v1/checkouts', [
                            'totalAmount' => [
                                'value' => $data['amount'],
                                'currency' => 'PHP',
                            ],
                            'requestReferenceNumber' => $data['reference_number'],
                            'redirectUrl' => [
                                'success' => $this->successUrl . '?reference=' . $data['reference_number'],
                                'failure' => $this->failureUrl . '?reference=' . $data['reference_number'],
                                'cancel' => $this->cancelUrl . '?reference=' . $data['reference_number'],
                            ],
                            'items' => [
                                [
                                    'name' => $data['plan_name'],
                                    'quantity' => 1,
                                    'code' => $data['plan_slug'],
                                    'description' => $data['plan_description'] ?? 'Subscription plan',
                                    'amount' => [
                                        'value' => $data['amount'],
                                        'currency' => 'PHP',
                                    ],
                                    'totalAmount' => [
                                        'value' => $data['amount'],
                                        'currency' => 'PHP',
                                    ],
                                ]
                            ],
                            'buyer' => [
                                'firstName' => $data['user_name'] ?? 'Valued',
                                'lastName' => $data['user_lastname'] ?? 'Customer',
                                'contact' => [
                                    'email' => $data['user_email'] ?? '',
                                    'phone' => $data['user_phone'] ?? '',
                                ],
                            ],
                            'metadata' => [
                                'user_identifier' => $data['user_identifier'],
                                'plan_id' => $data['plan_id'],
                                'auto_renew' => $data['auto_renew'] ?? false,
                            ],
                        ]);
                    
                    // If we get here, the request was successful
                    break;
                } catch (\Exception $e) {
                    $lastException = $e;
                    $attempt++;
                    
                    if ($attempt <= $maxRetries) {
                        // Log retry attempt
                        Log::warning('Maya checkout attempt ' . $attempt . ' failed, retrying...', [
                            'error' => $e->getMessage(),
                        ]);
                        
                        // Wait before retrying (exponential backoff)
                        sleep(pow(2, $attempt - 1));
                    }
                }
            }
            
            // If we've exhausted all retries and still have an exception
            if ($attempt > $maxRetries && $lastException) {
                throw $lastException;
            }

            if ($response->successful()) {
                $checkoutId = $response->json('checkoutId');
                $redirectUrl = $response->json('redirectUrl');
                
                // Validate the response data
                if (empty($checkoutId) || empty($redirectUrl)) {
                    Log::error('Maya checkout response missing required data', [
                        'response' => $response->json(),
                    ]);
                    
                    return [
                        'success' => false,
                        'message' => 'Invalid response from payment gateway',
                    ];
                }
                
                return [
                    'success' => true,
                    'checkout_id' => $checkoutId,
                    'checkout_url' => $redirectUrl,
                    'reference_number' => $data['reference_number'],
                ];
            }

            Log::error('Maya checkout creation failed', [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create checkout: ' . ($response->json('message') ?? 'Unknown error'),
            ];
        } catch (\Exception $e) {
            Log::error('Maya checkout exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Payment gateway error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Verify a payment with Maya
     *
     * @param string $checkoutId
     * @return array
     */
    public function verifyPayment(string $checkoutId)
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($this->secretKey . ':')
            ])->get($this->baseUrl . '/checkout/v1/checkouts/' . $checkoutId);

            if ($response->successful()) {
                $paymentStatus = $response->json('paymentStatus');
                
                return [
                    'success' => true,
                    'status' => $paymentStatus,
                    'is_paid' => $paymentStatus === 'PAYMENT_SUCCESS',
                    'reference_number' => $response->json('requestReferenceNumber'),
                    'metadata' => $response->json('metadata') ?? [],
                ];
            }

            Log::error('Maya payment verification failed', [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to verify payment: ' . ($response->json('message') ?? 'Unknown error'),
            ];
        } catch (\Exception $e) {
            Log::error('Maya payment verification exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Payment verification error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Generate a unique reference number
     *
     * @return string
     */
    public function generateReferenceNumber()
    {
        return 'SUB-' . strtoupper(Str::random(8)) . '-' . time();
    }
} 