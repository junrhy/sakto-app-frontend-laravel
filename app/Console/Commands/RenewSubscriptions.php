<?php

namespace App\Console\Commands;

use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Services\AppBillingService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RenewSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:renew-subscriptions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process subscription renewals and add monthly credits';

    protected $appBillingService;

    public function __construct(AppBillingService $appBillingService)
    {
        parent::__construct();
        $this->appBillingService = $appBillingService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting subscription renewal process...');
        
        // Process monthly credit allocations for active subscriptions
        $this->processMonthlyCredits();
        
        // Process auto-renewals for subscriptions ending soon
        $this->processAutoRenewals();
        
        // Process monthly billing for individual app subscriptions
        $this->processAppSubscriptions();
        
        // Mark expired subscriptions
        $this->markExpiredSubscriptions();
        
        $this->info('Subscription renewal process completed.');
        
        return Command::SUCCESS;
    }

    /**
     * Process monthly billing for individual app subscriptions.
     */
    private function processAppSubscriptions()
    {
        $this->info('Processing individual app subscription billing...');
        
        $results = $this->appBillingService->generateMonthlyBilling();
        
        $this->info("Processed {$results['processed']} app subscriptions.");
        
        if ($results['failed'] > 0) {
            $this->warn("Failed to process {$results['failed']} app subscriptions.");
            
            foreach ($results['errors'] as $error) {
                $this->error("User App ID {$error['user_app_id']}: {$error['error']}");
            }
        }
    }
    
    /**
     * Process monthly credit allocations for active subscriptions.
     */
    private function processMonthlyCredits()
    {
        $this->info('Processing monthly credit allocations...');
        
        // Get active subscriptions
        $activeSubscriptions = UserSubscription::where('status', 'active')
            ->where('end_date', '>', now())
            ->with('plan')
            ->get();
        
        $this->info("Found {$activeSubscriptions->count()} active subscriptions.");
        
        $apiUrl = config('api.url');
        $apiToken = config('api.token');
        
        foreach ($activeSubscriptions as $subscription) {
            // Check if it's time to add monthly credits
            // We'll add credits if it's the first day of the month or if the subscription was created today
            $isFirstDayOfMonth = now()->day === 1;
            $wasCreatedToday = $subscription->created_at->isToday();
            $lastCreditDate = $subscription->last_credit_date ? Carbon::parse($subscription->last_credit_date) : null;
            $isNewMonth = $lastCreditDate ? now()->month !== $lastCreditDate->month : true;
            
            if (($isFirstDayOfMonth && $isNewMonth) || $wasCreatedToday) {
                $this->info("Adding monthly credits for subscription {$subscription->identifier}");
                
                try {
                    // Add credits to user's account
                    $response = Http::withToken($apiToken)
                        ->post("{$apiUrl}/credits/add", [
                            'client_identifier' => $subscription->user_identifier,
                            'amount' => $subscription->plan->credits_per_month,
                            'source' => 'subscription_monthly',
                            'reference_id' => $subscription->identifier,
                        ]);
                    
                    if ($response->successful()) {
                        // Update last credit date
                        $subscription->last_credit_date = now();
                        $subscription->save();
                        
                        $this->info("Added {$subscription->plan->credits_per_month} credits to user {$subscription->user_identifier}");
                    } else {
                        $this->error("Failed to add credits for subscription {$subscription->identifier}: " . $response->body());
                        Log::error("Failed to add subscription credits: " . $response->body());
                    }
                } catch (\Exception $e) {
                    $this->error("Exception while adding credits for subscription {$subscription->identifier}: " . $e->getMessage());
                    Log::error("Exception while adding subscription credits: " . $e->getMessage());
                }
            }
        }
        
        $this->info('Monthly credit allocation process completed.');
    }
    
    /**
     * Process auto-renewals for subscriptions ending soon.
     */
    private function processAutoRenewals()
    {
        $this->info('Processing auto-renewals...');
        
        // Get subscriptions ending in the next 3 days with auto-renew enabled
        $endingSoon = UserSubscription::where('status', 'active')
            ->where('end_date', '<=', now()->addDays(3))
            ->where('end_date', '>', now())
            ->where('auto_renew', true)
            ->with('plan')
            ->get();
        
        $this->info("Found {$endingSoon->count()} subscriptions ending soon with auto-renew enabled.");
        
        foreach ($endingSoon as $subscription) {
            $this->info("Processing auto-renewal for subscription {$subscription->identifier}");
            
            try {
                // Create a new subscription period
                $newSubscription = new UserSubscription([
                    'user_identifier' => $subscription->user_identifier,
                    'subscription_plan_id' => $subscription->subscription_plan_id,
                    'start_date' => $subscription->end_date, // Start when the current one ends
                    'end_date' => Carbon::parse($subscription->end_date)->addDays($subscription->plan->duration_in_days),
                    'status' => 'active',
                    'payment_method' => $subscription->payment_method,
                    'payment_transaction_id' => 'auto_renewal_' . time(),
                    'amount_paid' => $subscription->plan->price,
                    'auto_renew' => true,
                ]);
                
                $newSubscription->save();
                
                // Mark the current subscription as completed
                $subscription->status = 'completed';
                $subscription->save();
                
                $this->info("Successfully renewed subscription {$subscription->identifier}");
            } catch (\Exception $e) {
                $this->error("Exception while renewing subscription {$subscription->identifier}: " . $e->getMessage());
                Log::error("Exception while renewing subscription: " . $e->getMessage());
            }
        }
        
        $this->info('Auto-renewal process completed.');
    }
    
    /**
     * Mark expired subscriptions.
     */
    private function markExpiredSubscriptions()
    {
        $this->info('Marking expired subscriptions...');
        
        // Get expired subscriptions that are still marked as active
        $expired = UserSubscription::where('status', 'active')
            ->where('end_date', '<', now())
            ->get();
        
        $this->info("Found {$expired->count()} expired subscriptions.");
        
        foreach ($expired as $subscription) {
            $this->info("Marking subscription {$subscription->identifier} as expired");
            
            $subscription->status = 'expired';
            $subscription->save();
        }
        
        $this->info('Expired subscription marking process completed.');
    }
}
