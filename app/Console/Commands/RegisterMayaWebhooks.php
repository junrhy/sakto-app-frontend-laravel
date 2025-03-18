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
        $publicKey = config('services.maya.public_key');
        $webhookUrl = config('services.maya.webhook_url');
        
        if (!$baseUrl || !$secretKey || !$publicKey) {
            $this->error('Maya API credentials are not configured.');
            return 1;
        }
        
        // Check if we're in a local environment (likely won't work with Maya)
        $isLocal = str_contains($webhookUrl, 'localhost') || str_contains($webhookUrl, '127.0.0.1');
        if ($isLocal) {
            $this->warn('Warning: Using a local URL for webhooks. Maya requires public URLs for webhook callbacks.');
            $this->warn('Consider using a service like ngrok for local testing or deploy to a public server.');
            
            if (!$this->confirm('Do you want to continue anyway?', false)) {
                return 1;
            }
        }
        
        // Register all webhooks
        $webhooks = $this->registerAllWebhooks($baseUrl, $secretKey, $publicKey);
        
        $totalWebhooks = $webhooks['total'];
        $successCount = $webhooks['success'];
        
        if ($successCount === $totalWebhooks) {
            $this->info('All webhooks registered successfully!');
            return 0;
        } else {
            $this->warn("Registered {$successCount} out of {$totalWebhooks} webhooks.");
            return 1;
        }
    }
    
    /**
     * Register all Maya webhooks.
     */
    private function registerAllWebhooks($baseUrl, $secretKey, $publicKey)
    {
        // Ensure we have absolute URLs for callbacks
        $successUrl = config('services.maya.webhook_success_url');
        $failureUrl = config('services.maya.webhook_failure_url');
        $webhookUrl = config('services.maya.webhook_url');
        
        // Make sure URLs are absolute
        if (!filter_var($successUrl, FILTER_VALIDATE_URL)) {
            $successUrl = config('app.url') . '/webhooks/maya/success';
        }
        
        if (!filter_var($failureUrl, FILTER_VALIDATE_URL)) {
            $failureUrl = config('app.url') . '/webhooks/maya/failure';
        }
        
        if (!filter_var($webhookUrl, FILTER_VALIDATE_URL)) {
            $webhookUrl = config('app.url') . '/webhooks/maya';
        }
        
        // Define all available Maya webhook events
        $webhooks = [
            // Standard payment webhooks
            [
                'name' => 'AUTHORIZED',
                'callbackUrl' => $webhookUrl,
                'eventName' => 'AUTHORIZED',
            ],
            [
                'name' => 'PAYMENT_SUCCESS',
                'callbackUrl' => $successUrl,
                'eventName' => 'PAYMENT_SUCCESS',
            ],
            [
                'name' => 'PAYMENT_FAILED',
                'callbackUrl' => $failureUrl,
                'eventName' => 'PAYMENT_FAILED',
            ],
            [
                'name' => 'PAYMENT_EXPIRED',
                'callbackUrl' => $failureUrl,
                'eventName' => 'PAYMENT_EXPIRED',
            ],
            [
                'name' => 'PAYMENT_CANCELLED',
                'callbackUrl' => $failureUrl,
                'eventName' => 'PAYMENT_CANCELLED',
            ],
            
            // 3DS payment webhooks
            [
                'name' => '3DS_PAYMENT_SUCCESS',
                'callbackUrl' => $successUrl,
                'eventName' => '3DS_PAYMENT_SUCCESS',
            ],
            [
                'name' => '3DS_PAYMENT_FAILURE',
                'callbackUrl' => $failureUrl,
                'eventName' => '3DS_PAYMENT_FAILURE',
            ],
            [
                'name' => '3DS_PAYMENT_DROPOUT',
                'callbackUrl' => $failureUrl,
                'eventName' => '3DS_PAYMENT_DROPOUT',
            ],
            
            // Recurring payment webhooks
            [
                'name' => 'RECURRING_PAYMENT_SUCCESS',
                'callbackUrl' => $successUrl,
                'eventName' => 'RECURRING_PAYMENT_SUCCESS',
            ],
            [
                'name' => 'RECURRING_PAYMENT_FAILURE',
                'callbackUrl' => $failureUrl,
                'eventName' => 'RECURRING_PAYMENT_FAILURE',
            ],
            
            // Checkout webhooks
            [
                'name' => 'CHECKOUT_SUCCESS',
                'callbackUrl' => $successUrl,
                'eventName' => 'CHECKOUT_SUCCESS',
            ],
            [
                'name' => 'CHECKOUT_FAILURE',
                'callbackUrl' => $failureUrl,
                'eventName' => 'CHECKOUT_FAILURE',
            ],
            [
                'name' => 'CHECKOUT_DROPOUT',
                'callbackUrl' => $failureUrl,
                'eventName' => 'CHECKOUT_DROPOUT',
            ],
            [
                'name' => 'CHECKOUT_CANCELLED',
                'callbackUrl' => $failureUrl,
                'eventName' => 'CHECKOUT_CANCELLED',
            ],
        ];
        
        return $this->registerWebhooks($baseUrl, $secretKey, $publicKey, $webhooks, '/checkout/v1/webhooks');
    }
    
    /**
     * Register webhooks with Maya.
     */
    private function registerWebhooks($baseUrl, $secretKey, $publicKey, $webhooks, $endpoint)
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
                    $successCount++;
                }
            } catch (\Exception $e) {
                // Silent catch - no logging
            }
        }
        
        return [
            'total' => count($webhooks),
            'success' => $successCount,
        ];
    }
}
