<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RegisterMayaWebhooks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'maya:register-webhooks';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Register webhooks with Maya Business for payment and subscription notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $baseUrl = config('services.maya.base_url');
        $secretKey = config('services.maya.secret_key');
        $webhookUrl = config('services.maya.webhook_url', route('webhooks.maya'));
        
        if (!$baseUrl || !$secretKey) {
            $this->error('Maya API credentials are not configured.');
            return 1;
        }
        
        // Register payment webhooks
        $this->info('Registering Maya payment webhooks...');
        $paymentWebhooks = $this->registerPaymentWebhooks($baseUrl, $secretKey);
        
        // Register subscription webhooks
        $this->info('Registering Maya subscription webhooks...');
        $subscriptionWebhooks = $this->registerSubscriptionWebhooks($baseUrl, $secretKey);
        
        $totalWebhooks = count($paymentWebhooks) + count($subscriptionWebhooks);
        $successCount = $paymentWebhooks['success'] + $subscriptionWebhooks['success'];
        
        if ($successCount === $totalWebhooks) {
            $this->info('All webhooks registered successfully!');
            return 0;
        } else {
            $this->warn("Registered {$successCount} out of {$totalWebhooks} webhooks.");
            return 1;
        }
    }
    
    /**
     * Register payment webhooks.
     */
    private function registerPaymentWebhooks($baseUrl, $secretKey)
    {
        $webhooks = [
            [
                'name' => 'Payment Success Webhook',
                'callbackUrl' => config('services.maya.webhook_success_url'),
                'eventName' => 'PAYMENT_SUCCESS',
            ],
            [
                'name' => 'Payment Failed Webhook',
                'callbackUrl' => config('services.maya.webhook_failure_url'),
                'eventName' => 'PAYMENT_FAILED',
            ],
            [
                'name' => 'Payment Expired Webhook',
                'callbackUrl' => config('services.maya.webhook_failure_url'),
                'eventName' => 'PAYMENT_EXPIRED',
            ],
        ];
        
        return $this->registerWebhooks($baseUrl, $secretKey, $webhooks, '/checkout/v1/webhooks');
    }
    
    /**
     * Register subscription webhooks.
     */
    private function registerSubscriptionWebhooks($baseUrl, $secretKey)
    {
        $webhookUrl = config('services.maya.webhook_url', route('webhooks.maya'));
        
        $webhooks = [
            [
                'name' => 'Subscription Created Webhook',
                'callbackUrl' => $webhookUrl,
                'eventName' => 'SUBSCRIPTION_CREATED',
            ],
            [
                'name' => 'Subscription Charged Webhook',
                'callbackUrl' => $webhookUrl,
                'eventName' => 'SUBSCRIPTION_CHARGED',
            ],
            [
                'name' => 'Subscription Cancelled Webhook',
                'callbackUrl' => $webhookUrl,
                'eventName' => 'SUBSCRIPTION_CANCELLED',
            ],
            [
                'name' => 'Subscription Failed Webhook',
                'callbackUrl' => $webhookUrl,
                'eventName' => 'SUBSCRIPTION_FAILED',
            ],
        ];
        
        return $this->registerWebhooks($baseUrl, $secretKey, $webhooks, '/payments/v1/webhooks');
    }
    
    /**
     * Register webhooks with Maya.
     */
    private function registerWebhooks($baseUrl, $secretKey, $webhooks, $endpoint)
    {
        $successCount = 0;
        
        foreach ($webhooks as $webhook) {
            try {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Basic ' . base64_encode($secretKey . ':')
                ])->post($baseUrl . $endpoint, [
                    'name' => $webhook['name'],
                    'callbackUrl' => $webhook['callbackUrl'],
                    'eventName' => $webhook['eventName'],
                ]);
                
                if ($response->successful()) {
                    $this->info("✓ Registered webhook: {$webhook['name']} for {$webhook['eventName']}");
                    $successCount++;
                } else {
                    $this->error("✗ Failed to register webhook: {$webhook['name']}");
                    $this->error("  Response: " . $response->body());
                }
            } catch (\Exception $e) {
                $this->error("✗ Exception when registering webhook: {$webhook['name']}");
                $this->error("  " . $e->getMessage());
                Log::error('Maya webhook registration error', [
                    'webhook' => $webhook['name'],
                    'error' => $e->getMessage(),
                ]);
            }
        }
        
        return [
            'total' => count($webhooks),
            'success' => $successCount,
        ];
    }
}
