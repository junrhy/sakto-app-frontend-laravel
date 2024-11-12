<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use App\Models\Table;
use Illuminate\Support\Facades\Cache;
use App\Models\Order;

class PosRestaurantController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = env('API_URL');
        $this->apiToken = env('API_TOKEN');
    }

    public function index(Request $request)
    {
        return Inertia::render('PosRestaurant', [
            'menuItems' => $this->getMenuItems(),
            'tab' => $request->query('tab', 'pos'),
            'tables' => $this->getTables(),
            'joinedTables' => $this->getJoinedTables(),
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function getMenuItems()
    {
        try {
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-menu-items");

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to FNB Menu Items API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return $response->json()['data']['fnb_menu_items'];
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to fetch menu items.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function storeMenuItem(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'category' => 'required|string',
                'image' => 'nullable|string',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-menu-items", $validated);

            if (!$response->successful()) {
                return redirect()->back()
                    ->with('error', $response->json()['message'] ?? 'Failed to create menu item');
            }

            return redirect()->back()
                ->with('success', 'Menu item created successfully')
                ->with('menuItem', $response->json()['data']);

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to store menu item: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateMenuItem(Request $request, string $id)
    {
        try {
            // Change the HTTP method to PUT
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/fnb-menu-items/{$id}", $request->all());

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return redirect()->back()->with('success', 'Menu item updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update menu item.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroyMenuItem(string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/fnb-menu-items/{$id}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return redirect()->back()->with('success', 'Menu item deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete menu item.');
        }
    }
    
    public function bulkDestroyMenuItem(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-menu-items/bulk-destroy", [
                    'ids' => $request->ids
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get tables from API
     */
    public function getTables()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-tables");

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to FNB Tables API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return $response->json()['data']['fnb_tables'];
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to fetch tables.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function storeTable(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'seats' => 'required|integer|min:1',
                'status' => 'required|string|in:available,occupied,reserved,joined'
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-tables", $validated);

            if (!$response->successful()) {
                return redirect()->back()
                    ->with('error', $response->json()['message'] ?? 'Failed to create table');
            }

            return redirect()->back()
                ->with('success', 'Table created successfully')
                ->with('table', $response->json()['data']);

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to store table: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateTable(Request $request, string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/fnb-tables/{$id}", $request->all());

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return redirect()->back()->with('success', 'Table updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update table.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroyTable(string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/fnb-tables/{$id}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return redirect()->back()->with('success', 'Table deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete table.');
        }
    }

    public function joinTables(Request $request)
    {
        try {
            $validated = $request->validate([
                'tableIds' => 'required|array',
            ]);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-tables/join", [
                    'table_ids' => $validated['tableIds']
                ]);

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to join tables');
            }

            return redirect()->back()->with('success', 'Tables joined successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to join tables: ' . $e->getMessage());
        }
    }

    public function unjoinTables(Request $request)
    {
        try {
            $validated = $request->validate([
                'tableIds' => 'required|array',
            ]);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-tables/unjoin", [
                    'table_ids' => $validated['tableIds']
                ]);

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to unjoin tables');
            }

            return redirect()->back()->with('success', 'Tables unjoined successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to unjoin tables: ' . $e->getMessage());
        }
    }

    public function getJoinedTables()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-tables/joined");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return $response->json()['data']['fnb_tables'];
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to fetch joined tables.');
        }
    }

    public function storeKitchenOrder(Request $request)
    {
        dd($request->all());
        $validated = $request->validate([
            'tableNumber' => 'required|string',
            'items' => 'required|array',
            'items.*.id' => 'required|integer',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'orderTime' => 'required|date',
        ]);

        try {
            // Store the kitchen order in the database
            $kitchenOrder = KitchenOrder::create([
                'table_number' => $validated['tableNumber'],
                'items' => $validated['items'],
                'order_time' => $validated['orderTime'],
                'status' => 'pending', // You can add different statuses like 'pending', 'preparing', 'completed'
            ]);

            return response()->json([
                'message' => 'Kitchen order created successfully',
                'order' => $kitchenOrder
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create kitchen order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addItemToOrder(Request $request)
    {
        try {
            $request['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-orders/add-item", $request->all()); 

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to add item to order');
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to add item to order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function removeOrderItem(Request $request, $table, $itemId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/fnb-orders/{$table}/item/{$itemId}");

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to remove item');
            }

            return redirect()->back()->with('success', 'Item removed successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to remove item: ' . $e->getMessage());
        }
    }

    public function getCurrentOrder($tableNumber)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            // Get current order from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-orders/client/{$clientIdentifier}/table/{$tableNumber}");

            if (!$response->successful()) {
                return response()->json([
                    'error' => $response->json()['message'] ?? 'Failed to fetch current order'
                ], $response->status());
            }

            return response()->json($response->json());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch current order: ' . $e->getMessage()
            ], 500);
        }
    }
}
