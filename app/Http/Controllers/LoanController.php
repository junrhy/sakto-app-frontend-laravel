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
        $this->apiUrl = env('API_URL');
        $this->apiToken = env('API_TOKEN');
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
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('Loan', [
                'initialLoans' => $loans,
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
            'borrowerName' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'interestRate' => 'required|numeric|min:0',
            'startDate' => 'required|date',
            'endDate' => 'required|date|after:startDate',
            'compoundingFrequency' => 'required|in:daily,monthly,quarterly,annually',
            'status' => 'required|in:active,paid,defaulted'
        ]);

        // For now, just return the validated data with a new ID
        return response()->json([
            'id' => time(),
            ...$validated,
            'paidAmount' => 0,
            'payments' => [],
            'overpaymentBalance' => 0
        ]);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'borrowerName' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'interestRate' => 'required|numeric|min:0',
            'startDate' => 'required|date',
            'endDate' => 'required|date|after:startDate',
            'compoundingFrequency' => 'required|in:daily,monthly,quarterly,annually',
            'status' => 'required|in:active,paid,defaulted'
        ]);

        return response()->json([
            'id' => $id,
            ...$validated,
            'paidAmount' => $request->input('paidAmount', 0),
            'payments' => $request->input('payments', []),
            'overpaymentBalance' => $request->input('overpaymentBalance', 0)
        ]);
    }

    public function destroy(string $id)
    {
        return response()->json(['success' => true]);
    }

    public function bulkDestroy(Request $request)
    {
        return response()->json(['success' => true]);
    }

    public function recordPayment(Request $request, string $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0'
        ]);

        return response()->json([
            'success' => true,
            'payment' => [
                'id' => time(),
                'date' => now()->toDateString(),
                'amount' => $validated['amount']
            ]
        ]);
    }
}