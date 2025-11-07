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
     * Display order tracking (public)
     */
    public function track($reference = null)
    {
        return Inertia::render('Customer/FoodDelivery/Track', [
            'reference' => $reference,
        ]);
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
     * Proxy: Create restaurant
     */
    public function restaurantStore(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/food-delivery-restaurants", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Update restaurant
     */
    public function restaurantUpdate(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/food-delivery-restaurants/{$id}", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Delete restaurant
     */
    public function restaurantDelete($id, Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/food-delivery-restaurants/{$id}", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json(), $response->status());
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
     * Proxy: Create menu category
     */
    public function menuCategoryStore(Request $request)
    {
        try {
            $data = array_merge(
                $request->all(),
                ['client_identifier' => auth()->user()->identifier]
            );

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/food-delivery-menu/categories", $data);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Update menu category
     */
    public function menuCategoryUpdate($id, Request $request)
    {
        try {
            $data = array_merge(
                $request->all(),
                ['client_identifier' => auth()->user()->identifier]
            );

            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/food-delivery-menu/categories/{$id}", $data);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Delete menu category
     */
    public function menuCategoryDelete($id, Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/food-delivery-menu/categories/{$id}", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Create menu item
     */
    public function menuItemStore(Request $request)
    {
        try {
            $data = array_merge(
                $request->all(),
                ['client_identifier' => auth()->user()->identifier]
            );

            // Handle category_id: if "none" or empty, set to null
            if (isset($data['category_id']) && ($data['category_id'] === 'none' || $data['category_id'] === '')) {
                $data['category_id'] = null;
            }

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/food-delivery-menu/items", $data);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Update menu item
     */
    public function menuItemUpdate($id, Request $request)
    {
        try {
            $data = array_merge(
                $request->all(),
                ['client_identifier' => auth()->user()->identifier]
            );

            // Handle category_id: if "none" or empty, set to null
            if (isset($data['category_id']) && ($data['category_id'] === 'none' || $data['category_id'] === '')) {
                $data['category_id'] = null;
            }

            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/food-delivery-menu/items/{$id}", $data);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Delete menu item
     */
    public function menuItemDelete($id, Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/food-delivery-menu/items/{$id}", array_merge(
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
     * Proxy: Get driver by ID
     */
    public function driverShow($id, Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-drivers/{$id}", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Create driver
     */
    public function driverStore(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/food-delivery-drivers", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Update driver
     */
    public function driverUpdate(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/food-delivery-drivers/{$id}", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Proxy: Delete driver
     */
    public function driverDelete($id, Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/food-delivery-drivers/{$id}", array_merge(
                    $request->all(),
                    ['client_identifier' => auth()->user()->identifier]
                ));

            return response()->json($response->json(), $response->status());
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

    // ==================== ADMIN DASHBOARD ====================

    /**
     * Admin: Restaurants Management
     */
    public function adminRestaurants()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-restaurants", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            $restaurants = [];
            if ($response->successful()) {
                $restaurants = $response->json()['data'] ?? [];
            }

            return Inertia::render('FoodDelivery/Admin/Restaurants', [
                'restaurants' => $restaurants,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('FoodDelivery/Admin/Restaurants', [
                'restaurants' => [],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Admin: Create Restaurant
     */
    public function adminRestaurantsCreate()
    {
        return Inertia::render('FoodDelivery/Admin/Restaurants', [
            'mode' => 'create',
        ]);
    }

    /**
     * Admin: Edit Restaurant
     */
    public function adminRestaurantsEdit($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-restaurants/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            $restaurant = null;
            if ($response->successful()) {
                $restaurant = $response->json()['data'] ?? null;
            }

            if (!$restaurant) {
                return redirect()->route('food-delivery.admin.restaurants')
                    ->with('error', 'Restaurant not found');
            }

            return Inertia::render('FoodDelivery/Admin/Restaurants', [
                'restaurant' => $restaurant,
                'mode' => 'edit',
            ]);
        } catch (\Exception $e) {
            return redirect()->route('food-delivery.admin.restaurants')
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Admin: Orders Management
     */
    public function adminOrders()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-orders", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            $orders = [];
            if ($response->successful()) {
                $orders = $response->json()['data'] ?? [];
            }

            return Inertia::render('FoodDelivery/Admin/Orders', [
                'orders' => $orders,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('FoodDelivery/Admin/Orders', [
                'orders' => [],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Admin: Drivers Management
     */
    public function adminDrivers()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-drivers", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            $drivers = [];
            if ($response->successful()) {
                $drivers = $response->json()['data'] ?? [];
            }

            return Inertia::render('FoodDelivery/Admin/Drivers', [
                'drivers' => $drivers,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('FoodDelivery/Admin/Drivers', [
                'drivers' => [],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Admin: Create Driver
     */
    public function adminDriversCreate()
    {
        return Inertia::render('FoodDelivery/Admin/Drivers', [
            'mode' => 'create',
        ]);
    }

    /**
     * Admin: Edit Driver
     */
    public function adminDriversEdit($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-drivers/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            $driver = null;
            if ($response->successful()) {
                $driver = $response->json()['data'] ?? null;
            }

            if (!$driver) {
                return redirect()->route('food-delivery.admin.drivers')
                    ->with('error', 'Driver not found');
            }

            return Inertia::render('FoodDelivery/Admin/Drivers', [
                'driver' => $driver,
                'mode' => 'edit',
            ]);
        } catch (\Exception $e) {
            return redirect()->route('food-delivery.admin.drivers')
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Admin: Centralized Menu Management
     */
    public function adminMenu()
    {
        try {
            $menuItemsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-menu/items", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            $categoriesResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-menu/categories", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            $restaurantsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-restaurants", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            $menuItems = [];
            if ($menuItemsResponse->successful()) {
                $menuItems = $menuItemsResponse->json()['data'] ?? [];
            }

            $categories = [];
            if ($categoriesResponse->successful()) {
                $categories = $categoriesResponse->json()['data'] ?? [];
            }

            $restaurants = [];
            if ($restaurantsResponse->successful()) {
                $restaurants = $restaurantsResponse->json()['data'] ?? [];
            }

            return Inertia::render('FoodDelivery/Admin/Menu', [
                'menuItems' => $menuItems,
                'categories' => $categories,
                'restaurants' => $restaurants,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('FoodDelivery/Admin/Menu', [
                'menuItems' => [],
                'categories' => [],
                'restaurants' => [],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Admin: Analytics
     */
    public function adminAnalytics()
    {
        // Analytics page fetches its own data via API calls
        // So we just render the page
        return Inertia::render('FoodDelivery/Admin/Analytics');
    }

    // ==================== DRIVER DASHBOARD ====================

    /**
     * Get user's driver (find by email or phone, or get first driver for client)
     */
    private function getUserDriver()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-drivers", [
                    'client_identifier' => auth()->user()->identifier,
                ]);

            if (!$response->successful()) {
                return null;
            }

            $drivers = $response->json()['data'] ?? [];
            
            if (empty($drivers)) {
                return null;
            }

            // Try to find driver by matching user email or phone
            $user = auth()->user();
            $userEmail = $user->email ?? null;
            $userPhone = $user->contact_number ?? null;

            foreach ($drivers as $driver) {
                if ($userEmail && isset($driver['email']) && $driver['email'] === $userEmail) {
                    return $driver;
                }
                if ($userPhone && isset($driver['phone']) && $driver['phone'] === $userPhone) {
                    return $driver;
                }
            }

            // If no match found, return first driver
            return $drivers[0];
        } catch (\Exception $e) {
            return null;
        }
    }
}

