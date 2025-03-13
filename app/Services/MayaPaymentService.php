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
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($this->publicKey . ':')
            ])->post($this->baseUrl . '/checkout/v1/checkouts', [
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

            if ($response->successful()) {
                return [
                    'success' => true,
                    'checkout_id' => $response->json('checkoutId'),
                    'checkout_url' => $response->json('redirectUrl'),
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