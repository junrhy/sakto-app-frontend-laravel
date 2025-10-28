<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\UserApp;
use App\Models\Module;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

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
                'total_amount' => (float) $invoice->total_amount,
                'status' => $invoice->status,
                'payment_method' => $invoice->payment_method,
                'created_at' => $invoice->created_at,
                'paid_at' => $invoice->paid_at,
                'items' => $invoice->items->map(function ($item) {
                    return [
                        'description' => $item->description,
                        'quantity' => (int) $item->quantity,
                        'unit_price' => (float) $item->unit_price,
                        'total_price' => (float) $item->total_price,
                    ];
                }),
            ];
        })->toArray();
    }

    /**
     * Get user's upcoming subscription invoices.
     */
    public function getUpcomingSubscriptionInvoices(string $userIdentifier): array
    {
        $upcomingInvoices = [];

        // Get active subscriptions
        $activeSubscriptions = UserSubscription::where('user_identifier', $userIdentifier)
            ->where('status', UserSubscription::STATUS_ACTIVE)
            ->where('auto_renew', true)
            ->with('plan')
            ->get();

        foreach ($activeSubscriptions as $subscription) {
            $nextBillingDate = $subscription->next_billing_date ?? $subscription->end_date;
            
            if ($nextBillingDate && $nextBillingDate > now()) {
                $upcomingInvoices[] = [
                    'id' => 'upcoming_' . $subscription->id,
                    'invoice_number' => 'UPCOMING-' . $subscription->identifier,
                    'type' => 'subscription',
                    'subscription_id' => $subscription->id,
                    'subscription_identifier' => $subscription->identifier,
                    'plan_name' => $subscription->plan->name,
                    'billing_cycle' => $subscription->billing_cycle ?? 'monthly',
                    'total_amount' => (float) $subscription->plan->price,
                    'status' => 'upcoming',
                    'payment_method' => $subscription->payment_method,
                    'due_date' => $nextBillingDate,
                    'items' => [
                        [
                            'description' => $subscription->plan->name . ' Subscription',
                            'quantity' => 1,
                            'unit_price' => (float) $subscription->plan->price,
                            'total_price' => (float) $subscription->plan->price,
                        ]
                    ],
                ];
            }
        }

        // Get upcoming app subscription renewals
        $upcomingAppSubscriptions = UserApp::forUser($userIdentifier)
            ->where('billing_type', UserApp::BILLING_SUBSCRIPTION)
            ->where('auto_renew', true)
            ->where('cancelled_at', null)
            ->where('next_billing_date', '>', now())
            ->with('module')
            ->get();

        foreach ($upcomingAppSubscriptions as $userApp) {
            $upcomingInvoices[] = [
                'id' => 'upcoming_app_' . $userApp->id,
                'invoice_number' => 'UPCOMING-APP-' . $userApp->id,
                'type' => 'app_subscription',
                'user_app_id' => $userApp->id,
                'app_name' => $userApp->module->title,
                'billing_cycle' => 'monthly', // Default for app subscriptions
                'total_amount' => (float) $userApp->module->price,
                'status' => 'upcoming',
                'payment_method' => 'credits', // Default for app subscriptions
                'due_date' => $userApp->next_billing_date,
                'items' => [
                    [
                        'description' => $userApp->module->title . ' Subscription',
                        'quantity' => 1,
                        'unit_price' => (float) $userApp->module->price,
                        'total_price' => (float) $userApp->module->price,
                    ]
                ],
            ];
        }

        // Sort by due date
        usort($upcomingInvoices, function ($a, $b) {
            return strtotime($a['due_date']) - strtotime($b['due_date']);
        });

        return $upcomingInvoices;
    }

    /**
     * Get comprehensive billing information including history and upcoming invoices.
     */
    public function getComprehensiveBillingInfo(string $userIdentifier, int $limit = 20): array
    {
        return [
            'billing_history' => $this->getUserBillingHistory($userIdentifier, $limit),
            'upcoming_invoices' => $this->getUpcomingSubscriptionInvoices($userIdentifier),
        ];
    }

    /**
     * Generate PDF for an invoice.
     */
    public function generateInvoicePDF(int $invoiceId, string $userIdentifier): string
    {
        $invoice = Invoice::forUser($userIdentifier)
            ->with(['items', 'user'])
            ->findOrFail($invoiceId);

        $html = $this->generateInvoiceHTML($invoice);

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'defaultFont' => 'Arial',
            'isRemoteEnabled' => false,
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true,
        ]);

        return $pdf->output();
    }

    /**
     * Generate PDF for all upcoming invoices.
     */
    public function generateUpcomingInvoicesPDF(string $userIdentifier): string
    {
        $upcomingInvoices = $this->getUpcomingSubscriptionInvoices($userIdentifier);
        
        if (empty($upcomingInvoices)) {
            throw new \Exception('No upcoming invoices found');
        }

        $html = $this->generateUpcomingInvoicesHTML($upcomingInvoices);

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'defaultFont' => 'Arial',
            'isRemoteEnabled' => false,
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true,
        ]);

        return $pdf->output();
    }

    /**
     * Generate HTML for invoice PDF.
     */
    private function generateInvoiceHTML(Invoice $invoice): string
    {
        $user = $invoice->user;
        $companyName = config('app.name', 'Neulify');
        $companyAddress = 'B2-208 Mivesa Garden Residences, Lahug Cebu City, Philippines';
        $companyPhone = '+63 926 004 9848';
        $companyEmail = 'billing@neulify.com';

        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Invoice ' . $invoice->invoice_number . '</title>
            <style>
                @page { margin: 20mm; }
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e74c3c; padding-bottom: 20px; }
                .company-name { font-size: 24px; font-weight: bold; color: #e74c3c; margin-bottom: 5px; }
                .company-details { font-size: 12px; color: #666; }
                .invoice-title { font-size: 28px; font-weight: bold; margin: 20px 0; }
                .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .invoice-info, .billing-info { width: 48%; }
                .info-section h3 { margin: 0 0 10px 0; color: #e74c3c; font-size: 16px; }
                .info-section p { margin: 5px 0; font-size: 14px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .items-table th { background-color: #f8f9fa; font-weight: bold; color: #333; }
                .items-table tr:nth-child(even) { background-color: #f8f9fa; }
                .total-section { text-align: right; margin-top: 20px; }
                .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
                .total-label { font-weight: bold; }
                .grand-total { font-size: 18px; font-weight: bold; color: #e74c3c; border-top: 2px solid #e74c3c; padding-top: 10px; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">' . $companyName . '</div>
                <div class="company-details">
                    ' . $companyAddress . '<br>
                    Phone: ' . $companyPhone . ' | Email: ' . $companyEmail . '
                </div>
            </div>

            <div class="invoice-title">INVOICE</div>

            <div class="invoice-details">
                <div class="invoice-info">
                    <div class="info-section">
                        <h3>Invoice Details</h3>
                        <p><strong>Invoice Number:</strong> ' . $invoice->invoice_number . '</p>
                        <p><strong>Invoice Date:</strong> ' . $invoice->created_at->format('F j, Y') . '</p>
                        <p><strong>Due Date:</strong> ' . ($invoice->due_date ? $invoice->due_date->format('F j, Y') : 'N/A') . '</p>
                        <p><strong>Status:</strong> ' . ucfirst($invoice->status) . '</p>
                    </div>
                </div>
                <div class="billing-info">
                    <div class="info-section">
                        <h3>Bill To</h3>
                        <p><strong>' . ($user->name ?? 'N/A') . '</strong></p>
                        <p>' . ($user->email ?? 'N/A') . '</p>
                    </div>
                </div>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($invoice->items as $item) {
            $html .= '
                    <tr>
                        <td>' . htmlspecialchars($item->description) . '</td>
                        <td>' . $item->quantity . '</td>
                        <td>PHP ' . number_format($item->unit_price, 2) . '</td>
                        <td>PHP ' . number_format($item->total_price, 2) . '</td>
                    </tr>';
        }

        $html .= '
                </tbody>
            </table>

            <div class="total-section">
                <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span>PHP ' . number_format($invoice->subtotal, 2) . '</span>
                </div>
                <div class="total-row">
                    <span class="total-label">Tax:</span>
                    <span>PHP ' . number_format($invoice->tax_amount, 2) . '</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total Amount:</span>
                    <span>PHP ' . number_format($invoice->total_amount, 2) . '</span>
                </div>
            </div>';

        if ($invoice->payment_method) {
            $html .= '
            <div style="margin-top: 20px;">
                <p><strong>Payment Method:</strong> ' . ucfirst($invoice->payment_method) . '</p>';
            
            if ($invoice->paid_at) {
                $html .= '<p><strong>Paid Date:</strong> ' . $invoice->paid_at->format('F j, Y g:i A') . '</p>';
            }
            
            $html .= '</div>';
        }

        $html .= '
            <div class="footer">
                <p>Thank you for your business!</p>
                <p>This is a computer-generated invoice.</p>
            </div>
        </body>
        </html>';

        return $html;
    }

    /**
     * Generate HTML for upcoming invoices PDF.
     */
    private function generateUpcomingInvoicesHTML(array $upcomingInvoices): string
    {
        $companyName = config('app.name', 'Neulify');
        $companyAddress = 'B2-208 Mivesa Garden Residences, Lahug Cebu City, Philippines';
        $companyPhone = '+63 926 004 9848';
        $companyEmail = 'billing@neulify.com';

        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Upcoming Invoices</title>
            <style>
                @page { margin: 15mm; }
                body { font-family: Arial, sans-serif; margin: 0; padding: 10px; color: #333; font-size: 12px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e74c3c; padding-bottom: 15px; }
                .company-name { font-size: 20px; font-weight: bold; color: #e74c3c; margin-bottom: 5px; }
                .company-details { font-size: 10px; color: #666; }
                .document-title { font-size: 22px; font-weight: bold; margin: 15px 0; text-align: center; }
                .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .summary-table th, .summary-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
                .summary-table th { background-color: #f8f9fa; font-weight: bold; color: #333; }
                .summary-table tr:nth-child(even) { background-color: #f8f9fa; }
                .amount { text-align: right; font-weight: bold; color: #e74c3c; }
                .due-date { color: #e74c3c; font-weight: bold; }
                .billing-cycle { background-color: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 10px; }
                .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
                .total-row { background-color: #e74c3c; color: white; font-weight: bold; }
                .total-row td { border-color: #e74c3c; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">' . $companyName . '</div>
                <div class="company-details">
                    ' . $companyAddress . '<br>
                    Phone: ' . $companyPhone . ' | Email: ' . $companyEmail . '
                </div>
            </div>

            <div class="document-title">UPCOMING INVOICES</div>

            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Invoice #</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Billing Cycle</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>';

        $totalAmount = 0;
        foreach ($upcomingInvoices as $invoice) {
            $totalAmount += $invoice['total_amount'];
            
            $description = '';
            if (isset($invoice['plan_name'])) {
                $description = $invoice['plan_name'];
            } elseif (isset($invoice['app_name'])) {
                $description = $invoice['app_name'];
            }
            
            $html .= '
                    <tr>
                        <td>' . $invoice['invoice_number'] . '</td>
                        <td>' . ucfirst(str_replace('_', ' ', $invoice['type'])) . '</td>
                        <td>' . $description . '</td>
                        <td><span class="billing-cycle">' . ucfirst($invoice['billing_cycle']) . '</span></td>
                        <td><span class="due-date">' . date('M j, Y', strtotime($invoice['due_date'])) . '</span></td>
                        <td class="amount">PHP ' . number_format($invoice['total_amount'], 2) . '</td>
                    </tr>';
        }

        $html .= '
                    <tr class="total-row">
                        <td colspan="5"><strong>Total Upcoming Amount</strong></td>
                        <td class="amount">PHP ' . number_format($totalAmount, 2) . '</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer">
                <p>These are upcoming invoices for your active subscriptions.</p>
                <p>This is a computer-generated document.</p>
            </div>
        </body>
        </html>';

        return $html;
    }

    /**
     * Generate PDF for monthly billing.
     */
    public function generateMonthlyBillingPDF(string $userIdentifier, string $monthKey): string
    {
        // Parse month key (YYYY-MM)
        $year = substr($monthKey, 0, 4);
        $month = substr($monthKey, 5, 2);
        
        // Get invoices for the specific month
        $invoices = Invoice::forUser($userIdentifier)
            ->with(['items', 'user'])
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('created_at', 'desc')
            ->get();
        
        if ($invoices->isEmpty()) {
            throw new \Exception('No invoices found for the specified month');
        }

        $html = $this->generateMonthlyBillingHTML($invoices, $monthKey);

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'defaultFont' => 'Arial',
            'isRemoteEnabled' => false,
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true,
        ]);

        return $pdf->output();
    }

    /**
     * Generate HTML for monthly billing PDF.
     */
    private function generateMonthlyBillingHTML($invoices, string $monthKey): string
    {
        $user = $invoices->first()->user;
        $companyName = config('app.name', 'Neulify');
        $companyAddress = 'B2-208 Mivesa Garden Residences, Lahug Cebu City, Philippines';
        $companyPhone = '+63 926 004 9848';
        $companyEmail = 'billing@neulify.com';
        
        // Format month display
        $date = \DateTime::createFromFormat('Y-m', $monthKey);
        $monthDisplay = $date->format('F Y');
        
        $totalAmount = $invoices->sum('total_amount');

        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Monthly Billing - ' . $monthDisplay . '</title>
            <style>
                @page { margin: 20mm; }
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e74c3c; padding-bottom: 20px; }
                .company-name { font-size: 24px; font-weight: bold; color: #e74c3c; margin-bottom: 5px; }
                .company-details { font-size: 12px; color: #666; }
                .billing-title { font-size: 28px; font-weight: bold; margin: 20px 0; }
                .billing-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .billing-info, .customer-info { width: 48%; }
                .info-section h3 { margin: 0 0 10px 0; color: #e74c3c; font-size: 16px; }
                .info-section p { margin: 5px 0; font-size: 14px; }
                .invoice-item { border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; }
                .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .invoice-number { font-weight: bold; color: #e74c3c; }
                .invoice-amount { font-weight: bold; font-size: 16px; }
                .invoice-date { color: #666; font-size: 12px; }
                .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                .items-table th { background-color: #f8f9fa; font-weight: bold; }
                .total-section { text-align: right; margin-top: 30px; border-top: 2px solid #e74c3c; padding-top: 20px; }
                .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
                .total-label { font-weight: bold; }
                .grand-total { font-size: 18px; font-weight: bold; color: #e74c3c; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">' . $companyName . '</div>
                <div class="company-details">
                    ' . $companyAddress . '<br>
                    Phone: ' . $companyPhone . ' | Email: ' . $companyEmail . '
                </div>
            </div>

            <div class="billing-title">Monthly Billing Statement</div>
            <div class="billing-title" style="font-size: 20px; color: #666;">' . $monthDisplay . '</div>

            <div class="billing-details">
                <div class="billing-info">
                    <div class="info-section">
                        <h3>Billing Information</h3>
                        <p><strong>Period:</strong> ' . $monthDisplay . '</p>
                        <p><strong>Total Invoices:</strong> ' . $invoices->count() . '</p>
                        <p><strong>Generated:</strong> ' . now()->format('F j, Y g:i A') . '</p>
                    </div>
                </div>
                <div class="customer-info">
                    <div class="info-section">
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ' . htmlspecialchars($user->name) . '</p>
                        <p><strong>Email:</strong> ' . htmlspecialchars($user->email) . '</p>
                    </div>
                </div>
            </div>

            <h3 style="color: #e74c3c; margin-bottom: 20px;">Invoice Details</h3>';

        foreach ($invoices as $invoice) {
            $html .= '
            <div class="invoice-item">
                <div class="invoice-header">
                    <div>
                        <div class="invoice-number">Invoice #' . $invoice->invoice_number . '</div>
                        <div class="invoice-date">Date: ' . $invoice->created_at->format('F j, Y') . '</div>
                    </div>
                    <div class="invoice-amount">PHP ' . number_format($invoice->total_amount, 2) . '</div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>';
            
            foreach ($invoice->items as $item) {
                $html .= '
                        <tr>
                            <td>' . htmlspecialchars($item->description) . '</td>
                            <td>' . $item->quantity . '</td>
                            <td>PHP ' . number_format($item->unit_price, 2) . '</td>
                            <td>PHP ' . number_format($item->total_price, 2) . '</td>
                        </tr>';
            }
            
            $html .= '
                    </tbody>
                </table>
            </div>';
        }

        $html .= '
            <div class="total-section">
                <div class="total-row">
                    <span class="total-label">Total Amount for ' . $monthDisplay . ':</span>
                    <span class="grand-total">PHP ' . number_format($totalAmount, 2) . '</span>
                </div>
            </div>

            <div class="footer">
                <p>This is a computer-generated statement. No signature required.</p>
                <p>For questions about this statement, please contact us at ' . $companyEmail . '</p>
            </div>
        </body>
        </html>';

        return $html;
    }
}
