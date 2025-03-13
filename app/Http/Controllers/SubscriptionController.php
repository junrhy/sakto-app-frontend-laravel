<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
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
                'id' => 1,
                'name' => 'GCash',
                'accountName' => 'Jun Rhy Crodua',
                'accountNumber' => '09260049848',
            ],
            [
                'id' => 2,
                'name' => 'Maya',
                'accountName' => 'Jun Rhy Crodua',
                'accountNumber' => '09260049848',
            ],
            [
                'id' => 4,
                'name' => 'Bank Transfer',
                'accountName' => 'Jun Rhy Crodua',
                'accountNumber' => '006996000660',
                'bankName' => 'BDO'
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
     * Subscribe to a plan.
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'payment_method' => 'required|string',
            'payment_transaction_id' => 'required|string',
            'auto_renew' => 'boolean',
            'proof_of_payment' => 'nullable|image|max:2048',
        ]);
        
        $clientIdentifier = auth()->user()->identifier;
        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);
        
        // Check if user already has an active subscription
        $activeSubscription = UserSubscription::where('user_identifier', $clientIdentifier)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->first();
        
        if ($activeSubscription) {
            // Cancel the current subscription
            $activeSubscription->cancel('Upgraded to a new plan');
        }
        
        // Handle proof of payment upload
        $proofOfPaymentUrl = null;
        if ($request->hasFile('proof_of_payment')) {
            $path = $request->file('proof_of_payment')->store('subscription_payments', 'public');
            $proofOfPaymentUrl = Storage::disk('public')->url($path);
        }
        
        // Create new subscription
        $subscription = new UserSubscription([
            'user_identifier' => $clientIdentifier,
            'subscription_plan_id' => $plan->id,
            'start_date' => now(),
            'end_date' => now()->addDays($plan->duration_in_days),
            'status' => 'active',
            'payment_method' => $validated['payment_method'],
            'payment_transaction_id' => $validated['payment_transaction_id'],
            'amount_paid' => $plan->price,
            'proof_of_payment' => $proofOfPaymentUrl,
            'auto_renew' => $validated['auto_renew'] ?? false,
        ]);
        
        $subscription->save();
        
        // Add credits to user's account based on the plan
        try {
            Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/credits/add", [
                    'client_identifier' => $clientIdentifier,
                    'amount' => $plan->credits_per_month,
                    'source' => 'subscription',
                    'reference_id' => $subscription->identifier,
                ]);
        } catch (\Exception $e) {
            Log::error('Failed to add subscription credits: ' . $e->getMessage());
        }
        
        return redirect()->route('subscriptions.index')->with('success', 'Successfully subscribed to ' . $plan->name);
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
