<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LoanController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending?client_identifier={$clientIdentifier}");

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to Loan API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $loans = $response->json()['data']['loans'];
            $payments = $response->json()['data']['loan_payments'];
            $bills = $response->json()['data']['loan_bills'];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('Loan', [
                'initialLoans' => $loans,
                'initialPayments' => $payments,
                'initialBills' => $bills,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching loans: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch loans.'], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'borrower_name' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'interest_rate' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,paid,defaulted',
            'interest_type' => 'required|in:fixed,compounding',
            'compounding_frequency' => 'required_if:interest_type,compounding|in:daily,monthly,quarterly,annually',
            'installment_frequency' => 'in:weekly,bi-weekly,monthly,quarterly,annually|nullable',
            'installment_amount' => 'nullable|numeric|min:0'
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/lending", [
                    ...$validated,
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $loan = $response->json();

            return response()->json($loan);
        } catch (\Exception $e) {
            Log::error('Error storing loan: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to store loan.'], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'borrower_name' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'interest_rate' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,paid,defaulted',
            'interest_type' => 'required|in:fixed,compounding',
            'compounding_frequency' => 'required_if:interest_type,compounding|in:daily,monthly,quarterly,annually',
            'installment_frequency' => 'in:weekly,bi-weekly,monthly,quarterly,annually|nullable',
            'installment_amount' => 'nullable|numeric|min:0'
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/lending/{$id}", [
                    ...$validated,
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $loan = $response->json();
            return response()->json($loan);
        } catch (\Exception $e) {
            Log::error('Error updating loan: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update loan.'], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/lending/{$id}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error deleting loan: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete loan.'], 500);
        }
    }

    public function bulkDestroy(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/lending/bulk-destroy", $request->all());

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error deleting loans: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete loans.'], 500);
        }
    }

    public function recordPayment(Request $request, string $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date'
        ]);

        try {
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/loan-payments/{$id}", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error recording payment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to record payment.'], 500);
        }
    }

    public function deletePayment(string $id, string $paymentId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/loan-payments/{$id}/{$paymentId}");

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error deleting payment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete payment.'], 500);
        }
    }

    public function getBills(string $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/loan-bills/{$id}?client_identifier={$clientIdentifier}");

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error getting bills: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get bills.'], 500);
        }
    }

    public function createBill(Request $request, string $id)
    {
        try {
            $request['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/loan-bills/{$id}", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error creating bill: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create bill.'], 500);
        }
    }

    public function updateBill(Request $request, string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/loan-bills/{$id}", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error updating bill: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update bill.'], 500);
        }
    }

    public function deleteBill(string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/loan-bills/{$id}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error deleting bill: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete bill.'], 500);
        }
    }

    public function updateBillStatus(Request $request, string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->patch("{$this->apiUrl}/loan-bills/{$id}/status", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error updating bill status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update bill status.'], 500);
        }
    }

    public function settings()
    {
        try {
            // $clientIdentifier = auth()->user()->identifier;
            // $response = Http::withToken($this->apiToken)
            //     ->get("{$this->apiUrl}/loan/settings", [
            //         'client_identifier' => $clientIdentifier
            //     ]);

            // if (!$response->successful()) {
            //     throw new \Exception('Failed to fetch loan settings');
            // }

            // Dummy data
            $dummySettings = [
                'data' => [
                    'default_interest_rate' => 5.0,
                    'default_loan_term' => 12, // months
                    'min_loan_amount' => 1000,
                    'max_loan_amount' => 50000,
                    'allowed_payment_methods' => ['cash', 'bank_transfer', 'check'],
                    'late_payment_fee' => 25,
                    'grace_period_days' => 5
                ]
            ];

            return Inertia::render('Loan/Settings', [
                'settings' => $dummySettings['data'],
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load settings');
        }
    }
}
