<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use LemonSqueezy\Laravel\Checkout;

class LemonSqueezyPaymentService
{
    /**
     * Create a checkout session for one-time payment
     *
     * @param \App\Models\User $user
     * @param array $data
     * @return array
     */
    public function createCheckout($user, array $data)
    {
        try {
            $referenceNumber = $data['reference_number'];
            
            // Use the billable user model to create checkout
            // Cast all custom data to strings as Lemon Squeezy requires string values
            $customData = [
                'user_identifier' => (string) $data['user_identifier'],
                'reference_number' => (string) $referenceNumber,
                'auto_renew' => (string) ($data['auto_renew'] ? 'true' : 'false'),
            ];
            
            // Add plan_id if it exists (for subscriptions)
            if (isset($data['plan_id']) && $data['plan_id']) {
                $customData['plan_id'] = (string) $data['plan_id'];
            }
            
            // Add package details if provided (for credit purchases)
            if (isset($data['package_credit'])) {
                $customData['package_credit'] = (string) $data['package_credit'];
                $customData['package_amount'] = (string) $data['package_amount'];
            }
            
            $checkout = $user->checkout($data['variant_id'], [
                'name' => $data['user_name'],
                'email' => $data['user_email'],
            ], $customData)
                ->withProductName($data['plan_name'] ?? 'Subscription Plan')
                ->withDescription($data['plan_description'] ?? '');
            
            // Use custom redirect URL if provided, otherwise use default subscription URL
            $redirectUrl = $data['success_url'] ?? (route('subscriptions.lemonsqueezy.success') . '?reference=' . $referenceNumber);
            
            $checkoutUrl = $checkout->redirectTo($redirectUrl)->url();
            
            return [
                'success' => true,
                'checkout_url' => $checkoutUrl,
                'reference_number' => $referenceNumber,
            ];
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy checkout exception', [
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
     * Create a subscription with Lemon Squeezy
     *
     * @param \App\Models\User $user
     * @param array $data
     * @return array
     */
    public function createSubscription($user, array $data)
    {
        try {
            $referenceNumber = $data['reference_number'];
            
            // Use the billable user model to create subscription checkout
            // Cast all custom data to strings as Lemon Squeezy requires string values
            $checkoutUrl = $user->checkout($data['variant_id'], [
                'name' => $data['user_name'],
                'email' => $data['user_email'],
            ], [
                'user_identifier' => (string) $data['user_identifier'],
                'plan_id' => (string) $data['plan_id'],
                'reference_number' => (string) $referenceNumber,
                'auto_renew' => (string) 'true',
            ])
                ->withProductName($data['plan_name'] ?? 'Subscription Plan')
                ->withDescription($data['plan_description'] ?? '')
                ->redirectTo(route('subscriptions.lemonsqueezy.success') . '?reference=' . $referenceNumber)
                ->url();
            
            return [
                'success' => true,
                'checkout_url' => $checkoutUrl,
                'reference_number' => $referenceNumber,
                'is_subscription' => true,
            ];
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy subscription exception', [
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
     * Cancel a subscription with Lemon Squeezy
     *
     * @param string $subscriptionId
     * @return array
     */
    public function cancelSubscription(string $subscriptionId)
    {
        try {
            // Use Lemon Squeezy API client to cancel subscription
            $client = new \LemonSqueezy\Laravel\LemonSqueezy();
            $response = $client->subscriptions()->cancel($subscriptionId);
            
            if (isset($response['data']['attributes']['status'])) {
                return [
                    'success' => true,
                    'status' => $response['data']['attributes']['status'],
                ];
            }
            
            Log::error('Lemon Squeezy subscription cancellation failed', [
                'subscription_id' => $subscriptionId,
                'response' => $response,
            ]);
            
            return [
                'success' => false,
                'message' => 'Failed to cancel subscription',
            ];
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy subscription cancellation exception', [
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
     * Resume a paused subscription
     *
     * @param string $subscriptionId
     * @return array
     */
    public function resumeSubscription(string $subscriptionId)
    {
        try {
            $client = new \LemonSqueezy\Laravel\LemonSqueezy();
            $response = $client->subscriptions()->resume($subscriptionId);
            
            if (isset($response['data']['attributes']['status'])) {
                return [
                    'success' => true,
                    'status' => $response['data']['attributes']['status'],
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Failed to resume subscription',
            ];
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy subscription resume exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return [
                'success' => false,
                'message' => 'Subscription resume error: ' . $e->getMessage(),
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
        return 'LS-SUB-' . strtoupper(Str::random(8)) . '-' . time();
    }

    // ========================================
    // Product Management Methods (for Events)
    // ========================================

    /**
     * Create a product in Lemon Squeezy for an event
     * 
     * @param array $data
     * @return array
     */
    public function createEventProduct(array $data)
    {
        try {
            $apiKey = config('services.lemon_squeezy.api_key');
            $storeId = config('services.lemon_squeezy.store_id');
            $baseUrl = 'https://api.lemonsqueezy.com/v1';

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Accept' => 'application/vnd.api+json',
                'Content-Type' => 'application/vnd.api+json',
            ])->post("{$baseUrl}/products", [
                'data' => [
                    'type' => 'products',
                    'attributes' => [
                        'store_id' => (int) $storeId,
                        'name' => $data['name'],
                        'description' => $data['description'] ?? '',
                        'status' => $data['status'] ?? 'draft',
                    ],
                ],
            ]);

            if (!$response->successful()) {
                Log::error('Lemon Squeezy event product creation failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                
                return [
                    'success' => false,
                    'message' => 'Failed to create event product in Lemon Squeezy',
                    'error' => $response->body(),
                ];
            }

            $productData = $response->json();
            $productId = $productData['data']['id'] ?? null;

            // Create a variant for the product if price is provided
            $variantId = null;
            if (isset($data['price']) && $productId) {
                $variantResult = $this->createEventVariant($productId, [
                    'name' => $data['name'],
                    'price' => $data['price'],
                ]);
                
                if ($variantResult['success']) {
                    $variantId = $variantResult['variant_id'];
                }
            }

            return [
                'success' => true,
                'product_id' => $productId,
                'variant_id' => $variantId,
                'data' => $productData,
            ];
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy event product creation exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Exception creating event product: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Create a variant for an event product
     * 
     * @param string $productId
     * @param array $data
     * @return array
     */
    public function createEventVariant(string $productId, array $data)
    {
        try {
            $apiKey = config('services.lemon_squeezy.api_key');
            $baseUrl = 'https://api.lemonsqueezy.com/v1';

            // Convert price to cents for Lemon Squeezy
            $priceInCents = (int) ($data['price'] * 100);

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Accept' => 'application/vnd.api+json',
                'Content-Type' => 'application/vnd.api+json',
            ])->post("{$baseUrl}/variants", [
                'data' => [
                    'type' => 'variants',
                    'attributes' => [
                        'product_id' => (int) $productId,
                        'name' => $data['name'] ?? 'Event Registration',
                        'price' => $priceInCents,
                    ],
                    'relationships' => [
                        'product' => [
                            'data' => [
                                'type' => 'products',
                                'id' => (string) $productId,
                            ],
                        ],
                    ],
                ],
            ]);

            if (!$response->successful()) {
                Log::error('Lemon Squeezy event variant creation failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                
                return [
                    'success' => false,
                    'message' => 'Failed to create event variant in Lemon Squeezy',
                ];
            }

            $variantData = $response->json();
            
            return [
                'success' => true,
                'variant_id' => $variantData['data']['id'] ?? null,
                'data' => $variantData,
            ];
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy event variant creation exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Exception creating event variant: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update an event product in Lemon Squeezy
     * 
     * @param string $productId
     * @param array $data
     * @return array
     */
    public function updateEventProduct(string $productId, array $data)
    {
        try {
            $apiKey = config('services.lemon_squeezy.api_key');
            $baseUrl = 'https://api.lemonsqueezy.com/v1';

            $attributes = [];
            
            if (isset($data['name'])) {
                $attributes['name'] = $data['name'];
            }
            
            if (isset($data['description'])) {
                $attributes['description'] = $data['description'];
            }
            
            if (isset($data['status'])) {
                $attributes['status'] = $data['status'];
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Accept' => 'application/vnd.api+json',
                'Content-Type' => 'application/vnd.api+json',
            ])->patch("{$baseUrl}/products/{$productId}", [
                'data' => [
                    'type' => 'products',
                    'id' => (string) $productId,
                    'attributes' => $attributes,
                ],
            ]);

            if (!$response->successful()) {
                Log::error('Lemon Squeezy event product update failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                
                return [
                    'success' => false,
                    'message' => 'Failed to update event product in Lemon Squeezy',
                ];
            }

            // Update variant price if provided
            if (isset($data['price']) && isset($data['variant_id'])) {
                $this->updateEventVariant($data['variant_id'], [
                    'price' => $data['price'],
                ]);
            }

            return [
                'success' => true,
                'data' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy event product update exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Exception updating event product: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update an event variant
     * 
     * @param string $variantId
     * @param array $data
     * @return array
     */
    public function updateEventVariant(string $variantId, array $data)
    {
        try {
            $apiKey = config('services.lemon_squeezy.api_key');
            $baseUrl = 'https://api.lemonsqueezy.com/v1';

            $attributes = [];
            
            if (isset($data['name'])) {
                $attributes['name'] = $data['name'];
            }
            
            if (isset($data['price'])) {
                // Convert price to cents for Lemon Squeezy
                $attributes['price'] = (int) ($data['price'] * 100);
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Accept' => 'application/vnd.api+json',
                'Content-Type' => 'application/vnd.api+json',
            ])->patch("{$baseUrl}/variants/{$variantId}", [
                'data' => [
                    'type' => 'variants',
                    'id' => (string) $variantId,
                    'attributes' => $attributes,
                ],
            ]);

            if (!$response->successful()) {
                Log::error('Lemon Squeezy event variant update failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                
                return [
                    'success' => false,
                    'message' => 'Failed to update event variant in Lemon Squeezy',
                ];
            }

            return [
                'success' => true,
                'data' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy event variant update exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Exception updating event variant: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Delete an event product from Lemon Squeezy
     * 
     * @param string $productId
     * @return array
     */
    public function deleteEventProduct(string $productId)
    {
        try {
            $apiKey = config('services.lemon_squeezy.api_key');
            $baseUrl = 'https://api.lemonsqueezy.com/v1';

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Accept' => 'application/vnd.api+json',
            ])->delete("{$baseUrl}/products/{$productId}");

            if (!$response->successful()) {
                Log::error('Lemon Squeezy event product deletion failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                
                return [
                    'success' => false,
                    'message' => 'Failed to delete event product in Lemon Squeezy',
                ];
            }

            return [
                'success' => true,
                'message' => 'Event product deleted successfully',
            ];
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy event product deletion exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Exception deleting event product: ' . $e->getMessage(),
            ];
        }
    }
}

