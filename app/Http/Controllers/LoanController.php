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
            // Comment out API request code
            // $clientIdentifier = auth()->user()->identifier;
            // $response = Http::withToken($this->apiToken)
            //     ->get("{$this->apiUrl}/lending/cbu?client_identifier={$clientIdentifier}");

            // if (!$response->successful()) {
            //     throw new \Exception('API request failed: ' . $response->body());
            // }

            // $cbuFunds = $response->json()['data']['cbu_funds'];
            // $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            // Dummy data
            $dummyCbuFunds = [
                [
                    'id' => 1,
                    'member_name' => 'John Doe',
                    'initial_contribution' => '5000.00',
                    'current_balance' => '7500.00',
                    'total_withdrawn' => '0.00',
                    'interest_earned' => '2500.00',
                    'status' => 'active',
                    'last_contribution_date' => '2024-03-15',
                    'date_joined' => '2024-01-01',
                    'withdrawal_count' => 0,
                    'created_at' => '2024-01-01 00:00:00',
                    'updated_at' => '2024-03-15 00:00:00'
                ],
                [
                    'id' => 2,
                    'member_name' => 'Jane Smith',
                    'initial_contribution' => '10000.00',
                    'current_balance' => '12500.00',
                    'total_withdrawn' => '0.00',
                    'interest_earned' => '2500.00',
                    'status' => 'active',
                    'last_contribution_date' => '2024-03-15',
                    'date_joined' => '2024-01-15',
                    'withdrawal_count' => 0,
                    'created_at' => '2024-01-15 00:00:00',
                    'updated_at' => '2024-03-15 00:00:00'
                ],
                [
                    'id' => 3,
                    'member_name' => 'Bob Johnson',
                    'initial_contribution' => '20000.00',
                    'current_balance' => '22000.00',
                    'total_withdrawn' => '5000.00',
                    'interest_earned' => '2000.00',
                    'status' => 'inactive',
                    'last_contribution_date' => '2024-02-01',
                    'date_joined' => '2024-02-01',
                    'withdrawal_count' => 1,
                    'created_at' => '2024-02-01 00:00:00',
                    'updated_at' => '2024-03-15 00:00:00'
                ]
            ];

            $dummyAppCurrency = [
                'symbol' => '₱',
                'code' => 'PHP',
                'name' => 'Philippine Peso'
            ];

            return Inertia::render('Loan/Cbu', [
                'cbuFunds' => $dummyCbuFunds,
                'appCurrency' => $dummyAppCurrency
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
            'member_name' => 'required|string',
            'initial_contribution' => 'required|numeric|min:0',
            'contribution_frequency' => 'required|in:monthly,quarterly,annually',
            'payment_method' => 'required|in:cash,bank_transfer,check'
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
            'member_name' => 'required|string',
            'contribution_frequency' => 'required|in:monthly,quarterly,annually',
            'status' => 'required|in:active,inactive'
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
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,check',
            'reference_number' => 'nullable|string'
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/lending/cbu/{$id}/contribution", [
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
                ->get("{$this->apiUrl}/lending/cbu/{$id}/contributions?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error getting CBU contributions: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get CBU contributions.'], 500);
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
            return response()->json(['error' => 'Failed to get CBU withdrawal form.'], 500);
        }
    }

    public function processCbuWithdrawal(Request $request, string $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'withdrawal_date' => 'required|date',
            'reason' => 'required|string',
            'payment_method' => 'required|in:cash,bank_transfer,check',
            'account_details' => 'required_if:payment_method,bank_transfer|string|nullable'
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/lending/cbu/{$id}/withdraw", [
                    ...$validated,
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error processing CBU withdrawal: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process CBU withdrawal.'], 500);
        }
    }

    public function getCbuHistory(string $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending/cbu/{$id}/history?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error getting CBU history: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get CBU history.'], 500);
        }
    }

    public function generateCbuReport()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending/cbu/report?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $report = $response->json()['data']['report'];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('Loan/CbuReport', [
                'report' => $report,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating CBU report: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate CBU report.'], 500);
        }
    }
}
