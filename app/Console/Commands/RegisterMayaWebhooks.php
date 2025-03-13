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
    protected $description = 'Register webhooks with Maya Business for payment notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $baseUrl = config('services.maya.base_url');
        $secretKey = config('services.maya.secret_key');
        
        if (!$baseUrl || !$secretKey) {
            $this->error('Maya API credentials are not configured.');
            return 1;
        }
        
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
        
        $this->info('Registering Maya webhooks...');
        
        $successCount = 0;
        
        foreach ($webhooks as $webhook) {
            try {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Basic ' . base64_encode($secretKey . ':')
                ])->post($baseUrl . '/checkout/v1/webhooks', [
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
        
        if ($successCount === count($webhooks)) {
            $this->info('All webhooks registered successfully!');
            return 0;
        } else {
            $this->warn("Registered {$successCount} out of " . count($webhooks) . " webhooks.");
            return 1;
        }
    }
}
