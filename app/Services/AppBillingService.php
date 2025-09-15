<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\UserApp;
use App\Models\Module;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AppBillingService
{
    protected $apiUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }
    /**
     * Create an invoice for app purchase.
     */
    public function createAppPurchaseInvoice(User $user, Module $module, string $paymentMethod = null): Invoice
    {
        return DB::transaction(function () use ($user, $module, $paymentMethod) {
            // Create invoice
            $invoice = Invoice::create([
                'user_identifier' => $user->identifier,
                'type' => $module->pricing_type === 'subscription' 
                    ? Invoice::TYPE_APP_SUBSCRIPTION 
                    : Invoice::TYPE_APP_PURCHASE,
                'subtotal' => $module->price,
                'tax_amount' => 0, // Add tax calculation if needed
                'total_amount' => $module->price,
                'status' => Invoice::STATUS_PENDING,
                'payment_method' => $paymentMethod,
                'due_date' => now()->addDays(7),
            ]);

            // Create invoice item
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'item_type' => $module->pricing_type === 'subscription' 
                    ? InvoiceItem::TYPE_APP_SUBSCRIPTION 
                    : InvoiceItem::TYPE_APP_PURCHASE,
                'item_identifier' => $module->identifier,
                'description' => $module->title,
                'quantity' => 1,
                'unit_price' => $module->price,
                'total_price' => $module->price,
                'metadata' => [
                    'module_id' => $module->id,
                    'pricing_type' => $module->pricing_type,
                ],
            ]);

            return $invoice;
        });
    }

    /**
     * Create an invoice for multiple app purchases.
     */
    public function createMultipleAppPurchaseInvoice(User $user, $modules, string $paymentMethod = null): Invoice
    {
        return DB::transaction(function () use ($user, $modules, $paymentMethod) {
            // Calculate total amount
            $totalAmount = $modules->sum('price');
            
            // Determine invoice type based on modules
            $hasSubscription = $modules->where('pricing_type', 'subscription')->count() > 0;
            $invoiceType = $hasSubscription ? Invoice::TYPE_APP_SUBSCRIPTION : Invoice::TYPE_APP_PURCHASE;

            // Create invoice
            $invoice = Invoice::create([
                'user_identifier' => $user->identifier,
                'type' => $invoiceType,
                'subtotal' => $totalAmount,
                'tax_amount' => 0, // Add tax calculation if needed
                'total_amount' => $totalAmount,
                'status' => Invoice::STATUS_PENDING,
                'payment_method' => $paymentMethod,
                'due_date' => now()->addDays(7),
            ]);

            // Create invoice items for each module
            foreach ($modules as $module) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => $module->pricing_type === 'subscription' 
                        ? InvoiceItem::TYPE_APP_SUBSCRIPTION 
                        : InvoiceItem::TYPE_APP_PURCHASE,
                    'item_identifier' => $module->identifier,
                    'description' => $module->title,
                    'quantity' => 1,
                    'unit_price' => $module->price,
                    'total_price' => $module->price,
                    'metadata' => [
                        'module_id' => $module->id,
                        'pricing_type' => $module->pricing_type,
                    ],
                ]);
            }

            return $invoice;
        });
    }

    /**
     * Process app purchase payment.
     */
    public function processAppPurchase(User $user, Module $module, string $paymentMethod, array $paymentData = []): array
    {
        try {
            // Create invoice
            $invoice = $this->createAppPurchaseInvoice($user, $module, $paymentMethod);

            // Process payment based on method
            $paymentResult = $this->processPayment($invoice, $paymentMethod, $paymentData);

            if ($paymentResult['success']) {
                // Mark invoice as paid
                $invoice->markAsPaid($paymentMethod, $paymentResult['transaction_id'] ?? null);

                // Create user app record
                $userApp = UserApp::create([
                    'user_identifier' => $user->identifier,
                    'module_identifier' => $module->identifier,
                    'billing_type' => $module->pricing_type === 'subscription' 
                        ? UserApp::BILLING_SUBSCRIPTION 
                        : UserApp::BILLING_ONE_TIME,
                    'price_paid' => $module->price,
                    'invoice_id' => $invoice->id,
                    'payment_status' => UserApp::STATUS_PAID,
                    'payment_transaction_id' => $paymentResult['transaction_id'] ?? null,
                    'next_billing_date' => $module->pricing_type === 'subscription' 
                        ? now()->addMonth() 
                        : null,
                    'auto_renew' => $module->pricing_type === 'subscription' 
                        ? ($paymentData['auto_renew'] ?? true) 
                        : false,
                ]);

                return [
                    'success' => true,
                    'invoice' => $invoice,
                    'user_app' => $userApp,
                    'message' => 'App purchased successfully',
                ];
            } else {
                // Mark invoice as failed
                $invoice->update(['status' => Invoice::STATUS_FAILED]);

                return [
                    'success' => false,
                    'message' => $paymentResult['message'] ?? 'Payment failed',
                    'invoice' => $invoice,
                ];
            }
        } catch (\Exception $e) {
            Log::error('App purchase failed: ' . $e->getMessage(), [
                'user_id' => $user->identifier,
                'module_id' => $module->identifier,
                'payment_method' => $paymentMethod,
                'exception' => $e,
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while processing your purchase. Please try again.',
            ];
        }
    }

    /**
     * Process multiple app purchase payment.
     */
    public function processMultipleAppPurchase(User $user, $modules, string $paymentMethod, array $paymentData = []): array
    {
        try {
            // Create invoice for multiple apps
            $invoice = $this->createMultipleAppPurchaseInvoice($user, $modules, $paymentMethod);

            // Process payment based on method
            $paymentResult = $this->processPayment($invoice, $paymentMethod, $paymentData);

            if ($paymentResult['success']) {
                // Mark invoice as paid
                $invoice->markAsPaid($paymentMethod, $paymentResult['transaction_id'] ?? null);

                $userApps = [];
                $apps = [];

                // Create user app records for each module
                foreach ($modules as $module) {
                    $userApp = UserApp::create([
                        'user_identifier' => $user->identifier,
                        'module_identifier' => $module->identifier,
                        'billing_type' => $module->pricing_type === 'subscription' 
                            ? UserApp::BILLING_SUBSCRIPTION 
                            : UserApp::BILLING_ONE_TIME,
                        'price_paid' => $module->price,
                        'invoice_id' => $invoice->id,
                        'payment_status' => UserApp::STATUS_PAID,
                        'payment_transaction_id' => $paymentResult['transaction_id'] ?? null,
                        'next_billing_date' => $module->pricing_type === 'subscription' 
                            ? now()->addMonth() 
                            : null,
                        'auto_renew' => $module->pricing_type === 'subscription' 
                            ? ($paymentData['auto_renew'] ?? true) 
                            : false,
                    ]);

                    $userApps[] = $userApp;
                    $apps[] = [
                        'title' => $module->title,
                        'price' => (float) $module->price,
                        'pricingType' => $module->pricing_type
                    ];
                }

                return [
                    'success' => true,
                    'invoice' => $invoice,
                    'user_apps' => $userApps,
                    'apps' => $apps,
                    'message' => 'Apps purchased successfully',
                ];
            } else {
                // Mark invoice as failed
                $invoice->update(['status' => Invoice::STATUS_FAILED]);

                return [
                    'success' => false,
                    'message' => $paymentResult['message'] ?? 'Payment failed',
                    'invoice' => $invoice,
                ];
            }
        } catch (\Exception $e) {
            Log::error('Multiple app purchase failed: ' . $e->getMessage(), [
                'user_id' => $user->identifier,
                'module_count' => $modules->count(),
                'payment_method' => $paymentMethod,
                'exception' => $e,
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while processing your purchase. Please try again.',
            ];
        }
    }

    /**
     * Process payment for invoice.
     */
    protected function processPayment(Invoice $invoice, string $paymentMethod, array $paymentData = []): array
    {
        switch ($paymentMethod) {
            case 'credits':
                return $this->processCreditsPayment($invoice, $paymentData);
            default:
                return [
                    'success' => false,
                    'message' => 'Invalid payment method',
                ];
        }
    }


    /**
     * Process credits payment.
     */
    protected function processCreditsPayment(Invoice $invoice, array $paymentData = []): array
    {
        try {
            $user = User::where('identifier', $invoice->user_identifier)->first();
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found',
                ];
            }

            // Get user's current credit balance
            $creditResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/credits/{$user->identifier}/balance");
            
            if (!$creditResponse->successful()) {
                return [
                    'success' => false,
                    'message' => 'Failed to check credit balance. Please try again later.',
                ];
            }
            
            $creditData = $creditResponse->json();
            $availableCredits = $creditData['available_credit'] ?? 0;
            
            // Check if user has sufficient credits
            if ($availableCredits < $invoice->total_amount) {
                return [
                    'success' => false,
                    'message' => "Insufficient credits. You have {$availableCredits} credits but need {$invoice->total_amount} credits for this purchase.",
                ];
            }
            
            // Generate a unique reference number for the credits payment
            $referenceNumber = 'CREDITS-' . strtoupper(uniqid());
            
            // Deduct credits from user's account
            $deductResponse = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/credits/spend", [
                    'client_identifier' => $user->identifier,
                    'amount' => $invoice->total_amount,
                    'purpose' => "App purchase - Invoice #{$invoice->invoice_number}",
                    'reference_id' => $referenceNumber,
                ]);
            
            if (!$deductResponse->successful()) {
                $errorData = $deductResponse->json();
                $errorMessage = $errorData['message'] ?? 'Failed to deduct credits from your account.';
                
                return [
                    'success' => false,
                    'message' => $errorMessage,
                ];
            }

            // Log the credits payment
            Log::info('Credits payment for app purchase', [
                'user_id' => $user->id,
                'invoice_id' => $invoice->id,
                'reference' => $referenceNumber,
                'amount' => $invoice->total_amount,
                'credits_deducted' => $invoice->total_amount,
            ]);

            return [
                'success' => true,
                'transaction_id' => $referenceNumber,
                'message' => 'Payment processed successfully with credits',
            ];

        } catch (\Exception $e) {
            Log::error('Credits payment failed: ' . $e->getMessage(), [
                'invoice_id' => $invoice->id,
                'exception' => $e,
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while processing your payment. Please try again later.',
            ];
        }
    }



    /**
     * Reactivate a cancelled app subscription.
     */
    public function reactivateAppSubscription(User $user, Module $module, string $paymentMethod, array $paymentData = [], UserApp $cancelledUserApp): array
    {
        try {
            // Create new invoice for reactivation
            $invoice = $this->createAppPurchaseInvoice($user, $module, $paymentMethod);

            // Process payment
            $paymentResult = $this->processPayment($invoice, $paymentMethod, $paymentData);

            if ($paymentResult['success']) {
                // Mark invoice as paid
                $invoice->markAsPaid($paymentMethod, $paymentResult['transaction_id'] ?? null);

                // Reactivate the cancelled subscription
                $cancelledUserApp->update([
                    'payment_status' => UserApp::STATUS_PAID,
                    'payment_transaction_id' => $paymentResult['transaction_id'] ?? null,
                    'invoice_id' => $invoice->id,
                    'cancelled_at' => null,  // Remove cancellation
                    'cancellation_reason' => null,  // Clear cancellation reason
                    'auto_renew' => $paymentData['auto_renew'] ?? true,
                    'next_billing_date' => $module->pricing_type === 'subscription' 
                        ? now()->addMonth() 
                        : null,
                ]);

                return [
                    'success' => true,
                    'invoice' => $invoice,
                    'user_app' => $cancelledUserApp,
                    'message' => 'App subscription reactivated successfully',
                ];
            } else {
                // Mark invoice as failed
                $invoice->update(['status' => Invoice::STATUS_FAILED]);

                return [
                    'success' => false,
                    'message' => $paymentResult['message'] ?? 'Payment failed',
                    'invoice' => $invoice,
                ];
            }
        } catch (\Exception $e) {
            Log::error('App subscription reactivation failed: ' . $e->getMessage(), [
                'user_id' => $user->identifier,
                'module_id' => $module->identifier,
                'payment_method' => $paymentMethod,
                'exception' => $e,
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while reactivating your subscription. Please try again.',
            ];
        }
    }

    /**
     * Generate monthly billing for subscription apps.
     */
    public function generateMonthlyBilling(): array
    {
        $results = [
            'processed' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        // Get all subscription apps that need billing
        $appsToBill = UserApp::needsBilling()->with(['user', 'module'])->get();

        foreach ($appsToBill as $userApp) {
            try {
                // Create new invoice for monthly billing
                $invoice = $this->createAppPurchaseInvoice(
                    $userApp->user,
                    $userApp->module,
                    'credits' // Use credits for subscription renewals
                );

                // Process payment with credits
                $paymentResult = $this->processPayment($invoice, 'credits');

                if ($paymentResult['success']) {
                    // Mark invoice as paid
                    $invoice->markAsPaid('credits', $paymentResult['transaction_id'] ?? null);

                    // Update user app with new billing cycle
                    $userApp->update([
                        'next_billing_date' => now()->addMonth(),
                        'invoice_id' => $invoice->id,
                        'payment_status' => UserApp::STATUS_PAID,
                        'payment_transaction_id' => $paymentResult['transaction_id'] ?? null,
                    ]);

                    $results['processed']++;

                    Log::info('Subscription renewal processed successfully', [
                        'user_app_id' => $userApp->id,
                        'user_identifier' => $userApp->user_identifier,
                        'module_identifier' => $userApp->module_identifier,
                        'invoice_id' => $invoice->id,
                        'amount' => $invoice->total_amount,
                        'transaction_id' => $paymentResult['transaction_id'] ?? null,
                    ]);
                } else {
                    // Payment failed - mark invoice as failed
                    $invoice->update(['status' => Invoice::STATUS_FAILED]);

                    // Update user app payment status to failed
                    $userApp->update([
                        'payment_status' => UserApp::STATUS_FAILED,
                        'invoice_id' => $invoice->id,
                    ]);

                    $results['failed']++;
                    $results['errors'][] = [
                        'user_app_id' => $userApp->id,
                        'error' => $paymentResult['message'] ?? 'Payment failed',
                    ];

                    Log::error('Subscription renewal payment failed', [
                        'user_app_id' => $userApp->id,
                        'user_identifier' => $userApp->user_identifier,
                        'module_identifier' => $userApp->module_identifier,
                        'invoice_id' => $invoice->id,
                        'error' => $paymentResult['message'] ?? 'Payment failed',
                    ]);
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'user_app_id' => $userApp->id,
                    'error' => $e->getMessage(),
                ];

                Log::error('Monthly billing failed for user app: ' . $e->getMessage(), [
                    'user_app_id' => $userApp->id,
                    'exception' => $e,
                ]);
            }
        }

        return $results;
    }

    /**
     * Get user's billing history.
     */
    public function getUserBillingHistory(string $userIdentifier, int $limit = 20): array
    {
        $invoices = Invoice::forUser($userIdentifier)
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return $invoices->map(function ($invoice) {
            return [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'type' => $invoice->type,
                'total_amount' => $invoice->total_amount,
                'status' => $invoice->status,
                'payment_method' => $invoice->payment_method,
                'created_at' => $invoice->created_at,
                'paid_at' => $invoice->paid_at,
                'items' => $invoice->items->map(function ($item) {
                    return [
                        'description' => $item->description,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_price' => $item->total_price,
                    ];
                }),
            ];
        })->toArray();
    }
}
