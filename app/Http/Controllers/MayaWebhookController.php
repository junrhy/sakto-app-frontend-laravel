<?php

namespace App\Http\Controllers;

use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MayaWebhookController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
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
                return $this->handlePaymentSuccess($subscription);
                
            case 'PAYMENT_FAILED':
            case 'PAYMENT_EXPIRED':
                return $this->handlePaymentFailure($subscription);
                
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
    private function handlePaymentSuccess(UserSubscription $subscription)
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
