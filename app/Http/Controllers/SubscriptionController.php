<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Services\StripePaymentService;
use App\Services\LemonSqueezyPaymentService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    protected $apiUrl, $apiToken;
    protected $stripePaymentService;
    protected $lemonSqueezyPaymentService;

    public function __construct(StripePaymentService $stripePaymentService, LemonSqueezyPaymentService $lemonSqueezyPaymentService)
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
        $this->stripePaymentService = $stripePaymentService;
        $this->lemonSqueezyPaymentService = $lemonSqueezyPaymentService;
    }

    /**
     * Display the subscription plans page.
     */
    public function index()
    {
        $user = auth()->user();
        $clientIdentifier = $user->identifier;
        
        // Get active subscription if exists
        $activeSubscription = UserSubscription::where('user_identifier', $clientIdentifier)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->with('plan')
            ->first();
        
        // Get active subscription plans filtered by user's project
        $plans = SubscriptionPlan::where('is_active', true)
            ->where(function($query) use ($user) {
                // Show plans that either belong to the user's project or have no project assigned (global plans)
                $query->where('project_id', $user->project?->id)
                      ->orWhereNull('project_id');
            })
            ->orderBy('price')
            ->get();
        
        // Get payment methods (reusing from CreditsController)
        $paymentMethods = [
            [
                'id' => 'cash',
                'name' => 'Cash Payment',
                'description' => 'Pay in cash at our office',
            ],
            [
                'id' => 'credits',
                'name' => 'Pay with Credits',
                'description' => 'Deduct amount from your available credits',
            ],
            [
                'id' => 'lemonsqueezy',
                'name' => 'Credit/Debit Card via Lemon Squeezy',
                'description' => 'Secure online payment via Lemon Squeezy payment gateway',
            ],
            [
                'id' => 'stripe',
                'name' => 'Credit/Debit Card via Stripe',
                'description' => 'Secure online payment via Stripe payment gateway (Coming soon)',
            ],
        ];
        
        // Get subscription history
        $subscriptionHistory = UserSubscription::where('user_identifier', $clientIdentifier)
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Get usage limits
        $limitService = app(\App\Services\SubscriptionLimitService::class);
        $projectIdentifier = $user->project_identifier ?? 'fnb';
        $usageLimits = $limitService->getUsageSummary($projectIdentifier);
        
        return Inertia::render('Subscriptions/Index', [
            'plans' => $plans,
            'activeSubscription' => $activeSubscription,
            'paymentMethods' => $paymentMethods,
            'subscriptionHistory' => $subscriptionHistory,
            'usageLimits' => $usageLimits,
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
        
        // Validate that the user can subscribe to this plan
        if ($plan->project_id && $plan->project_id !== $user->project?->id) {
            return redirect()->back()->with('error', 'You can only subscribe to plans that belong to your project.');
        }
        
        // Handle different payment methods
        switch ($validated['payment_method']) {
            case 'cash':
                return $this->handleCashPayment($user, $plan, $validated);
            case 'credits':
                return $this->handleCreditsPayment($user, $plan, $validated);
            case 'lemonsqueezy':
                return $this->handleLemonSqueezyPayment($user, $plan, $validated);
            case 'stripe':
                return $this->handleStripePayment($user, $plan, $validated);
            default:
                return redirect()->back()->with('error', 'Invalid payment method selected.');
        }
    }
    
    /**
     * Handle cash payment for subscription.
     */
    protected function handleCashPayment($user, $plan, $validated)
    {
        try {
            // Generate a unique reference number for the cash payment
            $referenceNumber = 'CASH-' . strtoupper(uniqid());
            
            // Create a pending subscription
            $subscription = new UserSubscription([
                'user_identifier' => $user->identifier,
                'subscription_plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_in_days),
                'status' => 'pending', // Set as pending until payment is confirmed
                'payment_method' => 'cash',
                'payment_transaction_id' => $referenceNumber,
                'amount_paid' => $plan->price,
                'auto_renew' => $validated['auto_renew'] ?? false,
            ]);
            
            $subscription->save();
            
            // Log the cash payment request
            Log::info('Cash payment subscription created', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'reference' => $referenceNumber,
                'amount' => $plan->price,
            ]);
            
            // Send confirmation email to user
            try {
                $emailContent = "
                    <h2>Subscription Request Received</h2>
                    <p>Dear {$user->name},</p>
                    <p>Thank you for choosing to subscribe to <strong>{$plan->name}</strong>.</p>
                    <p>Your subscription request has been received and is pending payment confirmation.</p>
                    
                    <h3>Payment Details:</h3>
                    <ul>
                        <li><strong>Plan:</strong> {$plan->name}</li>
                        <li><strong>Amount:</strong> ₱" . number_format($plan->price, 2) . "</li>
                        <li><strong>Reference Number:</strong> {$referenceNumber}</li>
                        <li><strong>Duration:</strong> {$plan->duration_in_days} days</li>
                    </ul>
                    
                    <h3>Next Steps:</h3>
                    <p>Please visit any nearby Neulify partner location during their business hours to complete your payment.</p>
                    <p><strong>Important:</strong> Please bring your reference number when making the payment.</p>
                    
                    <p>Once your payment is confirmed by our partner, your subscription will be activated immediately.</p>
                    
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    
                    <p>Best regards,<br>The Neulify Team</p>
                ";
                
                \Mail::to($user->email)->send(new \App\Mail\GenericEmail(
                    'Subscription Request Confirmation - ' . $plan->name,
                    $emailContent
                ));
                
                Log::info('Subscription confirmation email sent', [
                    'user_email' => $user->email,
                    'reference' => $referenceNumber,
                ]);
            } catch (\Exception $emailException) {
                // Log email error but don't fail the subscription
                Log::error('Failed to send subscription confirmation email', [
                    'user_email' => $user->email,
                    'error' => $emailException->getMessage(),
                ]);
            }
            
            // Return success response with payment instructions
            return Inertia::render('Subscriptions/PaymentStatus', [
                'status' => 'pending',
                'message' => 'Your subscription request has been received. A confirmation email has been sent to your email address. Please visit any nearby Neulify partner location to complete the payment.',
                'subscription' => $subscription->load('plan'),
                'payment_instructions' => [
                    'amount' => $plan->price,
                    'reference_number' => $referenceNumber,
                    'business_hours' => 'Visit any nearby Neulify partner location',
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Cash payment subscription failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'exception' => $e
            ]);
            
            return redirect()->back()->with('error', 'An error occurred while processing your subscription. Please try again later.');
        }
    }
    
    /**
     * Handle credits payment for subscription.
     */
    protected function handleCreditsPayment($user, $plan, $validated)
    {
        try {
            // Get user's current credit balance
            $creditResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/credits/{$user->identifier}/balance");
            
            if (!$creditResponse->successful()) {
                return redirect()->back()->with('error', 'Failed to check credit balance. Please try again later.');
            }
            
            $creditData = $creditResponse->json();
            $availableCredits = $creditData['available_credit'] ?? 0;
            
            // Check if user has sufficient credits
            if ($availableCredits < $plan->price) {
                return redirect()->back()->with('error', "Insufficient credits. You have {$availableCredits} credits but need {$plan->price} credits for this plan.");
            }
            
            // Generate a unique reference number for the credits payment
            $referenceNumber = 'CREDITS-' . strtoupper(uniqid());
            
            // Deduct credits from user's account
            $deductResponse = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/credits/spend", [
                    'client_identifier' => $user->identifier,
                    'amount' => $plan->price,
                    'purpose' => "Subscription payment for {$plan->name}",
                    'reference_id' => $referenceNumber,
                ]);
            
            if (!$deductResponse->successful()) {
                return redirect()->back()->with('error', 'Failed to deduct credits. Please try again later.');
            }
            
            // Check if user already has an active subscription
            $activeSubscription = UserSubscription::where('user_identifier', $user->identifier)
                ->where('status', 'active')
                ->where('end_date', '>', now())
                ->first();
            
            if ($activeSubscription) {
                // Cancel the current subscription
                $activeSubscription->cancel('Upgraded to a new plan');
            }
            
            // Create an active subscription
            $subscription = new UserSubscription([
                'user_identifier' => $user->identifier,
                'subscription_plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_in_days),
                'status' => 'active', // Set as active immediately since credits are deducted
                'payment_method' => 'credits',
                'payment_transaction_id' => $referenceNumber,
                'amount_paid' => $plan->price,
                'auto_renew' => $validated['auto_renew'] ?? false,
            ]);
            
            $subscription->save();
            
            // Add credits to user's account based on the plan (subscription benefits)
            try {
                Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/credits/add", [
                        'client_identifier' => $user->identifier,
                        'amount' => $plan->credits_per_month,
                        'source' => 'subscription',
                        'reference_id' => $subscription->identifier,
                    ]);
            } catch (\Exception $e) {
                Log::error('Failed to add subscription credits: ' . $e->getMessage());
            }
            
            // Log the credits payment
            Log::info('Credits payment subscription created', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'reference' => $referenceNumber,
                'amount' => $plan->price,
                'credits_deducted' => $plan->price,
                'credits_added' => $plan->credits_per_month,
            ]);
            
            return Inertia::render('Subscriptions/PaymentStatus', [
                'status' => 'success',
                'message' => 'Your subscription has been activated successfully using your credits.',
                'subscription' => $subscription->load('plan'),
                'payment_details' => [
                    'credits_deducted' => $plan->price,
                    'credits_added' => $plan->credits_per_month,
                    'reference_number' => $referenceNumber,
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Credits payment subscription failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'exception' => $e
            ]);
            
            return redirect()->back()->with('error', 'An error occurred while processing your subscription. Please try again later.');
        }
    }
    
    /**
     * Handle Lemon Squeezy payment for subscription.
     */
    protected function handleLemonSqueezyPayment($user, $plan, $validated)
    {
        try {
            // Check if plan has a lemon_squeezy_variant_id
            if (empty($plan->lemon_squeezy_variant_id)) {
                Log::warning('Lemon Squeezy variant ID not set for plan', [
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                ]);
                
                return redirect()->back()
                    ->with('error', 'This plan is not configured for Lemon Squeezy payment. Please set up the variant ID first or contact support.')
                    ->withInput();
            }
            
            // Generate a unique reference number for Lemon Squeezy payment
            $referenceNumber = $this->lemonSqueezyPaymentService->generateReferenceNumber();
            
            // Prepare checkout data
            $checkoutData = [
                'variant_id' => (string) $plan->lemon_squeezy_variant_id,
                'reference_number' => $referenceNumber,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'plan_description' => $plan->description ?? '',
                'user_identifier' => $user->identifier,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'auto_renew' => $validated['auto_renew'] ?? false,
            ];
            
            // Create checkout or subscription based on auto_renew setting
            if ($validated['auto_renew'] ?? false) {
                $checkoutResult = $this->lemonSqueezyPaymentService->createSubscription($user, $checkoutData);
            } else {
                $checkoutResult = $this->lemonSqueezyPaymentService->createCheckout($user, $checkoutData);
            }
            
            if (!$checkoutResult['success']) {
                return redirect()->back()->with('error', $checkoutResult['message']);
            }
            
            // Create a pending subscription
            $subscription = new UserSubscription([
                'user_identifier' => $user->identifier,
                'subscription_plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_in_days),
                'status' => 'pending',
                'payment_method' => 'lemonsqueezy',
                'payment_transaction_id' => $referenceNumber,
                'amount_paid' => $plan->price,
                'auto_renew' => $validated['auto_renew'] ?? false,
            ]);
            
            $subscription->save();
            
            // Log the checkout creation
            Log::info('Lemon Squeezy checkout created', [
                'checkout_url' => $checkoutResult['checkout_url'],
                'reference' => $referenceNumber,
                'is_subscription' => $checkoutResult['is_subscription'] ?? false,
            ]);
            
            // Redirect to Lemon Squeezy checkout page
            return redirect($checkoutResult['checkout_url']);
            
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy payment subscription failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'exception' => $e
            ]);
            
            return redirect()->back()->with('error', 'An error occurred while processing your subscription. Please try again later.');
        }
    }
    
    /**
     * Handle Stripe payment for subscription.
     */
    protected function handleStripePayment($user, $plan, $validated)
    {
        try {
            // Generate a unique reference number for Stripe payment
            $referenceNumber = $this->stripePaymentService->generateReferenceNumber();
            
            // Prepare checkout data
            $checkoutData = [
                'amount' => $plan->price,
                'reference_number' => $referenceNumber,
                'plan_name' => $plan->name,
                'plan_slug' => $plan->slug,
                'plan_description' => $plan->description,
                'plan_id' => $plan->id,
                'user_identifier' => $user->identifier,
                'user_name' => $user->name,
                'user_lastname' => $user->lastname ?? '',
                'user_email' => $user->email,
                'user_phone' => $user->phone ?? '',
                'auto_renew' => $validated['auto_renew'] ?? false,
            ];
            
            // Create checkout or subscription based on auto_renew setting
            if ($validated['auto_renew'] ?? false) {
                $checkoutResult = $this->stripePaymentService->createSubscription($checkoutData);
            } else {
                $checkoutResult = $this->stripePaymentService->createCheckout($checkoutData);
            }
            
            if (!$checkoutResult['success']) {
                return redirect()->back()->with('error', $checkoutResult['message']);
            }
            
            // Create a pending subscription
            $subscription = new UserSubscription([
                'user_identifier' => $user->identifier,
                'subscription_plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_in_days),
                'status' => 'pending',
                'payment_method' => 'stripe',
                'payment_transaction_id' => $referenceNumber,
                'amount_paid' => $plan->price,
                'auto_renew' => $validated['auto_renew'] ?? false,
                'stripe_session_id' => $checkoutResult['session_id'] ?? null,
                'stripe_subscription_id' => $checkoutResult['subscription_id'] ?? null,
            ]);
            
            $subscription->save();
            
            // Redirect to Stripe checkout page
            try {
                if (empty($checkoutResult['checkout_url'])) {
                    Log::error('Stripe checkout URL is empty', [
                        'checkout_result' => $checkoutResult,
                        'user_id' => $user->id,
                        'plan_id' => $plan->id
                    ]);
                    return redirect()->back()->with('error', 'Payment gateway error: Invalid checkout URL. Please try again later.');
                }
                
                Log::info('Redirecting to Stripe checkout', [
                    'checkout_url' => $checkoutResult['checkout_url'],
                    'reference' => $referenceNumber,
                    'is_subscription' => isset($checkoutResult['subscription_id']),
                ]);
                
                return redirect($checkoutResult['checkout_url']);
            } catch (\Exception $e) {
                Log::error('Failed to redirect to Stripe checkout: ' . $e->getMessage(), [
                    'checkout_result' => $checkoutResult,
                    'exception' => $e
                ]);
                
                $subscription->status = 'failed';
                $subscription->save();
                
                return redirect()->back()->with('error', 'Failed to connect to payment gateway. Please try again later.');
            }
        } catch (\Exception $e) {
            Log::error('Stripe payment subscription failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'exception' => $e
            ]);
            
            return redirect()->back()->with('error', 'An error occurred while processing your subscription. Please try again later.');
        }
    }
    
    /**
     * Handle successful payment from Stripe.
     */
    public function stripeSuccess(Request $request)
    {
        $sessionId = $request->query('session_id');
        
        if (!$sessionId) {
            return Inertia::render('Subscriptions/PaymentStatus', [
                'status' => 'failure',
                'message' => 'Invalid session ID. Please contact support if you believe this is an error.',
            ]);
        }
        
        try {
            $session = \Stripe\Checkout\Session::retrieve($sessionId);
            $referenceNumber = $session->metadata->reference_number;
            
            // Find the pending subscription
            $subscription = UserSubscription::where('payment_transaction_id', $referenceNumber)
                ->where('status', 'pending')
                ->with('plan')
                ->first();
            
            if (!$subscription) {
                return Inertia::render('Subscriptions/PaymentStatus', [
                    'status' => 'failure',
                    'message' => 'Subscription not found. Please contact support if you believe this is an error.',
                ]);
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
                'subscription' => $subscription->load('plan'),
            ]);
        } catch (\Exception $e) {
            Log::error('Stripe success handling failed: ' . $e->getMessage(), [
                'session_id' => $sessionId,
                'exception' => $e
            ]);
            
            return Inertia::render('Subscriptions/PaymentStatus', [
                'status' => 'failure',
                'message' => 'An error occurred while processing your payment. Please contact support.',
            ]);
        }
    }

    /**
     * Handle cancelled payment from Stripe.
     */
    public function stripeCancel(Request $request)
    {
        $sessionId = $request->query('session_id');
        
        if ($sessionId) {
            try {
                $session = \Stripe\Checkout\Session::retrieve($sessionId);
                $referenceNumber = $session->metadata->reference_number;
                
                // Find the pending subscription
                $subscription = UserSubscription::where('payment_transaction_id', $referenceNumber)
                    ->where('status', 'pending')
                    ->first();
                
                if ($subscription) {
                    // Update subscription to cancelled
                    $subscription->status = 'cancelled';
                    $subscription->save();
                }
            } catch (\Exception $e) {
                Log::error('Stripe cancel handling failed: ' . $e->getMessage(), [
                    'session_id' => $sessionId,
                    'exception' => $e
                ]);
            }
        }
        
        return Inertia::render('Subscriptions/PaymentStatus', [
            'status' => 'cancelled',
            'message' => 'You cancelled the payment process. You can try again whenever you\'re ready.',
        ]);
    }

    /**
     * Handle Stripe webhook events.
     */
    public function stripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        
        $event = $this->stripePaymentService->verifyWebhookSignature($payload, $signature);
        
        if (!$event) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }
        
        try {
            switch ($event->type) {
                case 'checkout.session.completed':
                    $session = $event->data->object;
                    $referenceNumber = $session->metadata->reference_number;
                    
                    $subscription = UserSubscription::where('payment_transaction_id', $referenceNumber)
                        ->where('status', 'pending')
                        ->first();
                    
                    if ($subscription) {
                        $subscription->status = 'active';
                        $subscription->save();
                        
                        // Add credits to user's account
                        Http::withToken($this->apiToken)
                            ->post("{$this->apiUrl}/credits/add", [
                                'client_identifier' => $subscription->user_identifier,
                                'amount' => $subscription->plan->credits_per_month,
                                'source' => 'subscription',
                                'reference_id' => $subscription->identifier,
                            ]);
                    }
                    break;
                    
                case 'invoice.payment_succeeded':
                    $invoice = $event->data->object;
                    if ($invoice->subscription) {
                        $stripeSubscription = \Stripe\Subscription::retrieve($invoice->subscription);
                        $referenceNumber = $stripeSubscription->metadata->reference_number;
                        
                        $subscription = UserSubscription::where('payment_transaction_id', $referenceNumber)
                            ->where('status', 'active')
                            ->first();
                        
                        if ($subscription) {
                            // Extend subscription end date
                            $subscription->end_date = now()->addDays($subscription->plan->duration_in_days);
                            $subscription->save();
                            
                            // Add credits for the new period
                            Http::withToken($this->apiToken)
                                ->post("{$this->apiUrl}/credits/add", [
                                    'client_identifier' => $subscription->user_identifier,
                                    'amount' => $subscription->plan->credits_per_month,
                                    'source' => 'subscription_renewal',
                                    'reference_id' => $subscription->identifier,
                                ]);
                        }
                    }
                    break;
                    
                case 'invoice.payment_failed':
                    $invoice = $event->data->object;
                    if ($invoice->subscription) {
                        $stripeSubscription = \Stripe\Subscription::retrieve($invoice->subscription);
                        $referenceNumber = $stripeSubscription->metadata->reference_number;
                        
                        $subscription = UserSubscription::where('payment_transaction_id', $referenceNumber)
                            ->where('status', 'active')
                            ->first();
                        
                        if ($subscription) {
                            $subscription->status = 'failed';
                            $subscription->save();
                        }
                    }
                    break;
            }
            
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Stripe webhook handling failed: ' . $e->getMessage(), [
                'event_type' => $event->type,
                'exception' => $e
            ]);
            
            return response()->json(['error' => 'Webhook handling failed'], 500);
        }
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
        
        // If this subscription has a Stripe subscription ID, cancel it with Stripe
        if ($subscription->hasStripeSubscription()) {
            $result = $this->stripePaymentService->cancelSubscription($subscription->stripe_subscription_id);
            
            if (!$result['success']) {
                Log::error('Failed to cancel Stripe subscription', [
                    'subscription_id' => $subscription->id,
                    'stripe_subscription_id' => $subscription->stripe_subscription_id,
                    'error' => $result['message'],
                ]);
                
                // Continue with local cancellation even if Stripe cancellation fails
                Log::info('Proceeding with local subscription cancellation despite Stripe API failure');
            }
        }
        
        $subscription->cancel($validated['cancellation_reason'] ?? null);
        
        return redirect()->route('subscriptions.index')->with('success', 'Subscription cancelled successfully');
    }
    
    /**
     * Handle successful payment from Lemon Squeezy.
     */
    public function lemonSqueezySuccess(Request $request)
    {
        $reference = $request->query('reference');
        
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
            'subscription' => $subscription->load('plan'),
        ]);
    }
    
    /**
     * Handle cancelled payment from Lemon Squeezy.
     */
    public function lemonSqueezyCancel(Request $request)
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
     * Get subscription plans (API endpoint).
     */
    public function getPlans()
    {
        $user = auth()->user();
        
        // Get active subscription plans filtered by user's project
        $plans = SubscriptionPlan::where('is_active', true)
            ->where(function($query) use ($user) {
                // Show plans that either belong to the user's project or have no project assigned (global plans)
                $query->where('project_id', $user->project?->id)
                      ->orWhereNull('project_id');
            })
            ->orderBy('price')
            ->get();
        
        return response()->json([
            'plans' => $plans,
        ]);
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

    /**
     * Get user's subscription history.
     */
    public function getSubscriptionHistory($userIdentifier)
    {
        $history = UserSubscription::where('user_identifier', $userIdentifier)
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'history' => $history,
        ]);
    }
}
