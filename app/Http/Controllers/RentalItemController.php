<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RentalItemController extends Controller
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
                ->get("{$this->apiUrl}/rental-items", [
                    'client_identifier' => $clientIdentifier
                ]);

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to Rental Items API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $items = $response->json()['data'];
            $payments = [];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('RentalItem', [
                'initialItems' => $items,
                'initialPayments' => $payments,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching rental items: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch rental items.'], 500);
        }
    }

    public function getItems(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/rental-items', [
                    'search' => $request->search,
                    'page' => $request->page,
                    'per_page' => $request->per_page,
                    'client_identifier' => $clientIdentifier
                ]);

            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch items'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge(['client_identifier' => $clientIdentifier]);
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/rental-items', $request->all());

            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create item'], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put($this->apiUrl . '/rental-items/' . $id, $request->all());
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update item'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete($this->apiUrl . '/rental-items/' . $id);
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete item'], 500);
        }
    }

    public function bulkDestroy(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/rental-items/bulk-delete', [
                    'ids' => $request->ids
                ]);
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete items'], 500);
        }
    }

    public function recordPayment(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/rental-items/' . $id . '/payment', [
                    'amount' => $request->amount,
                    'payment_date' => $request->payment_date,
                    'notes' => $request->notes,
                    'client_identifier' => auth()->user()->identifier
                ]);
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to record payment'], 500);
        }
    }

    public function getPaymentHistory($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/rental-items/' . $id . '/payment-history');
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch payment history'], 500);
        }
    }
}