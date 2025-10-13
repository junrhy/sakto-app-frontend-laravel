<?php

namespace App\Services;

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
            
            // Add event details if provided (for event registrations)
            if (isset($data['event_id'])) {
                $customData['event_id'] = (string) $data['event_id'];
                $customData['registrant_count'] = (string) ($data['registrant_count'] ?? 1);
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

}

