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
     * Create a subscription with Maya
     * 
     * @param array $data
     * @return array
     */
    public function createSubscription(array $data)
    {
        try {
            // First, we need to create a payment token using the initial checkout
            $checkoutResult = $this->createCheckout($data);
            
            if (!$checkoutResult['success']) {
                return $checkoutResult;
            }
            
            // Store the checkout ID for later use
            $checkoutId = $checkoutResult['checkout_id'];
            
            // Return the checkout URL for the customer to complete the initial payment
            return [
                'success' => true,
                'checkout_id' => $checkoutId,
                'checkout_url' => $checkoutResult['checkout_url'],
                'reference_number' => $data['reference_number'],
                'is_subscription' => true,
            ];
            
            // Note: After the customer completes the payment, we'll receive a webhook notification
            // At that point, we'll create the actual subscription using the payment method token
            // This is handled in the webhook controller
        } catch (\Exception $e) {
            Log::error('Maya subscription creation exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Subscription creation error: ' . $e->getMessage(),
            ];
        }
    }
    
    /**
     * Create a recurring subscription after successful initial payment
     * 
     * @param string $paymentTokenId Payment token ID from the initial payment
     * @param array $data Subscription data
     * @return array
     */
    public function createRecurringSubscription(string $paymentTokenId, array $data)
    {
        try {
            // Calculate the billing cycle based on the plan duration
            $billingCycle = $this->calculateBillingCycle($data['plan_duration_in_days']);
            
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($this->secretKey . ':')
            ])->post($this->baseUrl . '/payments/v1/subscriptions', [
                'paymentTokenId' => $paymentTokenId,
                'name' => $data['plan_name'] . ' Subscription',
                'description' => $data['plan_description'] ?? 'Recurring subscription for ' . $data['plan_name'],
                'amount' => [
                    'value' => $data['amount'],
                    'currency' => 'PHP',
                ],
                'requestReferenceNumber' => $data['reference_number'],
                'billingCycle' => $billingCycle,
                'metadata' => [
                    'user_identifier' => $data['user_identifier'],
                    'plan_id' => $data['plan_id'],
                    'subscription_identifier' => $data['subscription_identifier'],
                ],
            ]);
            
            if ($response->successful()) {
                $subscriptionId = $response->json('id');
                
                if (empty($subscriptionId)) {
                    Log::error('Maya subscription response missing ID', [
                        'response' => $response->json(),
                    ]);
                    
                    return [
                        'success' => false,
                        'message' => 'Invalid response from payment gateway',
                    ];
                }
                
                return [
                    'success' => true,
                    'subscription_id' => $subscriptionId,
                    'status' => $response->json('status'),
                    'next_billing_date' => $response->json('nextBillingDate'),
                ];
            }
            
            Log::error('Maya subscription creation failed', [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);
            
            return [
                'success' => false,
                'message' => 'Failed to create subscription: ' . ($response->json('message') ?? 'Unknown error'),
            ];
        } catch (\Exception $e) {
            Log::error('Maya recurring subscription exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return [
                'success' => false,
                'message' => 'Subscription creation error: ' . $e->getMessage(),
            ];
        }
    }
    
    /**
     * Calculate the billing cycle based on plan duration
     * 
     * @param int $durationInDays
     * @return string
     */
    private function calculateBillingCycle(int $durationInDays)
    {
        // Maya supports DAILY, WEEKLY, MONTHLY, QUARTERLY, SEMI_ANNUALLY, ANNUALLY
        if ($durationInDays <= 7) {
            return 'WEEKLY';
        } elseif ($durationInDays <= 31) {
            return 'MONTHLY';
        } elseif ($durationInDays <= 92) {
            return 'QUARTERLY';
        } elseif ($durationInDays <= 183) {
            return 'SEMI_ANNUALLY';
        } else {
            return 'ANNUALLY';
        }
    }
    
    /**
     * Cancel a subscription with Maya
     * 
     * @param string $subscriptionId
     * @return array
     */
    public function cancelSubscription(string $subscriptionId)
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($this->secretKey . ':')
            ])->delete($this->baseUrl . '/payments/v1/subscriptions/' . $subscriptionId);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'status' => $response->json('status'),
                ];
            }
            
            Log::error('Maya subscription cancellation failed', [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);
            
            return [
                'success' => false,
                'message' => 'Failed to cancel subscription: ' . ($response->json('message') ?? 'Unknown error'),
            ];
        } catch (\Exception $e) {
            Log::error('Maya subscription cancellation exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return [
                'success' => false,
                'message' => 'Subscription cancellation error: ' . $e->getMessage(),
            ];
        }
    }
    
    /**
     * Get subscription details from Maya
     * 
     * @param string $subscriptionId
     * @return array
     */
    public function getSubscription(string $subscriptionId)
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($this->secretKey . ':')
            ])->get($this->baseUrl . '/payments/v1/subscriptions/' . $subscriptionId);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'subscription' => $response->json(),
                ];
            }
            
            Log::error('Maya subscription retrieval failed', [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);
            
            return [
                'success' => false,
                'message' => 'Failed to retrieve subscription: ' . ($response->json('message') ?? 'Unknown error'),
            ];
        } catch (\Exception $e) {
            Log::error('Maya subscription retrieval exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return [
                'success' => false,
                'message' => 'Subscription retrieval error: ' . $e->getMessage(),
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
                    'payment_token_id' => $response->json('paymentTokenId') ?? null,
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