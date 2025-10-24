<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Services\LemonSqueezyPaymentService;

class CreditsController extends Controller
{
    protected $apiUrl, $apiToken;
    protected $lemonSqueezyPaymentService;

    public function __construct(LemonSqueezyPaymentService $lemonSqueezyPaymentService)
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
        $this->lemonSqueezyPaymentService = $lemonSqueezyPaymentService;
    }

    public function buy()
    {
        $clientIdentifier = auth()->user()->identifier;
        $paymentHistory = [];

        $historyResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/credits/{$clientIdentifier}/history");

        if ($historyResponse->successful()) {
            $paymentHistory = $historyResponse->json() ?? [];
        }

        return Inertia::render('Credits/Buy', [
            'packages' => [
                [
                    'id' => 1,
                    'name' => '100 Credits',
                    'credits' => 100,
                    'price' => 2.99,
                    'popular' => false,
                    'lemon_squeezy_variant_id' => '1035913',
                ],
                [
                    'id' => 2,
                    'name' => '500 Credits',
                    'credits' => 500,
                    'price' => 8.99,
                    'popular' => true,
                    'savings' => '40%',
                    'lemon_squeezy_variant_id' => '1035919',
                ],
                [
                    'id' => 3,
                    'name' => '1000 Credits',
                    'credits' => 1000,
                    'price' => 14.99,
                    'popular' => false,
                    'savings' => '50%',
                    'lemon_squeezy_variant_id' => '1035920',
                ],
                [
                    'id' => 4,
                    'name' => '2500 Credits',
                    'credits' => 2500,
                    'price' => 29.99,
                    'popular' => false,
                    'savings' => '60%',
                    'lemon_squeezy_variant_id' => '1035921',
                ],
            ],
            'paymentMethods' => [
                [
                    'id' => 'card',
                    'name' => 'Credit Card / Debit Card',
                    'accountName' => 'Lemon Squeezy',
                    'accountNumber' => 'Secure online payment',
                    'type' => 'online'
                ],
            ],
            'paymentHistory' => $paymentHistory
        ]);
    }

    public function getBalance($clientIdentifier)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/credits/{$clientIdentifier}/balance");

        if (!$response->successful()) {
            // If credit record not found (404), return 0 credits instead of error
            if ($response->status() === 404) {
                return response()->json([
                    'available_credit' => 0,
                    'pending_credit' => 0,
                    'total_credit' => 0
                ]);
            }
            
            return response()->json([
                'error' => $response->json()['message'] ?? 'Failed to fetch credit balance'
            ], $response->status());
        }

        return response()->json($response->json());
    }

    public function requestCredit(Request $request)
    {
        $user = auth()->user();
        
        // Check if payment method is card (Lemon Squeezy)
        if ($request->payment_method === 'Credit Card / Debit Card') {
            return $this->handleCardPayment($request, $user);
        }
        
        // Handle manual payment methods (Bank Transfer, etc.)
        $validated = $request->validate([
            'package_name' => 'required|string',
            'package_credit' => 'required|numeric|min:0',
            'package_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'payment_method_details' => 'nullable|string',
            'amount_sent' => 'required|numeric|min:0',
            'transaction_id' => 'required|string',
            'proof_of_payment' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('proof_of_payment')) {
            $path = $request->file('proof_of_payment')->store('proof_of_payment', 'public');
            $validated['proof_of_payment'] = Storage::disk('public')->url($path);
        }
        
        $clientIdentifier = $user->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/credits/request", $validated);

        if (!$response->successful()) {
            return response()->json([
                'error' => 'Failed to submit credit request'
            ], $response->status());
        }

        return response()->json($response->json());
    }
    
    /**
     * Handle credit card payment via Lemon Squeezy
     */
    protected function handleCardPayment(Request $request, $user)
    {
        $validated = $request->validate([
            'package_name' => 'required|string',
            'package_credit' => 'required|numeric|min:0',
            'package_amount' => 'required|numeric|min:0',
            'lemon_squeezy_variant_id' => 'required|string',
        ]);
        
        try {
            // Generate a unique reference number
            $referenceNumber = $this->lemonSqueezyPaymentService->generateReferenceNumber();
            
            // Build success URL with package details
            $successUrl = route('credits.payment.success', [
                'reference' => $referenceNumber,
                'credits' => $validated['package_credit'],
                'amount' => $validated['package_amount'],
                'package' => $validated['package_name'],
            ]);
            
            // Prepare checkout data
            $checkoutData = [
                'variant_id' => $validated['lemon_squeezy_variant_id'],
                'reference_number' => $referenceNumber,
                'plan_id' => null,
                'plan_name' => $validated['package_name'],
                'plan_description' => $validated['package_credit'] . ' credits package',
                'user_identifier' => $user->identifier,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'auto_renew' => false,
                'package_credit' => $validated['package_credit'],
                'package_amount' => $validated['package_amount'],
                'success_url' => $successUrl,
                'cancel_url' => route('credits.payment.cancel'),
            ];
            
            // Create one-time checkout  
            $checkoutResult = $this->lemonSqueezyPaymentService->createCheckout($user, $checkoutData);
            
            if (!$checkoutResult['success']) {
                return response()->json([
                    'error' => $checkoutResult['message']
                ], 500);
            }
            
            // Return the checkout URL for redirect
            return response()->json([
                'success' => true,
                'checkout_url' => $checkoutResult['checkout_url'],
                'reference' => $referenceNumber,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Lemon Squeezy credit payment failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'exception' => $e
            ]);
            
            return response()->json([
                'error' => 'An error occurred while processing your payment. Please try again later.'
            ], 500);
        }
    }
    
    /**
     * Handle successful credit payment from Lemon Squeezy
     */
    public function creditPaymentSuccess(Request $request)
    {
        $reference = $request->query('reference');
        $packageCredit = $request->query('credits');
        $packageAmount = $request->query('amount');
        $packageName = $request->query('package');
        
        if (!$reference) {
            return redirect()->route('credits.buy')->with('error', 'Invalid payment reference.');
        }
        
        try {
            // Check if credits were already added (via webhook or previous request)
            $user = auth()->user();
            $checkResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/credits/{$user->identifier}/history");
            
            if ($checkResponse->successful()) {
                $history = $checkResponse->json();
                $alreadyProcessed = collect($history)->contains(function ($item) use ($reference) {
                    return ($item['transaction_id'] ?? '') === $reference;
                });
                
                if ($alreadyProcessed) {
                    // Credits already added by webhook
                    return redirect()->route('credits.buy')->with('success', 'Payment successful! ' . $packageCredit . ' credits have been added to your account.');
                }
            }
            
            // Add credits to user's account via API (fallback if webhook didn't process)
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/credits/add", [
                    'client_identifier' => $user->identifier,
                    'amount' => $packageCredit,
                    'source' => 'purchase',
                    'reference_id' => $reference,
                    'package_amount' => $packageAmount,
                ]);
            
            if ($response->successful()) {
                return redirect()->route('credits.buy')->with('success', 'Payment successful! ' . $packageCredit . ' credits have been added to your account.');
            } else {
                Log::error('Failed to add credits after successful payment', [
                    'reference' => $reference,
                    'response' => $response->body(),
                ]);
                
                return redirect()->route('credits.buy')->with('error', 'Payment was successful but failed to add credits. Please contact support with reference: ' . $reference);
            }
        } catch (\Exception $e) {
            Log::error('Credit payment success handling failed: ' . $e->getMessage(), [
                'reference' => $reference,
                'exception' => $e
            ]);
            
            return redirect()->route('credits.buy')->with('error', 'An error occurred. Please contact support with reference: ' . $reference);
        }
    }
    
    /**
     * Handle cancelled credit payment from Lemon Squeezy
     */
    public function creditPaymentCancel(Request $request)
    {
        return redirect()->route('credits.buy')->with('error', 'Payment was cancelled. You can try again whenever you\'re ready.');
    }

    public function getCreditHistory($clientIdentifier)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/credits/{$clientIdentifier}/history");

        if (!$response->successful()) {
            return response()->json([
                'error' => 'Failed to fetch credit history'
            ], $response->status());
        }

        return response()->json($response->json());
    }

    public function spendCredit(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'purpose' => 'required|string',
            'reference_id' => 'required|string'
        ]);
        
        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/credits/spend", $validated);

        if (!$response->successful()) {
            return response()->json([
                'error' => $response->json()['message'] ?? 'Failed to spend credits'
            ], $response->status());
        }

        return response()->json($response->json());
    }

    public function getSpentCreditHistory($clientIdentifier)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/credits/{$clientIdentifier}/spent-history");

        if (!$response->successful()) {
            return response()->json([
                'error' => 'Failed to fetch spent credit history'
            ], $response->status());
        }

        return Inertia::render('Credits/History', [
            'history' => $response->json()
        ]);
    }
}
