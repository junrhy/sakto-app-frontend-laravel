<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class FnbPublicController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Show the public menu page for customers (QR code landing page)
     */
    public function menu(Request $request)
    {
        $tableId = $request->query('table');
        $customerName = $request->query('customer');
        $clientIdentifier = $request->query('client');

        try {
            $table = null;
            $menuItems = [];

            // Fetch table information if table ID provided
            if ($tableId && $clientIdentifier) {
                $tableResponse = Http::withToken($this->apiToken)
                    ->get("{$this->apiUrl}/fnb-public/table-info", [
                        'table_id' => $tableId,
                        'client_identifier' => $clientIdentifier
                    ]);

                if ($tableResponse->successful()) {
                    $table = $tableResponse->json()['data'] ?? null;
                }
            }

            // Fetch menu items
            if ($clientIdentifier) {
                $menuResponse = Http::withToken($this->apiToken)
                    ->get("{$this->apiUrl}/fnb-public/menu", [
                        'client_identifier' => $clientIdentifier
                    ]);

                if ($menuResponse->successful()) {
                    $menuItems = $menuResponse->json()['data'] ?? [];
                }
            }

            return Inertia::render('Public/Fnb/Menu', [
                'table' => $table,
                'menuItems' => $menuItems,
                'clientIdentifier' => $clientIdentifier,
                'customerName' => $customerName
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Public/Fnb/Menu', [
                'table' => null,
                'menuItems' => [],
                'clientIdentifier' => $clientIdentifier ?? '',
                'error' => 'Failed to load menu. Please try again.'
            ]);
        }
    }

    /**
     * Submit a customer order (proxy to backend API)
     */
    public function submitOrder(Request $request)
    {
        try {
            \Log::info('Customer order received at frontend', [
                'data' => $request->all()
            ]);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-public/customer-order", $request->all());

            \Log::info('Backend API response', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            \Log::error('Failed to submit customer order', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to submit order. Please try again.'
            ], 500);
        }
    }
}
