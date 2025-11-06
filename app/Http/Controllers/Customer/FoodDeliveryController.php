<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class FoodDeliveryController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display restaurant listing
     */
    public function index()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-restaurants", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $restaurants = $response->json()['data'] ?? [];

            return Inertia::render('Customer/FoodDelivery/Index', [
                'restaurants' => $restaurants,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Customer/FoodDelivery/Index', [
                'restaurants' => [],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Display restaurant menu
     */
    public function restaurant($id)
    {
        try {
            $restaurantResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-restaurants/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$restaurantResponse->successful()) {
                throw new \Exception('API request failed: ' . $restaurantResponse->body());
            }

            $restaurant = $restaurantResponse->json()['data'] ?? null;

            if (!$restaurant) {
                abort(404, 'Restaurant not found');
            }

            return Inertia::render('Customer/FoodDelivery/Restaurant', [
                'restaurant' => $restaurant,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Customer/FoodDelivery/Restaurant', [
                'restaurant' => null,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Display cart
     */
    public function cart()
    {
        return Inertia::render('Customer/FoodDelivery/Cart');
    }

    /**
     * Display order details
     */
    public function order($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-orders/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $order = $response->json()['data'] ?? null;

            if (!$order) {
                abort(404, 'Order not found');
            }

            return Inertia::render('Customer/FoodDelivery/Order', [
                'order' => $order,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Customer/FoodDelivery/Order', [
                'order' => null,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Display order history
     */
    public function orders()
    {
        try {
            $params = [
                'client_identifier' => auth()->user()->identifier,
            ];
            
            // Add customer_id if available
            if (auth()->id()) {
                $params['customer_id'] = auth()->id();
            }
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-orders", $params);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $orders = $response->json()['data'] ?? [];
            
            // If no orders found with customer_id, try filtering by email/phone
            if (empty($orders) && auth()->id()) {
                $paramsWithoutCustomerId = [
                    'client_identifier' => auth()->user()->identifier,
                ];
                
                $response2 = Http::withToken($this->apiToken)
                    ->get("{$this->apiUrl}/food-delivery-orders", $paramsWithoutCustomerId);
                
                if ($response2->successful()) {
                    $allOrders = $response2->json()['data'] ?? [];
                    $user = auth()->user();
                    
                    // Filter by email or phone
                    $orders = array_filter($allOrders, function($order) use ($user) {
                        return (
                            (isset($order['customer_email']) && $order['customer_email'] === $user->email) ||
                            (isset($order['customer_phone']) && $order['customer_phone'] === $user->contact_number)
                        );
                    });
                    
                    $orders = array_values($orders); // Re-index array
                }
            }

            return Inertia::render('Customer/FoodDelivery/Orders', [
                'orders' => $orders,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Customer/FoodDelivery/Orders', [
                'orders' => [],
                'error' => $e->getMessage(),
            ]);
        }
    }

    // ==================== CUSTOMER PROXY METHODS ====================

    /**
     * Proxy: Get restaurant details (customer-facing)
     */
    public function restaurantShow($id, Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-restaurants/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Create order
     */
    public function storeOrder(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/food-delivery-orders", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}

