<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Services\MayaPaymentService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SubscriptionController extends Controller
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
     * Display the subscription plans page.
     */
    public function index()
    {
        $clientIdentifier = auth()->user()->identifier;
        
        // Get active subscription if exists
        $activeSubscription = UserSubscription::where('user_identifier', $clientIdentifier)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->with('plan')
            ->first();
        
        // Get all active subscription plans
        $plans = SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get();
        
        // Get payment methods (reusing from CreditsController)
        $paymentMethods = [
            [
                'id' => 'credit_card',
                'name' => 'Credit Card',
                'description' => 'Secure online payment via credit card',
            ],
        ];
        
        // Get subscription history
        $subscriptionHistory = UserSubscription::where('user_identifier', $clientIdentifier)
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('Subscriptions/Index', [
            'plans' => $plans,
            'activeSubscription' => $activeSubscription,
            'paymentMethods' => $paymentMethods,
            'subscriptionHistory' => $subscriptionHistory,
        ]);
    }
    
    /**
     * Initiate subscription payment process.
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'payment_method' => 'required|string',
            'auto_renew' => 'boolean',
        ]);
        
        $user = auth()->user();
        $clientIdentifier = $user->identifier;
        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);
        
        // Generate a unique reference number
        $referenceNumber = $this->mayaPaymentService->generateReferenceNumber();
        
        try {
            // Prepare checkout data
            $checkoutData = [
                'amount' => $plan->price,
                'reference_number' => $referenceNumber,
                'plan_name' => $plan->name,
                'plan_slug' => $plan->slug,
                'plan_description' => $plan->description,
                'plan_id' => $plan->id,
                'user_identifier' => $clientIdentifier,
                'user_name' => $user->name,
                'user_lastname' => $user->lastname ?? '',
                'user_email' => $user->email,
                'user_phone' => $user->phone ?? '',
                'auto_renew' => $validated['auto_renew'] ?? false,
            ];
            
            // Create checkout or subscription based on auto_renew setting
            if ($validated['auto_renew'] ?? false) {
                // Create a subscription (this will still create a checkout first)
                $checkoutResult = $this->mayaPaymentService->createSubscription($checkoutData);
            } else {
                // Create a one-time checkout
                $checkoutResult = $this->mayaPaymentService->createCheckout($checkoutData);
            }
            
            if (!$checkoutResult['success']) {
                return redirect()->back()->with('error', $checkoutResult['message']);
            }
            
            // Create a pending subscription
            $subscription = new UserSubscription([
                'user_identifier' => $clientIdentifier,
                'subscription_plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_in_days),
                'status' => 'pending', // Set as pending until payment is confirmed
                'payment_method' => $validated['payment_method'],
                'payment_transaction_id' => $referenceNumber,
                'amount_paid' => $plan->price,
                'auto_renew' => $validated['auto_renew'] ?? false,
                'maya_checkout_id' => $checkoutResult['checkout_id'],
            ]);
            
            $subscription->save();
            
            // Redirect to Maya checkout page
            try {
                if (empty($checkoutResult['checkout_url'])) {
                    Log::error('Maya checkout URL is empty', [
                        'checkout_result' => $checkoutResult,
                        'user_id' => $user->id,
                        'plan_id' => $plan->id
                    ]);
                    return redirect()->back()->with('error', 'Payment gateway error: Invalid checkout URL. Please try again later.');
                }
                
                // Log the redirect attempt
                Log::info('Redirecting to Maya checkout', [
                    'checkout_url' => $checkoutResult['checkout_url'],
                    'reference' => $referenceNumber,
                    'is_subscription' => $checkoutResult['is_subscription'] ?? false,
                ]);
                
                return redirect($checkoutResult['checkout_url']);
            } catch (\Exception $e) {
                Log::error('Failed to redirect to Maya checkout: ' . $e->getMessage(), [
                    'checkout_result' => $checkoutResult,
                    'exception' => $e
                ]);
                
                // Update subscription status to failed
                $subscription->status = 'failed';
                $subscription->save();
                
                return redirect()->back()->with('error', 'Failed to connect to payment gateway. Please try again later.');
            }
        } catch (\Exception $e) {
            Log::error('Subscription process failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'exception' => $e
            ]);
            
            return redirect()->back()->with('error', 'An error occurred while processing your subscription. Please try again later.');
        }
    }
    
    /**
     * Handle successful payment from Maya.
     */
    public function paymentSuccess(Request $request)
    {
        $reference = $request->query('reference');
        $checkoutId = $request->query('checkoutId');
        
        if (!$reference) {
            return Inertia::render('Subscriptions/PaymentStatus', [
                'status' => 'failure',
                'message' => 'Invalid payment reference. Please contact support if you believe this is an error.',
            ]);
        }
        
        // Find the pending subscription
        $subscription = UserSubscription::where('payment_transaction_id', $reference)
            ->where('status', 'pending')
            ->with('plan')
            ->first();
        
        if (!$subscription) {
            return Inertia::render('Subscriptions/PaymentStatus', [
                'status' => 'failure',
                'message' => 'Subscription not found. Please contact support if you believe this is an error.',
            ]);
        }
        
        // If checkoutId is provided, verify payment with Maya
        if ($checkoutId) {
            $paymentResult = $this->mayaPaymentService->verifyPayment($checkoutId);
            
            if (!$paymentResult['success'] || !$paymentResult['is_paid']) {
                Log::warning('Payment verification failed for reference: ' . $reference, [
                    'checkout_id' => $checkoutId,
                    'result' => $paymentResult
                ]);
                
                // Continue anyway since we're on the success URL
                Log::info('Proceeding with subscription activation despite verification failure');
            }
        } else {
            // Log that we're proceeding without verification
            Log::info('Processing payment success without checkout ID for reference: ' . $reference);
        }
        
        // Check if user already has an active subscription
        $activeSubscription = UserSubscription::where('user_identifier', $subscription->user_identifier)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->where('id', '!=', $subscription->id)
            ->first();
        
        if ($activeSubscription) {
            // Cancel the current subscription
            $activeSubscription->cancel('Upgraded to a new plan');
        }
        
        // Update subscription to active
        $subscription->status = 'active';
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
            Log::error('Failed to add subscription credits: ' . $e->getMessage());
        }
        
        return Inertia::render('Subscriptions/PaymentStatus', [
            'status' => 'success',
            'message' => 'Your payment was successful and your subscription is now active.',
            'subscription' => $subscription,
        ]);
    }
    
    /**
     * Handle failed payment from Maya.
     */
    public function paymentFailure(Request $request)
    {
        $reference = $request->query('reference');
        
        if ($reference) {
            // Find the pending subscription
            $subscription = UserSubscription::where('payment_transaction_id', $reference)
                ->where('status', 'pending')
                ->first();
            
            if ($subscription) {
                // Update subscription to failed
                $subscription->status = 'failed';
                $subscription->save();
            }
        }
        
        return Inertia::render('Subscriptions/PaymentStatus', [
            'status' => 'failure',
            'message' => 'Your payment was not successful. Please try again or contact support if the issue persists.',
        ]);
    }
    
    /**
     * Handle cancelled payment from Maya.
     */
    public function paymentCancel(Request $request)
    {
        $reference = $request->query('reference');
        
        if ($reference) {
            // Find the pending subscription
            $subscription = UserSubscription::where('payment_transaction_id', $reference)
                ->where('status', 'pending')
                ->first();
            
            if ($subscription) {
                // Update subscription to cancelled
                $subscription->status = 'cancelled';
                $subscription->save();
            }
        }
        
        return Inertia::render('Subscriptions/PaymentStatus', [
            'status' => 'cancelled',
            'message' => 'You cancelled the payment process. You can try again whenever you\'re ready.',
        ]);
    }
    
    /**
     * Cancel a subscription.
     */
    public function cancel(Request $request, $identifier)
    {
        $validated = $request->validate([
            'cancellation_reason' => 'nullable|string|max:255',
        ]);
        
        $clientIdentifier = auth()->user()->identifier;
        
        $subscription = UserSubscription::where('identifier', $identifier)
            ->where('user_identifier', $clientIdentifier)
            ->where('status', 'active')
            ->firstOrFail();
        
        // If this subscription has a Maya subscription ID, cancel it with Maya
        if ($subscription->hasMayaSubscription()) {
            $result = $this->mayaPaymentService->cancelSubscription($subscription->maya_subscription_id);
            
            if (!$result['success']) {
                Log::error('Failed to cancel Maya subscription', [
                    'subscription_id' => $subscription->id,
                    'maya_subscription_id' => $subscription->maya_subscription_id,
                    'error' => $result['message'],
                ]);
                
                // Continue with local cancellation even if Maya cancellation fails
                Log::info('Proceeding with local subscription cancellation despite Maya API failure');
            }
        }
        
        $subscription->cancel($validated['cancellation_reason'] ?? null);
        
        return redirect()->route('subscriptions.index')->with('success', 'Subscription cancelled successfully');
    }
    
    /**
     * Get user's active subscription.
     */
    public function getActiveSubscription($userIdentifier)
    {
        $subscription = UserSubscription::where('user_identifier', $userIdentifier)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->with('plan')
            ->first();
        
        if (!$subscription) {
            return response()->json(['active' => false]);
        }
        
        return response()->json([
            'active' => true,
            'subscription' => $subscription,
        ]);
    }
}
