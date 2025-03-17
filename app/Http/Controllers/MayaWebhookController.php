<?php

namespace App\Http\Controllers;

use App\Models\UserSubscription;
use App\Services\MayaPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MayaWebhookController extends Controller
{
    protected $apiUrl, $apiToken;
    protected $mayaPaymentService;

    public function __construct(MayaPaymentService $mayaPaymentService)
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
        $this->mayaPaymentService = $mayaPaymentService;
    }

    /**
     * Handle webhook notifications from Maya.
     */
    public function handleWebhook(Request $request)
    {
        // Validate the webhook signature (if Maya provides one)
        // This would be a security measure to ensure the webhook is from Maya
        
        // Log the webhook data for debugging
        Log::info('Maya webhook received', [
            'data' => $request->all(),
        ]);
        
        $data = $request->all();
        
        // Check if this is a payment notification
        if (!isset($data['id']) || !isset($data['status'])) {
            return response()->json(['message' => 'Invalid webhook data'], 400);
        }
        
        // Find the subscription by Maya checkout ID
        $subscription = UserSubscription::where('maya_checkout_id', $data['id'])
            ->first();
        
        if (!$subscription) {
            Log::warning('Maya webhook: Subscription not found', [
                'checkout_id' => $data['id'],
            ]);
            return response()->json(['message' => 'Subscription not found'], 404);
        }
        
        // Process based on payment status
        switch ($data['status']) {
            case 'PAYMENT_SUCCESS':
                return $this->handlePaymentSuccess($subscription, $data);
                
            case 'PAYMENT_FAILED':
            case 'PAYMENT_EXPIRED':
                return $this->handlePaymentFailure($subscription);
                
            case 'SUBSCRIPTION_CREATED':
                return $this->handleSubscriptionCreated($subscription, $data);
                
            case 'SUBSCRIPTION_CHARGED':
                return $this->handleSubscriptionCharged($subscription, $data);
                
            case 'SUBSCRIPTION_CANCELLED':
                return $this->handleSubscriptionCancelled($subscription, $data);
                
            case 'SUBSCRIPTION_FAILED':
                return $this->handleSubscriptionFailed($subscription, $data);
                
            default:
                Log::info('Maya webhook: Unhandled payment status', [
                    'status' => $data['status'],
                    'subscription_id' => $subscription->id,
                ]);
                return response()->json(['message' => 'Unhandled payment status'], 200);
        }
    }
    
    /**
     * Handle successful payment.
     */
    private function handlePaymentSuccess(UserSubscription $subscription, array $data)
    {
        // Only process if the subscription is pending
        if ($subscription->status !== UserSubscription::STATUS_PENDING) {
            return response()->json(['message' => 'Subscription already processed'], 200);
        }
        
        // Check if user already has an active subscription
        $activeSubscription = UserSubscription::where('user_identifier', $subscription->user_identifier)
            ->where('status', UserSubscription::STATUS_ACTIVE)
            ->where('end_date', '>', now())
            ->where('id', '!=', $subscription->id)
            ->first();
        
        if ($activeSubscription) {
            // Cancel the current subscription
            $activeSubscription->cancel('Upgraded to a new plan');
        }
        
        // Update subscription to active
        $subscription->status = UserSubscription::STATUS_ACTIVE;
        
        // Verify the payment to get the payment token ID
        $paymentResult = $this->mayaPaymentService->verifyPayment($subscription->maya_checkout_id);
        
        if ($paymentResult['success'] && !empty($paymentResult['payment_token_id'])) {
            // Store the payment token ID
            $subscription->maya_payment_token_id = $paymentResult['payment_token_id'];
            
            // If auto-renew is enabled, create a recurring subscription with Maya
            if ($subscription->auto_renew) {
                $this->createRecurringSubscription($subscription);
            }
        }
        
        $subscription->save();
        
        // Add credits to user's account based on the plan
        try {
            Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/credits/add", [
                    'client_identifier' => $subscription->user_identifier,
                    'amount' => $subscription->plan->credits_per_month,
                    'source' => 'subscription',
                    'reference_id' => $subscription->identifier,
                ]);
        } catch (\Exception $e) {
            Log::error('Failed to add subscription credits via webhook', [
                'error' => $e->getMessage(),
                'subscription_id' => $subscription->id,
            ]);
        }
        
        return response()->json(['message' => 'Payment success processed'], 200);
    }
    
    /**
     * Create a recurring subscription with Maya.
     */
    private function createRecurringSubscription(UserSubscription $subscription)
    {
        try {
            // Only proceed if we have a payment token ID
            if (empty($subscription->maya_payment_token_id)) {
                Log::error('Cannot create recurring subscription: Missing payment token ID', [
                    'subscription_id' => $subscription->id,
                ]);
                return;
            }
            
            // Prepare subscription data
            $subscriptionData = [
                'plan_name' => $subscription->plan->name,
                'plan_description' => $subscription->plan->description,
                'plan_duration_in_days' => $subscription->plan->duration_in_days,
                'amount' => $subscription->amount_paid,
                'reference_number' => 'RECUR-' . $subscription->payment_transaction_id,
                'user_identifier' => $subscription->user_identifier,
                'plan_id' => $subscription->subscription_plan_id,
                'subscription_identifier' => $subscription->identifier,
            ];
            
            // Create the recurring subscription
            $result = $this->mayaPaymentService->createRecurringSubscription(
                $subscription->maya_payment_token_id,
                $subscriptionData
            );
            
            if ($result['success']) {
                // Update the subscription with Maya subscription details
                $subscription->maya_subscription_id = $result['subscription_id'];
                $subscription->next_billing_date = $result['next_billing_date'];
                $subscription->billing_cycle = $this->mayaPaymentService->calculateBillingCycle($subscription->plan->duration_in_days);
                $subscription->save();
                
                Log::info('Recurring subscription created successfully', [
                    'subscription_id' => $subscription->id,
                    'maya_subscription_id' => $result['subscription_id'],
                ]);
            } else {
                Log::error('Failed to create recurring subscription', [
                    'subscription_id' => $subscription->id,
                    'error' => $result['message'],
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception while creating recurring subscription', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
    
    /**
     * Handle subscription created event.
     */
    private function handleSubscriptionCreated(UserSubscription $subscription, array $data)
    {
        Log::info('Maya subscription created', [
            'subscription_id' => $subscription->id,
            'maya_subscription_id' => $data['subscriptionId'] ?? null,
        ]);
        
        // Update the subscription with Maya subscription details
        if (!empty($data['subscriptionId'])) {
            $subscription->maya_subscription_id = $data['subscriptionId'];
            $subscription->save();
        }
        
        return response()->json(['message' => 'Subscription created event processed'], 200);
    }
    
    /**
     * Handle subscription charged event.
     */
    private function handleSubscriptionCharged(UserSubscription $subscription, array $data)
    {
        Log::info('Maya subscription charged', [
            'subscription_id' => $subscription->id,
            'maya_subscription_id' => $data['subscriptionId'] ?? null,
            'amount' => $data['amount'] ?? null,
        ]);
        
        // Update the next billing date if provided
        if (!empty($data['nextBillingDate'])) {
            $subscription->next_billing_date = $data['nextBillingDate'];
            $subscription->save();
        }
        
        // Extend the subscription end date based on the plan duration
        $subscription->end_date = now()->addDays($subscription->plan->duration_in_days);
        $subscription->save();
        
        // Add credits to user's account based on the plan
        try {
            Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/credits/add", [
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
        
        return response()->json(['message' => 'Subscription charged event processed'], 200);
    }
    
    /**
     * Handle subscription cancelled event.
     */
    private function handleSubscriptionCancelled(UserSubscription $subscription, array $data)
    {
        Log::info('Maya subscription cancelled', [
            'subscription_id' => $subscription->id,
            'maya_subscription_id' => $data['subscriptionId'] ?? null,
        ]);
        
        // Update the subscription status
        $subscription->auto_renew = false;
        $subscription->save();
        
        return response()->json(['message' => 'Subscription cancelled event processed'], 200);
    }
    
    /**
     * Handle subscription failed event.
     */
    private function handleSubscriptionFailed(UserSubscription $subscription, array $data)
    {
        Log::info('Maya subscription payment failed', [
            'subscription_id' => $subscription->id,
            'maya_subscription_id' => $data['subscriptionId'] ?? null,
            'reason' => $data['reason'] ?? 'Unknown reason',
        ]);
        
        // We don't change the subscription status, as it's still active until the end date
        // But we should notify the user about the failed payment
        
        return response()->json(['message' => 'Subscription failed event processed'], 200);
    }
    
    /**
     * Handle failed payment.
     */
    private function handlePaymentFailure(UserSubscription $subscription)
    {
        // Only process if the subscription is pending
        if ($subscription->status !== UserSubscription::STATUS_PENDING) {
            return response()->json(['message' => 'Subscription already processed'], 200);
        }
        
        // Update subscription to failed
        $subscription->status = UserSubscription::STATUS_FAILED;
        $subscription->save();
        
        return response()->json(['message' => 'Payment failure processed'], 200);
    }
}
