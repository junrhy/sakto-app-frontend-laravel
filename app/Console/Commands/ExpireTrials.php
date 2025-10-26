<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\GenericEmail;

class ExpireTrials extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:expire-trials';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire trials and send notifications to users whose trials are ending soon or have expired';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting trial expiration check...');
        
        // Send warning emails to users whose trials are ending in 3 days
        $this->sendTrialEndingWarnings();
        
        // Send final notifications to users whose trials have expired
        $this->sendTrialExpiredNotifications();
        
        $this->info('Trial expiration check completed.');
        
        return Command::SUCCESS;
    }

    /**
     * Send warning emails to users whose trials are ending in 3 days.
     */
    protected function sendTrialEndingWarnings()
    {
        $threeDaysFromNow = now()->addDays(3);
        
        $users = User::whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '>', now())
            ->where('trial_ends_at', '<=', $threeDaysFromNow)
            ->whereDoesntHave('subscription', function ($query) {
                $query->where('status', 'active')
                    ->where('end_date', '>', now());
            })
            ->get();
        
        foreach ($users as $user) {
            try {
                $daysRemaining = now()->diffInDays($user->trial_ends_at);
                
                $emailContent = "
                    <h2>Your Free Trial is Ending Soon</h2>
                    <p>Dear {$user->name},</p>
                    <p>Your 14-day free trial will expire in <strong>{$daysRemaining} day(s)</strong> on <strong>{$user->trial_ends_at->format('F j, Y')}</strong>.</p>
                    
                    <h3>Don't Lose Access!</h3>
                    <p>To continue enjoying all premium features after your trial ends, please subscribe to one of our plans.</p>
                    
                    <div style='margin: 20px 0;'>
                        <a href='" . route('subscriptions.index') . "' style='background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;'>View Subscription Plans</a>
                    </div>
                    
                    <h3>What You'll Get:</h3>
                    <ul>
                        <li>Unlimited access to all features</li>
                        <li>Priority customer support</li>
                        <li>Regular updates and new features</li>
                        <li>No ads or limitations</li>
                    </ul>
                    
                    <p>If you have any questions about our plans or need help choosing the right one for you, please don't hesitate to contact us.</p>
                    
                    <p>Best regards,<br>The " . config('app.name') . " Team</p>
                ";
                
                Mail::to($user->email)->send(new GenericEmail(
                    'Your Free Trial is Ending Soon - ' . config('app.name'),
                    $emailContent
                ));
                
                $this->info("Sent trial ending warning to: {$user->email}");
                Log::info('Trial ending warning sent', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'trial_ends_at' => $user->trial_ends_at,
                    'days_remaining' => $daysRemaining,
                ]);
                
            } catch (\Exception $e) {
                $this->error("Failed to send email to {$user->email}: {$e->getMessage()}");
                Log::error('Failed to send trial ending warning', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        
        $this->info("Processed {$users->count()} trial ending warnings.");
    }

    /**
     * Send notifications to users whose trials have just expired.
     */
    protected function sendTrialExpiredNotifications()
    {
        $users = User::whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '<=', now())
            ->where('trial_expired_notification_sent', false)
            ->whereDoesntHave('subscription', function ($query) {
                $query->where('status', 'active')
                    ->where('end_date', '>', now());
            })
            ->get();
        
        foreach ($users as $user) {
            try {
                $emailContent = "
                    <h2>Your Free Trial Has Expired</h2>
                    <p>Dear {$user->name},</p>
                    <p>Your 14-day free trial has now expired. We hope you enjoyed exploring all the features of " . config('app.name') . "!</p>
                    
                    <h3>Continue Your Journey</h3>
                    <p>To regain access to all premium features, please subscribe to one of our affordable plans.</p>
                    
                    <div style='margin: 20px 0;'>
                        <a href='" . route('subscriptions.index') . "' style='background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;'>Subscribe Now</a>
                    </div>
                    
                    <h3>Why Subscribe?</h3>
                    <ul>
                        <li>Full access to all premium features</li>
                        <li>Priority customer support</li>
                        <li>Regular updates and improvements</li>
                        <li>Special subscriber-only benefits</li>
                    </ul>
                    
                    <p>We'd love to have you continue as part of our community. If you have any questions or concerns, please feel free to reach out to our support team.</p>
                    
                    <p>Thank you for trying " . config('app.name') . "!</p>
                    
                    <p>Best regards,<br>The " . config('app.name') . " Team</p>
                ";
                
                Mail::to($user->email)->send(new GenericEmail(
                    'Your Free Trial Has Expired - ' . config('app.name'),
                    $emailContent
                ));
                
                // Mark notification as sent
                $user->trial_expired_notification_sent = true;
                $user->save();
                
                $this->info("Sent trial expired notification to: {$user->email}");
                Log::info('Trial expired notification sent', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'trial_ended_at' => $user->trial_ends_at,
                ]);
                
            } catch (\Exception $e) {
                $this->error("Failed to send email to {$user->email}: {$e->getMessage()}");
                Log::error('Failed to send trial expired notification', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        
        $this->info("Processed {$users->count()} trial expired notifications.");
    }
}
