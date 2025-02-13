<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RentalPropertyController extends Controller
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
                ->get("{$this->apiUrl}/rental-property", [
                    'client_identifier' => $clientIdentifier
                ]);

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to Rental Property API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $properties = $response->json()['data']['properties'];
            $payments = $response->json()['data']['payments'];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('RentalProperty', [
                'initialProperties' => $properties,
                'initialPayments' => $payments,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching rental properties: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch rental properties.'], 500);
        }
    }

    public function getProperties(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/rental-property', [
                    'search' => $request->search,
                    'page' => $request->page,
                    'per_page' => $request->per_page,
                    'client_identifier' => $clientIdentifier
                ]);

            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch properties'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge(['client_identifier' => $clientIdentifier]);
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/rental-property', $request->all());
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create property'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put($this->apiUrl . '/rental-property/' . $id, $request->all());
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update property'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete($this->apiUrl . '/rental-property/' . $id);
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete property'], 500);
        }
    }

    public function bulkDestroy(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/rental-property/bulk', [
                    'ids' => $request->ids
                ]);
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete properties'], 500);
        }
    }

    public function recordPayment(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/rental-property/' . $id . '/payment', [
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
                ->get($this->apiUrl . '/rental-property/' . $id . '/payment-history');
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch payment history'], 500);
        }
    }
}