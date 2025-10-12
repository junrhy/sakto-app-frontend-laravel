<?php

namespace App\Listeners;

use App\Models\UserSubscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use LemonSqueezy\Laravel\Events\OrderCreated;
use LemonSqueezy\Laravel\Events\SubscriptionCreated;
use LemonSqueezy\Laravel\Events\SubscriptionUpdated;
use LemonSqueezy\Laravel\Events\SubscriptionCancelled;
use LemonSqueezy\Laravel\Events\SubscriptionExpired;
use LemonSqueezy\Laravel\Events\SubscriptionPaymentSuccess;
use LemonSqueezy\Laravel\Events\SubscriptionPaymentFailed;

class LemonSqueezyEventListener
{
    /**
     * Handle OrderCreated event.
     */
    public function handleOrderCreated(OrderCreated $event): void
    {
        Log::info('Lemon Squeezy Order Created', [
            'order_id' => $event->payload['data']['id'] ?? null,
            'user_identifier' => $event->payload['meta']['custom_data']['user_identifier'] ?? null,
        ]);
        
        // The order creation is handled by the payment success callback
        // This is just for logging purposes
    }
    
    /**
     * Handle SubscriptionCreated event.
     */
    public function handleSubscriptionCreated(SubscriptionCreated $event): void
    {
        $subscriptionId = $event->payload['data']['id'] ?? null;
        $customData = $event->payload['meta']['custom_data'] ?? [];
        $userIdentifier = $customData['user_identifier'] ?? null;
        $referenceNumber = $customData['reference_number'] ?? null;
        
        Log::info('Lemon Squeezy Subscription Created', [
            'subscription_id' => $subscriptionId,
            'user_identifier' => $userIdentifier,
            'reference_number' => $referenceNumber,
        ]);
        
        if ($referenceNumber) {
            // Find and update the subscription with the Lemon Squeezy subscription ID
            $subscription = UserSubscription::where('payment_transaction_id', $referenceNumber)
                ->first();
            
            if ($subscription) {
                $subscription->lemonsqueezy_subscription_id = $subscriptionId;
                $subscription->save();
                
                Log::info('Updated subscription with Lemon Squeezy subscription ID', [
                    'subscription_id' => $subscription->id,
                    'lemonsqueezy_subscription_id' => $subscriptionId,
                ]);
            }
        }
    }
    
    /**
     * Handle SubscriptionUpdated event.
     */
    public function handleSubscriptionUpdated(SubscriptionUpdated $event): void
    {
        $subscriptionId = $event->payload['data']['id'] ?? null;
        $status = $event->payload['data']['attributes']['status'] ?? null;
        
        Log::info('Lemon Squeezy Subscription Updated', [
            'subscription_id' => $subscriptionId,
            'status' => $status,
        ]);
        
        if ($subscriptionId) {
            $subscription = UserSubscription::where('lemonsqueezy_subscription_id', $subscriptionId)
                ->first();
            
            if ($subscription) {
                // Update subscription status based on Lemon Squeezy status
                if ($status === 'active') {
                    $subscription->status = 'active';
                } elseif ($status === 'cancelled') {
                    $subscription->status = 'cancelled';
                } elseif ($status === 'expired') {
                    $subscription->status = 'expired';
                }
                
                $subscription->save();
            }
        }
    }
    
    /**
     * Handle SubscriptionCancelled event.
     */
    public function handleSubscriptionCancelled(SubscriptionCancelled $event): void
    {
        $subscriptionId = $event->payload['data']['id'] ?? null;
        
        Log::info('Lemon Squeezy Subscription Cancelled', [
            'subscription_id' => $subscriptionId,
        ]);
        
        if ($subscriptionId) {
            $subscription = UserSubscription::where('lemonsqueezy_subscription_id', $subscriptionId)
                ->first();
            
            if ($subscription) {
                $subscription->status = 'cancelled';
                $subscription->cancelled_at = now();
                $subscription->auto_renew = false;
                $subscription->save();
            }
        }
    }
    
    /**
     * Handle SubscriptionExpired event.
     */
    public function handleSubscriptionExpired(SubscriptionExpired $event): void
    {
        $subscriptionId = $event->payload['data']['id'] ?? null;
        
        Log::info('Lemon Squeezy Subscription Expired', [
            'subscription_id' => $subscriptionId,
        ]);
        
        if ($subscriptionId) {
            $subscription = UserSubscription::where('lemonsqueezy_subscription_id', $subscriptionId)
                ->first();
            
            if ($subscription) {
                $subscription->status = 'expired';
                $subscription->save();
            }
        }
    }
    
    /**
     * Handle SubscriptionPaymentSuccess event.
     */
    public function handleSubscriptionPaymentSuccess(SubscriptionPaymentSuccess $event): void
    {
        $subscriptionId = $event->payload['data']['attributes']['subscription_id'] ?? null;
        
        Log::info('Lemon Squeezy Subscription Payment Success', [
            'subscription_id' => $subscriptionId,
        ]);
        
        if ($subscriptionId) {
            $subscription = UserSubscription::where('lemonsqueezy_subscription_id', $subscriptionId)
                ->first();
            
            if ($subscription && $subscription->status === 'active') {
                // Extend the subscription end date based on the plan duration
                $subscription->end_date = now()->addDays($subscription->plan->duration_in_days);
                $subscription->save();
                
                // Add credits to user's account based on the plan
                try {
                    $apiUrl = config('api.url');
                    $apiToken = config('api.token');
                    
                    Http::withToken($apiToken)
                        ->post("{$apiUrl}/credits/add", [
                            'client_identifier' => $subscription->user_identifier,
                            'amount' => $subscription->plan->credits_per_month,
                            'source' => 'subscription_renewal',
                            'reference_id' => $subscription->identifier,
                        ]);
                } catch (\Exception $e) {
                    Log::error('Failed to add subscription renewal credits', [
                        'error' => $e->getMessage(),
                        'subscription_id' => $subscription->id,
                    ]);
                }
            }
        }
    }
    
    /**
     * Handle SubscriptionPaymentFailed event.
     */
    public function handleSubscriptionPaymentFailed(SubscriptionPaymentFailed $event): void
    {
        $subscriptionId = $event->payload['data']['attributes']['subscription_id'] ?? null;
        
        Log::error('Lemon Squeezy Subscription Payment Failed', [
            'subscription_id' => $subscriptionId,
        ]);
        
        // We don't change the subscription status immediately,
        // as it may still be active until the end of the period
        // Lemon Squeezy will send a subscription_expired event when appropriate
    }
}

