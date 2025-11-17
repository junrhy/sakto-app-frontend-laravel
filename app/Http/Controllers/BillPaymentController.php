<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Mail\BillPaymentNotification;

class BillPaymentController extends Controller
{
    protected $apiUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the bill payments page.
     */
    public function index()
    {
        return Inertia::render('BillPayment/Index');
    }

    /**
     * Get bill payments from API.
     */
    public function getBillPayments(Request $request)
    {
        try {
            $params = $request->all();
            $params['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/bill-payments", $params);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch bill payments'
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching bill payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bill payment statistics from API.
     */
    public function getStatistics(Request $request)
    {
        try {
            $params = $request->all();
            $params['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/bill-payments/statistics", $params);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics'
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get overdue bills from API.
     */
    public function getOverdueBills(Request $request)
    {
        try {
            $params = $request->all();
            $params['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/bill-payments/overdue", $params);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch overdue bills'
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching overdue bills',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get upcoming bills from API.
     */
    public function getUpcomingBills(Request $request)
    {
        try {
            $params = $request->all();
            $params['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/bill-payments/upcoming", $params);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming bills'
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching upcoming bills',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new bill payment via API.
     */
    public function store(Request $request)
    {
        try {
            $data = $request->all();
            $data['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/bill-payments", $data);
            if ($response->successful()) {
                $responseData = $response->json();
                
                // Send email notification to customer
                if (isset($responseData['data']) && isset($data['email']) && !empty($data['email'])) {
                    try {
                        $billPayment = $responseData['data'];
                        $customerEmail = $data['email'];
                        $customerName = $billPayment['customer_name'] ?? $data['customer_name'] ?? 'Customer';
                        
                        Mail::to($customerEmail)->send(
                            new BillPaymentNotification($billPayment, $customerEmail, $customerName)
                        );
                        
                        Log::info('Bill payment notification email sent', [
                            'bill_id' => $billPayment['id'] ?? null,
                            'email' => $customerEmail,
                            'is_recurring' => $billPayment['is_recurring'] ?? false,
                        ]);
                    } catch (\Exception $e) {
                        // Log error but don't fail the request
                        Log::error('Failed to send bill payment notification email', [
                            'error' => $e->getMessage(),
                            'bill_data' => $responseData['data'] ?? null,
                            'email' => $data['email'] ?? null,
                        ]);
                    }
                }
                
                // Send email notification if a new recurring bill was created
                if (isset($responseData['next_recurring_bill']) && 
                    isset($responseData['next_recurring_bill']['email']) && 
                    !empty($responseData['next_recurring_bill']['email'])) {
                    try {
                        $nextBill = $responseData['next_recurring_bill'];
                        $customerEmail = $nextBill['email'];
                        $customerName = $nextBill['customer_name'] ?? 'Customer';
                        
                        Mail::to($customerEmail)->send(
                            new BillPaymentNotification($nextBill, $customerEmail, $customerName)
                        );
                        
                        Log::info('Recurring bill payment notification email sent (from create)', [
                            'bill_id' => $nextBill['id'] ?? null,
                            'email' => $customerEmail,
                            'frequency' => $nextBill['recurring_frequency'] ?? null,
                        ]);
                    } catch (\Exception $e) {
                        // Log error but don't fail the request
                        Log::error('Failed to send recurring bill payment notification email (from create)', [
                            'error' => $e->getMessage(),
                            'bill_data' => $responseData['next_recurring_bill'] ?? null,
                        ]);
                    }
                }
                
                return response()->json($responseData);
            }
            return response()->json([
                'success' => false,
                'message' => 'Failed to create bill payment',
                'errors' => $response->json()['errors'] ?? null
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating bill payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific bill payment from API.
     */
    public function show($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/bill-payments/{$id}");

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch bill payment'
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching bill payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a bill payment via API.
     */
    public function update(Request $request, $id)
    {
        try {
            $data = $request->all();
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/bill-payments/{$id}", $data);

            if ($response->successful()) {
                $responseData = $response->json();
                
                // Send email notification if a new recurring bill was created
                if (isset($responseData['next_recurring_bill']) && 
                    isset($responseData['next_recurring_bill']['email']) && 
                    !empty($responseData['next_recurring_bill']['email'])) {
                    try {
                        $nextBill = $responseData['next_recurring_bill'];
                        $customerEmail = $nextBill['email'];
                        $customerName = $nextBill['customer_name'] ?? 'Customer';
                        
                        Mail::to($customerEmail)->send(
                            new BillPaymentNotification($nextBill, $customerEmail, $customerName)
                        );
                        
                        Log::info('Recurring bill payment notification email sent', [
                            'bill_id' => $nextBill['id'] ?? null,
                            'email' => $customerEmail,
                            'frequency' => $nextBill['recurring_frequency'] ?? null,
                        ]);
                    } catch (\Exception $e) {
                        // Log error but don't fail the request
                        Log::error('Failed to send recurring bill payment notification email', [
                            'error' => $e->getMessage(),
                            'bill_data' => $responseData['next_recurring_bill'] ?? null,
                        ]);
                    }
                }
                
                return response()->json($responseData);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to update bill payment',
                'errors' => $response->json()['errors'] ?? null
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating bill payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a bill payment via API.
     */
    public function destroy($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/bill-payments/{$id}");

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete bill payment'
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting bill payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update bill status via API.
     */
    public function bulkUpdateStatus(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/bill-payments/bulk-update-status", $request->all());

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk update status',
                'errors' => $response->json()['errors'] ?? null
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error bulk updating status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete bills via API.
     */
    public function bulkDelete(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/bill-payments/bulk-delete", $request->all());

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk delete bills',
                'errors' => $response->json()['errors'] ?? null
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error bulk deleting bills',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get billers from API.
     */
    public function getBillers(Request $request)
    {
        try {
            $params = $request->all();
            $params['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/billers", $params);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch billers'
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching billers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
