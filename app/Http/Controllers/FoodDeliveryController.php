<?php

namespace App\Http\Controllers;

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

            return Inertia::render('FoodDelivery/Index', [
                'restaurants' => $restaurants,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
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

            return Inertia::render('FoodDelivery/Restaurant', [
                'restaurant' => $restaurant,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display cart
     */
    public function cart()
    {
        return Inertia::render('FoodDelivery/Cart');
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

            return Inertia::render('FoodDelivery/Order', [
                'order' => $order,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display order tracking (public)
     */
    public function track($reference = null)
    {
        return Inertia::render('FoodDelivery/Track', [
            'reference' => $reference,
        ]);
    }

    /**
     * Display order history
     */
    public function orders()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-orders", [
                    'client_identifier' => auth()->user()->identifier,
                    'customer_id' => auth()->id(),
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $orders = $response->json()['data'] ?? [];

            return Inertia::render('FoodDelivery/Orders', [
                'orders' => $orders,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ==================== PROXY METHODS ====================

    /**
     * Proxy: Get restaurants list
     */
    public function restaurantsList(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-restaurants", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Get restaurant details
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
     * Proxy: Get menu items
     */
    public function menuItems(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-menu/items", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Get menu categories
     */
    public function menuCategories(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-menu/categories", [
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

    /**
     * Proxy: Get order by reference (public)
     */
    public function getOrderByReference($reference)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-orders/track/{$reference}");

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Get orders list
     */
    public function ordersList(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-orders", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Update order status
     */
    public function updateOrderStatus(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/food-delivery-orders/{$id}/update-status", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Assign driver
     */
    public function assignDriver(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/food-delivery-orders/{$id}/assign-driver", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Get drivers list
     */
    public function driversList(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-drivers", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Find nearest driver
     */
    public function findNearestDriver(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-drivers/find-nearest", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Process payment
     */
    public function processPayment(Request $request, $orderId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/food-delivery-payments/order/{$orderId}/process", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ==================== RESTAURANT DASHBOARD ====================

    /**
     * Restaurant Dashboard
     */
    public function restaurantDashboard()
    {
        return Inertia::render('FoodDelivery/Restaurant/Dashboard');
    }

    /**
     * Restaurant Orders
     */
    public function restaurantOrders()
    {
        return Inertia::render('FoodDelivery/Restaurant/Orders');
    }

    /**
     * Restaurant Menu Management
     */
    public function restaurantMenu()
    {
        return Inertia::render('FoodDelivery/Restaurant/Menu');
    }

    /**
     * Restaurant Settings
     */
    public function restaurantSettings()
    {
        return Inertia::render('FoodDelivery/Restaurant/Settings');
    }

    // ==================== ADMIN DASHBOARD ====================

    /**
     * Admin: Restaurants Management
     */
    public function adminRestaurants()
    {
        return Inertia::render('FoodDelivery/Admin/Restaurants');
    }

    /**
     * Admin: Orders Management
     */
    public function adminOrders()
    {
        return Inertia::render('FoodDelivery/Admin/Orders');
    }

    /**
     * Admin: Drivers Management
     */
    public function adminDrivers()
    {
        return Inertia::render('FoodDelivery/Admin/Drivers');
    }

    /**
     * Admin: Centralized Menu Management
     */
    public function adminMenu()
    {
        return Inertia::render('FoodDelivery/Admin/Menu');
    }

    /**
     * Admin: Analytics
     */
    public function adminAnalytics()
    {
        return Inertia::render('FoodDelivery/Admin/Analytics');
    }

    // ==================== DRIVER DASHBOARD ====================

    /**
     * Driver Dashboard
     */
    public function driverDashboard()
    {
        return Inertia::render('FoodDelivery/Driver/Dashboard');
    }

    /**
     * Driver Orders
     */
    public function driverOrders()
    {
        return Inertia::render('FoodDelivery/Driver/Orders');
    }
}

