<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CreditsController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
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
                    'price' => 100.00,
                    'popular' => false,
                ],
                [
                    'id' => 2,
                    'name' => '500 Credits',
                    'credits' => 500,
                    'price' => 450.00,
                    'popular' => true,
                    'savings' => '10%',
                ],
                [
                    'id' => 3,
                    'name' => '1000 Credits',
                    'credits' => 1000,
                    'price' => 800.00,
                    'popular' => false,
                    'savings' => '20%',
                ],
            ],
            'paymentMethods' => [
                [
                    'id' => 1,
                    'name' => 'GCash',
                    'accountName' => 'Jun Rhy Crodua',
                    'accountNumber' => '09260049848',
                ],
                [
                    'id' => 2,
                    'name' => 'Maya',
                    'accountName' => 'Jun Rhy Crodua',
                    'accountNumber' => '09260049848',
                ],
                [
                    'id' => 4,
                    'name' => 'Bank Transfer',
                    'accountName' => 'Jun Rhy Crodua',
                    'accountNumber' => '006996000660',
                    'bankName' => 'BDO'
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
        
        $clientIdentifier = auth()->user()->identifier;
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
