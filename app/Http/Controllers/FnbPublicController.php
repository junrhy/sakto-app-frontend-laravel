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

    /**
     * Show the public online store page
     */
    public function onlineStore(Request $request, $domain)
    {
        try {
            // Fetch online store information
            $storeResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-public/online-store", [
                    'domain' => $domain
                ]);

            if (!$storeResponse->successful()) {
                return Inertia::render('Public/Fnb/OnlineStoreNotFound', [
                    'domain' => $domain
                ]);
            }

            $store = $storeResponse->json()['data'] ?? null;
            if (!$store) {
                return Inertia::render('Public/Fnb/OnlineStoreNotFound', [
                    'domain' => $domain
                ]);
            }

            return Inertia::render('Public/Fnb/OnlineStore', [
                'store' => $store,
                'domain' => $domain
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to load online store', [
                'domain' => $domain,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Public/Fnb/OnlineStoreNotFound', [
                'domain' => $domain
            ]);
        }
    }

    /**
     * Show the online store menu page
     */
    public function onlineStoreMenu(Request $request, $domain)
    {
        try {
            // Fetch online store and menu items
            $storeResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-public/online-store", [
                    'domain' => $domain
                ]);

            if (!$storeResponse->successful()) {
                return Inertia::render('Public/Fnb/OnlineStoreNotFound', [
                    'domain' => $domain
                ]);
            }

            $store = $storeResponse->json()['data'] ?? null;
            if (!$store) {
                return Inertia::render('Public/Fnb/OnlineStoreNotFound', [
                    'domain' => $domain
                ]);
            }

            // Fetch menu items for this store
            $menuResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-public/online-store/{$store['id']}/menu", [
                    'domain' => $domain
                ]);

            $menuItems = [];
            if ($menuResponse->successful()) {
                $menuItems = $menuResponse->json()['data'] ?? [];
            }

            return Inertia::render('Public/Fnb/OnlineStoreMenu', [
                'store' => $store,
                'menuItems' => $menuItems,
                'domain' => $domain
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to load online store menu', [
                'domain' => $domain,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Public/Fnb/OnlineStoreNotFound', [
                'domain' => $domain
            ]);
        }
    }

    /**
     * Submit an online store order
     */
    public function submitOnlineOrder(Request $request, $domain)
    {
        try {
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email|max:255',
                'customer_phone' => 'required|string|max:20',
                'delivery_address' => 'required|string',
                'items' => 'required|array',
                'items.*.id' => 'required|integer',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
                'delivery_fee' => 'nullable|numeric|min:0',
                'tax_amount' => 'nullable|numeric|min:0',
                'total_amount' => 'required|numeric|min:0',
            ]);

            $validated['domain'] = $domain;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-public/online-order", $validated);

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $response->json()['message'] ?? 'Failed to submit order'
                ], $response->status());
            }

            $orderData = $response->json()['data'] ?? null;
            
            return response()->json([
                'status' => 'success',
                'message' => 'Order submitted successfully',
                'data' => $orderData
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to submit online order', [
                'domain' => $domain,
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

    /**
     * Show order status page
     */
    public function orderStatus(Request $request, $domain, $orderNumber)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-public/online-order/{$orderNumber}", [
                    'domain' => $domain
                ]);

            if (!$response->successful()) {
                return Inertia::render('Public/Fnb/OrderNotFound', [
                    'domain' => $domain,
                    'orderNumber' => $orderNumber
                ]);
            }

            $order = $response->json()['data'] ?? null;
            if (!$order) {
                return Inertia::render('Public/Fnb/OrderNotFound', [
                    'domain' => $domain,
                    'orderNumber' => $orderNumber
                ]);
            }

            return Inertia::render('Public/Fnb/OrderStatus', [
                'order' => $order,
                'domain' => $domain,
                'orderNumber' => $orderNumber
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to load order status', [
                'domain' => $domain,
                'orderNumber' => $orderNumber,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Public/Fnb/OrderNotFound', [
                'domain' => $domain,
                'orderNumber' => $orderNumber
            ]);
        }
    }
}
