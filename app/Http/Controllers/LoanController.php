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
            'frequency' => 'required|in:daily,monthly,quarterly,annually',
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
            'frequency' => 'required|in:daily,monthly,quarterly,annually',
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

    // CBU (Capital Build Up) Methods
    public function getCbuFunds()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending/cbu?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $cbuFunds = $response->json()['data']['cbu_funds'];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('Loan/Cbu', [
                'cbuFunds' => $cbuFunds,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching CBU funds: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch CBU funds.'], 500);
        }
    }

    public function cbuSettings()
    {
        try {
            $dummySettings = [
                'data' => [
                    'min_contribution' => 100,
                    'max_contribution' => 50000,
                    'interest_rate' => 2.5,
                    'withdrawal_fee' => 50,
                    'allowed_payment_methods' => ['cash', 'bank_transfer', 'check'],
                    'contribution_frequency' => ['monthly', 'quarterly', 'annually'],
                    'min_withdrawal_amount' => 1000,
                    'max_withdrawal_amount' => 50000,
                    'withdrawal_processing_days' => 3
                ]
            ];

            return Inertia::render('Loan/CbuSettings', [
                'settings' => $dummySettings['data'],
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load CBU settings');
        }
    }

    public function storeCbuFund(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'value_per_share' => 'required|numeric|min:0',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/lending/cbu", [
                    ...$validated,
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error storing CBU fund: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to store CBU fund.'], 500);
        }
    }

    public function updateCbuFund(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'numeric|min:0',
            'start_date' => 'date',
            'end_date' => 'nullable|date|after:start_date',
            'value_per_share' => 'numeric|min:0',
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/lending/cbu/{$id}", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error updating CBU fund: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update CBU fund.'], 500);
        }
    }

    public function destroyCbuFund(string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/lending/cbu/{$id}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error deleting CBU fund: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete CBU fund.'], 500);
        }
    }

    public function addCbuContribution(Request $request, string $id)
    {
        $validated = $request->validate([
            'cbu_fund_id' => 'required',
            'amount' => 'required|numeric|min:0',
            'contribution_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/lending/cbu/{$id}/contributions", [
                    ...$validated,
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error adding CBU contribution: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add CBU contribution.'], 500);
        }
    }

    public function getCbuContributions(string $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending/cbu/{$id}/contributions", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error getting CBU contributions: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getCbuWithdrawals(string $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending/cbu/{$id}/withdrawals", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error getting CBU withdrawals: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function withdrawCbuFund(string $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending/cbu/{$id}/withdraw?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $cbuFund = $response->json()['data']['cbu_fund'];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('Loan/CbuWithdraw', [
                'cbuFund' => $cbuFund,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting CBU withdrawal form: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function processCbuWithdrawal(Request $request, string $id)
    {
        $validated = $request->validate([
            'cbu_fund_id' => 'required',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'withdrawal_date' => 'required|date',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/lending/cbu/{$id}/process-withdrawal", [
                    ...$validated,
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error processing CBU withdrawal: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getCbuHistory(string $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending/cbu/{$id}/history", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error getting CBU history: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get CBU history.'], 500);
        }
    }

    public function getCbuDividends(string $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending/cbu/{$id}/dividends?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error fetching CBU dividends: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch CBU dividends.'], 500);
        }
    }

    public function addCbuDividend(Request $request, string $id)
    {
        $validated = $request->validate([
            'cbu_fund_id' => 'required',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'dividend_date' => 'required|date',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/lending/cbu/{$id}/dividend", [
                    ...$validated,
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error adding CBU dividend: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function generateCbuReport(Request $request)
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
            ]);

            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending/cbu/report", [
                    'client_identifier' => $clientIdentifier,
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date']
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $reportData = $response->json();
            
            // Add dividend-related statistics to the report
            $reportData['total_dividends'] = $reportData['total_dividends'] ?? '0';
            $reportData['dividend_rate'] = $reportData['total_funds'] > 0 
                ? (($reportData['total_dividends'] / $reportData['total_contributions']) * 100) 
                : 0;

            return response()->json([
                'data' => $reportData
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating CBU report: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
