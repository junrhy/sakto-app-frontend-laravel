<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class SubscriptionAdminController extends Controller
{
    /**
     * Display a listing of subscription plans and user subscriptions.
     */
    public function index()
    {
        $plans = SubscriptionPlan::orderBy('price')->get();
        $subscriptions = UserSubscription::with('plan')
            ->select('user_subscriptions.*')
            ->join('users', 'users.identifier', '=', 'user_subscriptions.user_identifier')
            ->addSelect('users.name as user_name')
            ->orderBy('user_subscriptions.created_at', 'desc')
            ->paginate(10);
        
        return Inertia::render('Admin/Subscriptions/Index', [
            'plans' => $plans,
            'subscriptions' => $subscriptions,
        ]);
    }
    
    /**
     * Store a newly created subscription plan.
     */
    public function storePlan(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_in_days' => 'required|integer|min:1',
            'credits_per_month' => 'required|integer|min:0',
            'features' => 'nullable|array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'badge_text' => 'nullable|string|max:255',
        ]);
        
        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);
        
        // Check if slug already exists
        $existingPlan = SubscriptionPlan::where('slug', $validated['slug'])->first();
        if ($existingPlan) {
            $validated['slug'] = $validated['slug'] . '-' . time();
        }
        
        SubscriptionPlan::create($validated);
        
        return redirect()->route('admin.subscriptions.index')->with('success', 'Subscription plan created successfully');
    }
    
    /**
     * Update the specified subscription plan.
     */
    public function updatePlan(Request $request, $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_in_days' => 'required|integer|min:1',
            'credits_per_month' => 'required|integer|min:0',
            'features' => 'nullable|array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'badge_text' => 'nullable|string|max:255',
        ]);
        
        $plan->update($validated);
        
        return redirect()->route('admin.subscriptions.index')->with('success', 'Subscription plan updated successfully');
    }
    
    /**
     * Remove the specified subscription plan.
     */
    public function destroyPlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        // Check if there are any subscriptions using this plan
        $subscriptionsCount = UserSubscription::where('subscription_plan_id', $id)->count();
        
        if ($subscriptionsCount > 0) {
            return redirect()->route('admin.subscriptions.index')->with('error', 'Cannot delete plan that has active subscriptions');
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
