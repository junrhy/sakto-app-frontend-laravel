<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class ProductOrderController extends Controller
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
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            Log::info('Fetching orders from API', [
                'client_identifier' => $clientIdentifier,
                'api_url' => $this->apiUrl,
                'has_token' => !empty($this->apiToken)
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            Log::info('API response received', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body_length' => strlen($response->body())
            ]);
            
            if (!$response->successful()) {
                Log::error('Failed to fetch orders', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return back()->withErrors(['error' => 'Failed to fetch orders']);
            }

            $orders = $response->json();
            
            Log::info('Orders data processed', [
                'orders_count' => is_array($orders) ? count($orders) : 'not_array',
                'orders_type' => gettype($orders)
            ]);

            return Inertia::render('ProductOrders/Index', [
                'orders' => $orders,
                'currency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in orders index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching orders']);
        }
    }

    public function show($id)
    {
        try {
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders/{$id}");
            
            if (!$response->successful()) {
                return redirect()->route('product-orders.index')
                    ->with('error', 'Order not found');
            }

            return Inertia::render('ProductOrders/Show', [
                'order' => $response->json(),
                'currency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in order show', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching order details']);
        }
    }

    public function edit($id)
    {
        try {
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders/{$id}");
            
            if (!$response->successful()) {
                return redirect()->route('product-orders.index')
                    ->with('error', 'Order not found');
            }

            return Inertia::render('ProductOrders/Edit', [
                'order' => $response->json(),
                'currency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in order edit', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching order details']);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'order_status' => 'nullable|string|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
            'payment_status' => 'nullable|string|in:pending,paid,failed,refunded,partially_refunded',
            'payment_method' => 'nullable|string|in:cash,card,bank_transfer,digital_wallet,cod',
            'payment_reference' => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/product-orders/{$id}", $validated);

        if (!$response->successful()) {
            Log::error('Failed to update order', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return back()->withErrors(['error' => 'Failed to update order']);
        }

        return redirect()->route('product-orders.index')
            ->with('message', 'Order updated successfully');
    }

    public function destroy($id)
    {
        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/product-orders/{$id}");

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to delete order']);
        }

        return redirect()->route('product-orders.index')
            ->with('message', 'Order deleted successfully');
    }

    public function statistics()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders/statistics", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch order statistics']);
            }

            return Inertia::render('ProductOrders/Statistics', [
                'statistics' => $response->json(),
                'currency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in order statistics', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching order statistics']);
        }
    }

    public function processPayment(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|in:cash,card,bank_transfer,digital_wallet',
            'payment_reference' => 'nullable|string|max:255',
        ]);

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/product-orders/{$id}/process-payment", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to process payment']);
        }

        return back()->with('message', 'Payment processed successfully');
    }

    public function getOrders()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch orders'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in get orders', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching orders'], 500);
        }
    }

    public function getRecentOrders()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders/recent", [
                    'client_identifier' => $clientIdentifier,
                    'limit' => 5
                ]);
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch recent orders'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in get recent orders', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching recent orders'], 500);
        }
    }

    public function checkout()
    {
        $jsonAppCurrency = json_decode(auth()->user()->app_currency);
        
        return Inertia::render('ProductOrders/Checkout', [
            'currency' => $jsonAppCurrency
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Product order store request received', [
            'request_data' => $request->all(),
            'user_id' => auth()->id(),
            'user_identifier' => auth()->user()->identifier
        ]);

        $validated = $request->validate([
            'contact_id' => 'nullable|integer',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
            'order_items' => 'required|array|min:1',
            'order_items.*.product_id' => 'required|integer',
            'order_items.*.name' => 'nullable|string',
            'order_items.*.variant_id' => 'nullable|integer',
            'order_items.*.attributes' => 'nullable|array',
            'order_items.*.quantity' => 'required|integer|min:1',
            'order_items.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'shipping_fee' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string|in:cash,card,bank_transfer,digital_wallet,cod',
            'notes' => 'nullable|string',
        ]);

        // Add client_identifier from authenticated user
        $validated['client_identifier'] = auth()->user()->identifier;

        Log::info('Validated order data', [
            'validated_data' => $validated,
            'api_url' => $this->apiUrl
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/product-orders", $validated);

            Log::info('API response received', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'response_body' => $response->json(),
                'api_url' => "{$this->apiUrl}/product-orders"
            ]);

            if (!$response->successful()) {
                Log::error('Failed to create order', [
                    'response' => $response->json(),
                    'status' => $response->status()
                ]);
                return back()->withErrors(['error' => 'Failed to create order']);
            }

            Log::info('Order created successfully', [
                'order_id' => $response->json('id'),
                'redirecting_to' => route('product-orders.index')
            ]);

            return redirect()->route('product-orders.index')
                ->with('message', 'Order created successfully');

        } catch (\Exception $e) {
            Log::error('Exception in order store', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while creating the order']);
        }
    }

    public function publicCheckout(Request $request)
    {
        try {
            $clientIdentifier = $request->query('client_identifier');
            
            if (!$clientIdentifier) {
                return back()->withErrors(['error' => 'Invalid request']);
            }

            // Find user by identifier
            $user = User::where('identifier', $clientIdentifier)->first();
            
            if (!$user) {
                return back()->withErrors(['error' => 'User not found']);
            }

            $jsonAppCurrency = json_decode($user->app_currency ?? '{"symbol": "$", "code": "USD"}');

            return Inertia::render('ProductOrders/PublicCheckout', [
                'currency' => $jsonAppCurrency,
                'member' => $user,
                'client_identifier' => $clientIdentifier
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in public checkout', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while loading checkout']);
        }
    }

    public function publicStore(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
            'order_items' => 'required|array|min:1',
            'order_items.*.product_id' => 'required|integer',
            'order_items.*.name' => 'required|string',
            'order_items.*.variant_id' => 'nullable|integer',
            'order_items.*.attributes' => 'nullable|array',
            'order_items.*.quantity' => 'required|integer|min:1',
            'order_items.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'shipping_fee' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string|in:cash,card,bank_transfer,digital_wallet,cod',
            'notes' => 'nullable|string',
            'client_identifier' => 'required|string',
            'contact_id' => 'nullable|integer',
        ]);

        try {
            // Find user by identifier
            $user = User::where('identifier', $validated['client_identifier'])->first();
            
            if (!$user) {
                return back()->withErrors(['error' => 'User not found']);
            }

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/product-orders", $validated);

            if (!$response->successful()) {
                Log::error('Failed to create public order', [
                    'response' => $response->json(),
                    'status' => $response->status()
                ]);
                return back()->withErrors(['error' => 'Failed to create order']);
            }

            $order = $response->json();

            return redirect()->route('member.public-checkout.success', [
                'member_id' => $user->id,
                'order_id' => $order['id']
            ])->with('message', 'Order created successfully');

        } catch (\Exception $e) {
            Log::error('Exception in public order store', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while creating the order']);
        }
    }

    public function publicCheckoutSuccess(Request $request)
    {
        try {
            $orderId = $request->query('order_id');
            $memberId = $request->query('member_id');
            
            if (!$orderId || !$memberId) {
                return back()->withErrors(['error' => 'Invalid request']);
            }

            // Get order details
            $orderResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders/{$orderId}");
            
            if (!$orderResponse->successful()) {
                return back()->withErrors(['error' => 'Order not found']);
            }

            $order = $orderResponse->json();

            // Find user by ID
            $user = User::find($memberId);
            
            if (!$user) {
                return back()->withErrors(['error' => 'User not found']);
            }

            $jsonAppCurrency = json_decode($user->app_currency ?? '{"symbol": "$", "code": "USD"}');

            return Inertia::render('ProductOrders/PublicCheckoutSuccess', [
                'order' => $order,
                'currency' => $jsonAppCurrency,
                'member' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in public checkout success', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while loading order confirmation']);
        }
    }
} 