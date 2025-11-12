<?php

namespace App\Http\Controllers\Customer;

use App\Models\User;
use App\Models\UserCustomer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class LendingController extends CustomerProjectController
{
    public function index(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        $owner = $this->resolveOwner($project, $ownerIdentifier);
        $owner->app_currency = $this->decodeCurrency($owner->app_currency);
        $this->ensureCustomerAccess($request, $owner);

        $records = [];
        $error = null;

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending", [
                    'client_identifier' => $owner->identifier,
                ]);

            if (!$response->successful()) {
                throw new \RuntimeException('API request failed: ' . $response->body());
            }

            $payload = $response->json();
            $data = $payload['data'] ?? $payload;

            $loans = collect($data['loans'] ?? []);
            $paymentsByLoan = collect($data['loan_payments'] ?? [])
                ->groupBy(fn ($payment) => (string) data_get($payment, 'loan_id'));
            $billsByLoan = collect($data['loan_bills'] ?? [])
                ->groupBy(fn ($bill) => (string) data_get($bill, 'loan_id'));

            $records = $loans
                ->map(function ($loan) use ($paymentsByLoan, $billsByLoan) {
                    $loanId = (string) data_get($loan, 'id');

                    return [
                        'id' => $loanId,
                        'borrower_name' => data_get($loan, 'borrower_name'),
                        'status' => data_get($loan, 'status'),
                        'amount' => (float) data_get($loan, 'amount', 0),
                        'total_balance' => (float) data_get($loan, 'total_balance', 0),
                        'paid_amount' => (float) data_get($loan, 'paid_amount', 0),
                        'interest_rate' => data_get($loan, 'interest_rate'),
                        'interest_type' => data_get($loan, 'interest_type'),
                        'frequency' => data_get($loan, 'frequency'),
                        'installment_frequency' => data_get($loan, 'installment_frequency'),
                        'installment_amount' => data_get($loan, 'installment_amount'),
                        'start_date' => data_get($loan, 'start_date'),
                        'end_date' => data_get($loan, 'end_date'),
                        'contact_number' => data_get($loan, 'borrower_contact_number')
                            ?? data_get($loan, 'contact_number'),
                        'payments' => $paymentsByLoan->get($loanId, collect())
                            ->map(function ($payment) {
                                return [
                                    'id' => data_get($payment, 'id'),
                                    'amount' => (float) data_get($payment, 'amount', 0),
                                    'payment_date' => data_get($payment, 'payment_date'),
                                    'reference_number' => data_get($payment, 'reference_number'),
                                    'method' => data_get($payment, 'payment_method'),
                                ];
                            })
                            ->values()
                            ->all(),
                        'bills' => $billsByLoan->get($loanId, collect())
                            ->map(function ($bill) {
                                return [
                                    'id' => data_get($bill, 'id'),
                                    'amount' => (float) data_get($bill, 'amount', 0),
                                    'due_date' => data_get($bill, 'due_date'),
                                    'status' => data_get($bill, 'status'),
                                ];
                            })
                            ->values()
                            ->all(),
                    ];
                })
                ->values()
                ->all();
        } catch (\Throwable $th) {
            Log::error('Failed to fetch lending records for customer', [
                'project' => $project,
                'owner_id' => $owner->id,
                'customer_id' => $request->user()->id,
                'message' => $th->getMessage(),
            ]);

            $error = 'We were unable to load lending records right now. Please try again later.';
        }

        return Inertia::render('Customer/Lending/Index', [
            'project' => $project,
            'owner' => $this->transformOwner($owner),
            'records' => $records,
            'appCurrency' => $owner->app_currency ?? $this->decodeCurrency($request->user()->app_currency),
            'error' => $error,
            'backUrl' => $this->resolveBackUrl($project, $owner),
        ]);
    }

    public function show(Request $request, string $project, $ownerIdentifier, $loanId): Response
    {
        $this->ensureCustomerProject($request, $project);

        $owner = $this->resolveOwner($project, $ownerIdentifier);
        $owner->app_currency = $this->decodeCurrency($owner->app_currency);
        $this->ensureCustomerAccess($request, $owner);

        $loan = null;
        $payments = [];
        $bills = [];
        $error = null;

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending", [
                    'client_identifier' => $owner->identifier,
                ]);

            if (!$response->successful()) {
                throw new \RuntimeException('API request failed: ' . $response->body());
            }

            $payload = $response->json();
            $data = $payload['data'] ?? $payload;

            $loan = collect($data['loans'] ?? [])
                ->firstWhere('id', (int) $loanId);

            if (!$loan) {
                abort(404, 'Loan not found');
            }

            $principal = (float) data_get($loan, 'amount', 0);
            $paidAmount = (float) data_get($loan, 'paid_amount', 0);

            $loan = [
                'id' => data_get($loan, 'id'),
                'borrower_name' => data_get($loan, 'borrower_name'),
                'status' => data_get($loan, 'status'),
                'amount' => $principal,
                'total_balance' => (float) data_get($loan, 'total_balance', 0),
                'paid_amount' => $paidAmount,
                'interest_rate' => data_get($loan, 'interest_rate'),
                'interest_type' => data_get($loan, 'interest_type'),
                'frequency' => data_get($loan, 'frequency'),
                'installment_frequency' => data_get($loan, 'installment_frequency'),
                'installment_amount' => data_get($loan, 'installment_amount'),
                'start_date' => data_get($loan, 'start_date'),
                'end_date' => data_get($loan, 'end_date'),
                'contact_number' => data_get($loan, 'borrower_contact_number')
                    ?? data_get($loan, 'contact_number'),
                'created_at' => data_get($loan, 'created_at'),
                'updated_at' => data_get($loan, 'updated_at'),
                'total_interest' => data_get($loan, 'total_interest'),
                'principal_balance' => max($principal - $paidAmount, 0),
            ];

            $payments = collect($data['loan_payments'] ?? [])
                ->where('loan_id', (int) $loanId)
                ->map(function ($payment) {
                    return [
                        'id' => data_get($payment, 'id'),
                        'amount' => (float) data_get($payment, 'amount', 0),
                        'payment_date' => data_get($payment, 'payment_date'),
                        'reference_number' => data_get($payment, 'reference_number'),
                        'method' => data_get($payment, 'payment_method'),
                        'created_at' => data_get($payment, 'created_at'),
                    ];
                })
                ->sortByDesc('payment_date')
                ->values()
                ->all();

            $bills = collect($data['loan_bills'] ?? [])
                ->where('loan_id', (int) $loanId)
                ->map(function ($bill) {
                    return [
                        'id' => data_get($bill, 'id'),
                        'amount' => (float) data_get($bill, 'amount', 0),
                        'due_date' => data_get($bill, 'due_date'),
                        'status' => data_get($bill, 'status'),
                        'created_at' => data_get($bill, 'created_at'),
                    ];
                })
                ->sortByDesc('due_date')
                ->values()
                ->all();
        } catch (\Throwable $th) {
            Log::error('Failed to fetch lending details for customer', [
                'project' => $project,
                'owner_id' => $owner->id,
                'loan_id' => $loanId,
                'customer_id' => $request->user()->id,
                'message' => $th->getMessage(),
            ]);

            $error = 'We were unable to load this loan right now. Please try again later.';
        }

        return Inertia::render('Customer/Lending/Show', [
            'project' => $project,
            'owner' => $this->transformOwner($owner),
            'loan' => $loan,
            'payments' => $payments,
            'bills' => $bills,
            'appCurrency' => $owner->app_currency ?? $this->decodeCurrency($request->user()->app_currency),
            'error' => $error,
            'backUrl' => $this->resolveBackUrl($project, $owner),
        ]);
    }

    private function ensureCustomerAccess(Request $request, User $owner): void
    {
        if ($owner->project_identifier === 'community') {
            $hasMembership = UserCustomer::where('user_id', $owner->id)
                ->where('customer_id', $request->user()->id)
                ->where('relationship_type', 'member')
                ->exists();

            if (!$hasMembership) {
                abort(403, 'You must be a member of this community to view these records.');
            }
        }
    }

    private function transformOwner(User $owner): array
    {
        return [
            'id' => $owner->id,
            'name' => $owner->name,
            'slug' => $owner->slug,
            'identifier' => $owner->identifier,
            'project_identifier' => $owner->project_identifier,
        ];
    }

    private function resolveBackUrl(string $project, User $owner): string
    {
        if ($project === 'community') {
            $identifier = $owner->slug ?? $owner->identifier ?? $owner->id;

            return route('customer.communities.show', $identifier);
        }

        return route('customer.dashboard');
    }
}


