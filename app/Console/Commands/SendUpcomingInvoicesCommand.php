<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\UserSubscription;
use App\Models\UserApp;
use App\Services\AppBillingService;
use App\Jobs\SendUpcomingInvoicesEmail;

class SendUpcomingInvoicesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:send-upcoming-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send upcoming invoices notifications to users 7 days before due date';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting upcoming invoices notification process...');
        
        $sevenDaysFromNow = now()->addDays(7);
        $billingService = new AppBillingService();
        $emailsSent = 0;
        
        // Get all users who have upcoming invoices due in 7 days
        $usersWithUpcomingInvoices = $this->getUsersWithUpcomingInvoices($sevenDaysFromNow);
        
        foreach ($usersWithUpcomingInvoices as $userData) {
            $user = $userData['user'];
            $upcomingInvoices = $userData['upcoming_invoices'];
            
            if (empty($upcomingInvoices)) {
                continue;
            }
            
            try {
                // Dispatch the email job
                SendUpcomingInvoicesEmail::dispatch($user, $upcomingInvoices);
                
                $this->info("Queued upcoming invoices email for user: {$user->email}");
                $emailsSent++;
                
            } catch (\Exception $e) {
                $this->error("Failed to queue email for user {$user->email}: " . $e->getMessage());
                Log::error('Failed to queue upcoming invoices email', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        $this->info("Process completed. {$emailsSent} emails queued for sending.");
        Log::info('Upcoming invoices notification process completed', [
            'emails_queued' => $emailsSent,
            'total_users_processed' => count($usersWithUpcomingInvoices)
        ]);
    }
    
    /**
     * Get users with upcoming invoices due in the specified date range.
     */
    private function getUsersWithUpcomingInvoices($targetDate)
    {
        $usersWithInvoices = [];
        
        // Get users with subscription plan renewals due in 7 days
        $subscriptionUsers = UserSubscription::where('status', UserSubscription::STATUS_ACTIVE)
            ->where('auto_renew', true)
            ->whereDate('next_billing_date', $targetDate->toDateString())
            ->orWhereDate('end_date', $targetDate->toDateString())
            ->with('user')
            ->get()
            ->groupBy('user_identifier');
        
        // Get users with app subscription renewals due in 7 days
        $appSubscriptionUsers = UserApp::where('billing_type', UserApp::BILLING_SUBSCRIPTION)
            ->where('auto_renew', true)
            ->where('cancelled_at', null)
            ->whereDate('next_billing_date', $targetDate->toDateString())
            ->with('user')
            ->get()
            ->groupBy('user_identifier');
        
        // Combine all user identifiers
        $allUserIdentifiers = $subscriptionUsers->keys()->merge($appSubscriptionUsers->keys())->unique();
        
        foreach ($allUserIdentifiers as $userIdentifier) {
            $user = User::where('identifier', $userIdentifier)->first();
            
            if (!$user) {
                continue;
            }
            
            // Get upcoming invoices for this user
            $billingService = new AppBillingService();
            $upcomingInvoices = $billingService->getUpcomingSubscriptionInvoices($userIdentifier);
            
            // Filter invoices that are due in 7 days
            $invoicesDueIn7Days = array_filter($upcomingInvoices, function($invoice) use ($targetDate) {
                return date('Y-m-d', strtotime($invoice['due_date'])) === $targetDate->toDateString();
            });
            
            if (!empty($invoicesDueIn7Days)) {
                $usersWithInvoices[] = [
                    'user' => $user,
                    'upcoming_invoices' => array_values($invoicesDueIn7Days)
                ];
            }
        }
        
        return $usersWithInvoices;
    }
}
