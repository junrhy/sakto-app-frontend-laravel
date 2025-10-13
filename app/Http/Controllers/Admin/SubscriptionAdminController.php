<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SubscriptionAdminController extends Controller
{
    /**
     * Display a listing of subscription plans and user subscriptions.
     */
    public function index(Request $request)
    {
        $query = SubscriptionPlan::with('project');
        
        // Apply project filter if provided
        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        $plans = $query->orderBy('slug')->get();
        
        // Add active users count for each plan
        $plans->each(function ($plan) {
            $plan->active_users_count = UserSubscription::where('subscription_plan_id', $plan->id)
                ->where('status', 'active')
                ->where('end_date', '>', now())
                ->count();
        });
        
        $projects = Project::orderBy('name')->get();
        
        // Get users for filter dropdown
        $users = \App\Models\User::orderBy('name')->get();
        
        $subscriptionsQuery = UserSubscription::with('plan')
            ->select('user_subscriptions.*')
            ->join('users', 'users.identifier', '=', 'user_subscriptions.user_identifier')
            ->addSelect('users.name as user_name');
        
        // Apply user filter if provided
        if ($request->filled('user_id')) {
            $subscriptionsQuery->where('users.id', $request->user_id);
        }
        
        $subscriptions = $subscriptionsQuery->orderBy('user_subscriptions.created_at', 'desc')->paginate(10);
        
        return Inertia::render('Admin/Subscriptions/Index', [
            'plans' => $plans,
            'projects' => $projects,
            'users' => $users,
            'subscriptions' => $subscriptions,
            'filters' => $request->only(['project_id', 'user_id']),
        ]);
    }
    
    /**
     * Store a newly created subscription plan.
     */
    public function storePlan(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:subscription_plans,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_in_days' => 'required|integer|min:1',
            'credits_per_month' => 'required|integer|min:0',
            'features' => 'nullable|array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'badge_text' => 'nullable|string|max:255',
            'project_id' => 'nullable|exists:projects,id',
            'lemon_squeezy_variant_id' => 'nullable|string|max:255',
            'auto_create_lemon_squeezy' => 'boolean',
        ]);
        
        // Convert slug to proper format
        $validated['slug'] = Str::slug($validated['slug']);
        
        // Automatically create Lemon Squeezy product variant if requested
        if ($request->input('auto_create_lemon_squeezy', false)) {
            try {
                $variantId = $this->createLemonSqueezyVariant($validated);
                if ($variantId) {
                    $validated['lemon_squeezy_variant_id'] = $variantId;
                    Log::info('Lemon Squeezy variant created automatically', [
                        'plan_name' => $validated['name'],
                        'variant_id' => $variantId,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to create Lemon Squeezy variant: ' . $e->getMessage(), [
                    'plan_name' => $validated['name'],
                    'exception' => $e,
                ]);
                // Don't fail the plan creation if Lemon Squeezy fails
                // Just log it and continue
            }
        }
        
        // Remove the auto_create flag before saving
        unset($validated['auto_create_lemon_squeezy']);
        
        SubscriptionPlan::create($validated);
        
        $message = 'Subscription plan created successfully';
        if (isset($variantId)) {
            $message .= ' with Lemon Squeezy variant ID: ' . $variantId;
        }
        
        return redirect()->route('admin.subscriptions.index')->with('success', $message);
    }
    
    /**
     * Create a Lemon Squeezy product variant for the subscription plan.
     */
    protected function createLemonSqueezyVariant(array $planData)
    {
        $apiKey = config('lemon-squeezy.api_key');
        $storeId = config('lemon-squeezy.store');
        
        if (!$apiKey || !$storeId) {
            throw new \Exception('Lemon Squeezy API key or Store ID not configured');
        }
        
        // First, create or get the product
        // Product name will be based on project or default
        $productName = $planData['project_id'] 
            ? Project::find($planData['project_id'])->name . ' Subscriptions'
            : 'Subscription Plans';
        
        // Try to find existing product or create new one
        $productId = $this->getOrCreateLemonSqueezyProduct($productName, $apiKey, $storeId);
        
        if (!$productId) {
            throw new \Exception('Failed to get or create Lemon Squeezy product');
        }
        
        // Now create the variant
        $variantData = [
            'data' => [
                'type' => 'variants',
                'attributes' => [
                    'name' => $planData['name'],
                    'description' => $planData['description'] ?? '',
                    'price' => (int)($planData['price'] * 100), // Convert to cents
                    'interval' => $this->getIntervalFromDays($planData['duration_in_days']),
                    'interval_count' => $this->getIntervalCountFromDays($planData['duration_in_days']),
                    'is_subscription' => true,
                    'sort' => 0,
                ],
                'relationships' => [
                    'product' => [
                        'data' => [
                            'type' => 'products',
                            'id' => (string)$productId,
                        ],
                    ],
                ],
            ],
        ];
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/vnd.api+json',
            'Content-Type' => 'application/vnd.api+json',
        ])->post('https://api.lemonsqueezy.com/v1/variants', $variantData);
        
        if ($response->successful()) {
            $responseData = $response->json();
            return $responseData['data']['id'] ?? null;
        }
        
        throw new \Exception('Failed to create variant: ' . $response->body());
    }
    
    /**
     * Get or create a Lemon Squeezy product.
     */
    protected function getOrCreateLemonSqueezyProduct($productName, $apiKey, $storeId)
    {
        // Try to find existing product by name
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/vnd.api+json',
        ])->get('https://api.lemonsqueezy.com/v1/products', [
            'filter' => ['store_id' => $storeId],
        ]);
        
        if ($response->successful()) {
            $products = $response->json()['data'] ?? [];
            foreach ($products as $product) {
                if ($product['attributes']['name'] === $productName) {
                    return $product['id'];
                }
            }
        }
        
        // Create new product if not found
        $productData = [
            'data' => [
                'type' => 'products',
                'attributes' => [
                    'name' => $productName,
                    'description' => 'Subscription plans',
                    'status' => 'published',
                ],
                'relationships' => [
                    'store' => [
                        'data' => [
                            'type' => 'stores',
                            'id' => (string)$storeId,
                        ],
                    ],
                ],
            ],
        ];
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/vnd.api+json',
            'Content-Type' => 'application/vnd.api+json',
        ])->post('https://api.lemonsqueezy.com/v1/products', $productData);
        
        if ($response->successful()) {
            $responseData = $response->json();
            return $responseData['data']['id'] ?? null;
        }
        
        return null;
    }
    
    /**
     * Convert duration in days to Lemon Squeezy interval.
     */
    protected function getIntervalFromDays($days)
    {
        if ($days >= 365) {
            return 'year';
        } elseif ($days >= 30) {
            return 'month';
        } elseif ($days >= 7) {
            return 'week';
        }
        return 'day';
    }
    
    /**
     * Convert duration in days to Lemon Squeezy interval count.
     */
    protected function getIntervalCountFromDays($days)
    {
        if ($days >= 365) {
            return (int)round($days / 365);
        } elseif ($days >= 30) {
            return (int)round($days / 30);
        } elseif ($days >= 7) {
            return (int)round($days / 7);
        }
        return $days;
    }
    
    /**
     * Update the specified subscription plan.
     */
    public function updatePlan(Request $request, $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:subscription_plans,slug,' . $id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_in_days' => 'required|integer|min:1',
            'credits_per_month' => 'required|integer|min:0',
            'features' => 'nullable|array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'badge_text' => 'nullable|string|max:255',
            'project_id' => 'nullable|exists:projects,id',
            'lemon_squeezy_variant_id' => 'nullable|string|max:255',
        ]);
        
        // Convert slug to proper format
        $validated['slug'] = Str::slug($validated['slug']);
        
        // Update Lemon Squeezy variant if it exists
        $lemonSqueezyUpdated = false;
        if ($plan->lemon_squeezy_variant_id && $plan->lemon_squeezy_variant_id == $validated['lemon_squeezy_variant_id']) {
            try {
                $this->updateLemonSqueezyVariant($plan->lemon_squeezy_variant_id, $validated);
                $lemonSqueezyUpdated = true;
                Log::info('Lemon Squeezy variant updated', [
                    'plan_id' => $id,
                    'variant_id' => $plan->lemon_squeezy_variant_id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to update Lemon Squeezy variant: ' . $e->getMessage(), [
                    'plan_id' => $id,
                    'variant_id' => $plan->lemon_squeezy_variant_id,
                    'exception' => $e,
                ]);
                // Continue with local update even if Lemon Squeezy fails
            }
        }
        
        $plan->update($validated);
        
        $message = 'Subscription plan updated successfully';
        if ($lemonSqueezyUpdated) {
            $message .= ' and synced with Lemon Squeezy';
        }
        
        return redirect()->route('admin.subscriptions.index')->with('success', $message);
    }
    
    /**
     * Update a Lemon Squeezy product variant.
     */
    protected function updateLemonSqueezyVariant($variantId, array $planData)
    {
        $apiKey = config('lemon-squeezy.api_key');
        
        if (!$apiKey) {
            throw new \Exception('Lemon Squeezy API key not configured');
        }
        
        $variantData = [
            'data' => [
                'type' => 'variants',
                'id' => (string)$variantId,
                'attributes' => [
                    'name' => $planData['name'],
                    'description' => $planData['description'] ?? '',
                    'price' => (int)($planData['price'] * 100), // Convert to cents
                    'interval' => $this->getIntervalFromDays($planData['duration_in_days']),
                    'interval_count' => $this->getIntervalCountFromDays($planData['duration_in_days']),
                ],
            ],
        ];
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/vnd.api+json',
            'Content-Type' => 'application/vnd.api+json',
        ])->patch("https://api.lemonsqueezy.com/v1/variants/{$variantId}", $variantData);
        
        if (!$response->successful()) {
            throw new \Exception('Failed to update variant: ' . $response->body());
        }
        
        return true;
    }
    
    /**
     * Remove the specified subscription plan.
     */
    public function destroyPlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        // Check if there are any active subscriptions using this plan
        $activeUsersCount = UserSubscription::where('subscription_plan_id', $id)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->count();
        
        if ($activeUsersCount > 0) {
            return redirect()->route('admin.subscriptions.index')
                ->with('error', "Cannot delete plan that has {$activeUsersCount} active users. Please wait for all subscriptions to expire or cancel them first.");
        }
        
        $plan->delete();
        
        return redirect()->route('admin.subscriptions.index')->with('success', 'Subscription plan deleted successfully');
    }
    
    /**
     * Toggle the active status of a subscription plan.
     */
    public function togglePlanStatus($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        // If trying to deactivate, check if there are active users
        if ($plan->is_active) {
            $activeUsersCount = UserSubscription::where('subscription_plan_id', $id)
                ->where('status', 'active')
                ->where('end_date', '>', now())
                ->count();
            
            if ($activeUsersCount > 0) {
                return redirect()->route('admin.subscriptions.index')
                    ->with('error', "Cannot deactivate plan that has {$activeUsersCount} active users. Please wait for all subscriptions to expire or cancel them first.");
            }
        }
        
        $plan->is_active = !$plan->is_active;
        $plan->save();
        
        return redirect()->route('admin.subscriptions.index')->with('success', 'Plan status updated successfully');
    }
    
    /**
     * View details of a user subscription.
     */
    public function viewSubscription($id)
    {
        $subscription = UserSubscription::with('plan')
            ->select('user_subscriptions.*')
            ->join('users', 'users.identifier', '=', 'user_subscriptions.user_identifier')
            ->addSelect('users.name as user_name')
            ->where('user_subscriptions.id', $id)
            ->firstOrFail();
        
        return Inertia::render('Admin/Subscriptions/View', [
            'subscription' => $subscription,
        ]);
    }
    
    /**
     * Cancel a user subscription.
     */
    public function cancelSubscription(Request $request, $id)
    {
        $subscription = UserSubscription::findOrFail($id);
        
        $validated = $request->validate([
            'cancellation_reason' => 'nullable|string|max:255',
        ]);
        
        $subscription->cancel($validated['cancellation_reason'] ?? 'Cancelled by administrator');
        
        return redirect()->route('admin.subscriptions.index')->with('success', 'Subscription cancelled successfully');
    }
    
    /**
     * Add credits to a user's subscription manually.
     */
    public function addCredits(Request $request, $id)
    {
        $subscription = UserSubscription::with('plan')->findOrFail($id);
        
        $validated = $request->validate([
            'amount' => 'required|integer|min:1',
            'note' => 'nullable|string|max:255',
        ]);
        
        $apiUrl = config('api.url');
        $apiToken = config('api.token');
        
        try {
            $response = Http::withToken($apiToken)
                ->post("{$apiUrl}/credits/add", [
                    'client_identifier' => $subscription->user_identifier,
                    'amount' => $validated['amount'],
                    'source' => 'admin_manual',
                    'reference_id' => 'admin_' . time(),
                    'note' => $validated['note'] ?? 'Added by administrator',
                ]);
            
            if ($response->successful()) {
                return redirect()->route('admin.subscriptions.view', $id)->with('success', 'Credits added successfully');
            } else {
                return redirect()->route('admin.subscriptions.view', $id)->with('error', 'Failed to add credits: ' . $response->body());
            }
        } catch (\Exception $e) {
            return redirect()->route('admin.subscriptions.view', $id)->with('error', 'Failed to add credits: ' . $e->getMessage());
        }
    }
    
    /**
     * Mark a cash payment as paid and activate the subscription.
     */
    public function markAsPaid(Request $request, $id)
    {
        $subscription = UserSubscription::with('plan')->findOrFail($id);
        
        // Validate that this is a pending cash payment
        if ($subscription->status !== 'pending' || $subscription->payment_method !== 'cash') {
            return redirect()->route('admin.subscriptions.view', $id)
                ->with('error', 'This subscription cannot be marked as paid. Only pending cash payments can be marked as paid.');
        }
        
        $validated = $request->validate([
            'note' => 'nullable|string|max:255',
        ]);
        
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
        $apiUrl = config('api.url');
        $apiToken = config('api.token');
        
        try {
            $response = Http::withToken($apiToken)
                ->post("{$apiUrl}/credits/add", [
                    'client_identifier' => $subscription->user_identifier,
                    'amount' => $subscription->plan->credits_per_month,
                    'source' => 'subscription',
                    'reference_id' => $subscription->identifier,
                    'note' => $validated['note'] ?? 'Cash payment confirmed by administrator',
                ]);
            
            if (!$response->successful()) {
                Log::error('Failed to add subscription credits after marking cash payment as paid', [
                    'subscription_id' => $subscription->id,
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to add subscription credits after marking cash payment as paid: ' . $e->getMessage(), [
                'subscription_id' => $subscription->id,
                'exception' => $e,
            ]);
        }
        
        return redirect()->route('admin.subscriptions.view', $id)
            ->with('success', 'Payment marked as paid and subscription activated successfully');
    }
    
    /**
     * Run the subscription renewal command manually.
     */
    public function runRenewalCommand()
    {
        try {
            // Capture the output of the command
            $output = '';
            \Artisan::call('app:renew-subscriptions', [], $output);
            
            // Log the output for debugging
            \Log::info('Subscription renewal command output: ' . $output);
            
            // Parse the output to get counts
            $processedCount = 0;
            $renewedCount = 0;
            $expiredCount = 0;
            
            if (preg_match('/Found (\d+) active subscriptions/', $output, $matches)) {
                $processedCount = $matches[1];
            }
            
            if (preg_match('/Found (\d+) subscriptions ending soon/', $output, $matches)) {
                $renewedCount = $matches[1];
            }
            
            if (preg_match('/Found (\d+) expired subscriptions/', $output, $matches)) {
                $expiredCount = $matches[1];
            }
            
            $message = "Renewal command executed successfully. ";
            $message .= "Processed $processedCount active subscriptions, ";
            $message .= "renewed $renewedCount subscriptions, ";
            $message .= "and marked $expiredCount expired subscriptions.";
            
            return redirect()->route('admin.subscriptions.index')->with('success', $message);
        } catch (\Exception $e) {
            \Log::error('Failed to run renewal command: ' . $e->getMessage());
            return redirect()->route('admin.subscriptions.index')->with('error', 'Failed to run renewal command: ' . $e->getMessage());
        }
    }
}
