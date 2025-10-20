<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use App\Models\Table;
use Illuminate\Support\Facades\Cache;
use App\Models\Order;
use Illuminate\Support\Facades\Storage;

class PosRestaurantController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index(Request $request)
    {
        $jsonAppCurrency = json_decode(auth()->user()->app_currency);
    
        return Inertia::render('PosRestaurant/Index', [
            'menuItems' => $this->getMenuItems(),
            'tab' => $request->query('tab', 'pos'),
            'tables' => $this->getTables(),
            'joinedTables' => $this->getJoinedTables(),
            'reservations' => $this->getReservations(),
            'blockedDates' => $this->getBlockedDates(),
            'openedDates' => $this->getOpenedDates(),
            'tableSchedules' => $this->getTableSchedules(),
            'sales' => $this->getSales(),
            'currency_symbol' => $jsonAppCurrency->symbol
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function getMenuItems()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-menu-items?client_identifier={$clientIdentifier}");

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
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'is_available_personal' => 'boolean',
                'is_available_online' => 'boolean',
                'delivery_fee' => 'nullable|numeric|min:0'
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;
            $validated['is_available_personal'] = $request->input('is_available_personal', true);
            $validated['is_available_online'] = $request->input('is_available_online', true);

            // Handle multipart form data with image
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('fnb-menu-items', 'public');
                $validated['image'] = Storage::disk('public')->url($path);

                $response = Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/fnb-menu-items", $validated);
            } else {
                $response = Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/fnb-menu-items", $validated);
            }

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
            if ($request->hasFile('image')) {
                // Delete old image if exists
                $getResponse = Http::withToken($this->apiToken)
                    ->get("{$this->apiUrl}/fnb-menu-items/{$id}");
                if ($getResponse->successful()) {
                    $menuItem = $getResponse->json()['data']['fnb_menu_item'];
                    if (!empty($menuItem['image'])) {
                        $path = str_replace(Storage::disk('public')->url(''), '', $menuItem['image']);
                        if (Storage::disk('public')->exists($path)) {
                            Storage::disk('public')->delete($path);
                        }
                    }
                }
    
                $path = $request->file('image')->store('fnb-menu-items', 'public');

                $requestData = $request->all();
                $requestData['image'] = Storage::disk('public')->url($path);

                $response = Http::withToken($this->apiToken)
                    ->put("{$this->apiUrl}/fnb-menu-items/{$id}", $requestData);
            } else {
                $response = Http::withToken($this->apiToken)
                    ->put("{$this->apiUrl}/fnb-menu-items/{$id}", $request->all());
            }

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
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-tables?client_identifier={$clientIdentifier}");

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
                'status' => 'nullable|string|in:available,occupied,reserved,joined'
            ]);

            // Set default status to 'available' if not provided
            $validated['status'] = $validated['status'] ?? 'available';
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
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-tables/joined?client_identifier={$clientIdentifier}");

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
        try {
            $request['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-orders/kitchen-order", $request->all());

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to store kitchen order');
            }

            return redirect()->back()->with('success', 'Kitchen order created successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to store kitchen order: ' . $e->getMessage());
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

    public function completeOrder(Request $request)
    {
        try {
            $request['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-orders/complete", $request->all());

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to complete order');
            }

            return redirect()->back()->with('success', 'Order completed successfully');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to complete order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getReservations()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-reservations?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $reservations = $response->json();
            
            // If reservations is empty or not an array, return empty array
            if (empty($reservations) || !is_array($reservations)) {
                return [];
            }
            
            // Transform snake_case to camelCase for frontend
            $transformedReservations = array_map(function($reservation) {
                // Handle both array and object types
                if (is_object($reservation)) {
                    $reservation = (array) $reservation;
                }
                
                return [
                    'id' => (int)($reservation['id'] ?? 0),
                    'name' => $reservation['name'] ?? '',
                    'date' => $reservation['date'] ?? '',
                    'time' => $reservation['time'] ?? '',
                    'guests' => (int)($reservation['guests'] ?? 1), // Convert to integer
                    'tableId' => (int)($reservation['table_id'] ?? 0), // Convert to integer
                    'status' => $reservation['status'] ?? 'pending',
                    'notes' => $reservation['notes'] ?? null,
                    'contact' => $reservation['contact'] ?? null,
                ];
            }, $reservations);

            return $transformedReservations;
        } catch (\Exception $e) {
            \Log::error('Failed to fetch reservations: ' . $e->getMessage());
            return [];
        }
    }

    public function storeReservation(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'name' => 'required|string',
                'date' => 'required|date',
                'time' => 'required|string',
                'guests' => 'required|integer|min:1',
                'tableId' => 'required|integer',
                'contact' => 'nullable|string',
                'notes' => 'nullable|string',
            ]);

            // Transform data for API
            $apiData = [
                'name' => $validated['name'],
                'date' => $validated['date'],
                'time' => $validated['time'],
                'guests' => $validated['guests'],
                'table_id' => $validated['tableId'], // Convert tableId to table_id
                'contact' => $validated['contact'] ?? '',
                'notes' => $validated['notes'] ?? '',
                'status' => 'pending', // Set default status
                'client_identifier' => auth()->user()->identifier,
            ];

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-reservations", $apiData);

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to store reservation');
            }

            return redirect()->back()->with('success', 'Reservation created successfully')
                ->with('reservation', $response->json());
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to store reservation: ' . $e->getMessage());
        }
    }

    public function updateReservation(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string',
                'date' => 'sometimes|date',
                'time' => 'sometimes|string',
                'guests' => 'sometimes|integer|min:1',
                'tableId' => 'sometimes|integer',
                'contact' => 'nullable|string',
                'notes' => 'nullable|string',
                'status' => 'sometimes|in:pending,confirmed,cancelled',
            ]);

            // Transform data for API if needed
            $apiData = $validated;
            if (isset($validated['tableId'])) {
                $apiData['table_id'] = $validated['tableId'];
                unset($apiData['tableId']);
            }

            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/fnb-reservations/{$id}", $apiData);

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to update reservation');
            }

            return redirect()->back()->with('success', 'Reservation updated successfully')
                ->with('reservation', $response->json());
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update reservation: ' . $e->getMessage());
        }
    }

    public function destroyReservation($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/fnb-reservations/{$id}");

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to delete reservation');
            }

            return redirect()->back()->with('success', 'Reservation deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete reservation: ' . $e->getMessage());
        }
    }

    public function getTablesOverview()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/tables-overview?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch tables overview: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getKitchenOrdersOverview()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/kitchen-orders-overview?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return $response->json();   
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch kitchen orders overview: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getReservationsOverview()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/reservations-overview?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch reservations overview: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTableSchedules()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-table-schedules?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $schedules = $response->json()['data'] ?? [];
            
            // Transform to camelCase for frontend
            $transformedSchedules = array_map(function($schedule) {
                if (is_object($schedule)) {
                    $schedule = (array) $schedule;
                }
                
                return [
                    'id' => (int)($schedule['id'] ?? 0),
                    'tableId' => (int)($schedule['table_id'] ?? 0),
                    'scheduleDate' => $schedule['schedule_date'] ?? '',
                    'timeslots' => $schedule['timeslots'] ?? [],
                    'status' => $schedule['status'] ?? 'available',
                    'joinedWith' => $schedule['joined_with'] ?? null,
                    'notes' => $schedule['notes'] ?? null,
                ];
            }, $schedules);

            return $transformedSchedules;
        } catch (\Exception $e) {
            \Log::error('Failed to fetch table schedules: ' . $e->getMessage());
            return [];
        }
    }

    public function getOpenedDates()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-opened-dates?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return $response->json()['data'] ?? [];
        } catch (\Exception $e) {
            \Log::error('Failed to fetch opened dates: ' . $e->getMessage());
            return [];
        }
    }

    public function storeOpenedDate(Request $request)
    {
        try {
            $data = $request->all();
            $data['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-opened-dates", $data);

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to open date');
            }

            return redirect()->back()->with('success', 'Date opened successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to open date: ' . $e->getMessage());
        }
    }

    public function updateOpenedDate(Request $request, $id)
    {
        try {
            $data = $request->all();
            
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/fnb-opened-dates/{$id}", $data);

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to update opened date');
            }

            return redirect()->back()->with('success', 'Opened date updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update opened date: ' . $e->getMessage());
        }
    }

    public function destroyOpenedDate($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/fnb-opened-dates/{$id}");

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to delete opened date');
            }

            return redirect()->back()->with('success', 'Opened date deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete opened date: ' . $e->getMessage());
        }
    }

    public function setTableSchedule(Request $request)
    {
        try {
            $validated = $request->validate([
                'tableIds' => 'required|array|min:1',
                'tableIds.*' => 'required|integer',
                'date' => 'required|date',
                'time' => 'required|string',
                'status' => 'required|in:available,unavailable,joined',
                'joinedWith' => 'nullable|string',
            ]);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-table-schedules/bulk-set-availability", [
                    'client_identifier' => auth()->user()->identifier,
                    'table_ids' => $validated['tableIds'],
                    'schedule_date' => $validated['date'],
                    'timeslots' => [$validated['time']], // Single time slot
                    'status' => $validated['status'],
                    'joined_with' => $validated['joinedWith'] ?? null,
                ]);

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to set table schedule');
            }

            return redirect()->back()->with('success', 'Table schedule updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to set table schedule: ' . $e->getMessage());
        }
    }

    public function settings()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-settings", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to fetch restaurant settings');
            }

            return Inertia::render('PosRestaurant/Settings', [
                'settings' => $response->json()
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load settings');
        }
    }

    public function saveSettings(Request $request)
    {
        try {
            $request['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-settings", $request->all());

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to save settings');
            }

            return response()->json([
                'message' => 'Settings saved successfully',
                'data' => $response->json()['data'] ?? null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to save settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getBlockedDates()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-blocked-dates?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $data = $response->json();
            return $data['data'] ?? [];
        } catch (\Exception $e) {
            return [];
        }
    }

    public function storeBlockedDate(Request $request)
    {
        try {
            $request['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-blocked-dates", $request->all());

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to block date');
            }

            return redirect()->back()->with('success', 'Date blocked successfully')
                ->with('blockedDate', $response->json()['data']);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to block date: ' . $e->getMessage());
        }
    }

    public function updateBlockedDate(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/fnb-blocked-dates/{$id}", $request->all());

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to update blocked date');
            }

            return redirect()->back()->with('success', 'Blocked date updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update blocked date: ' . $e->getMessage());
        }
    }

    public function destroyBlockedDate($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/fnb-blocked-dates/{$id}");

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to remove blocked date');
            }

            return redirect()->back()->with('success', 'Blocked date removed successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to remove blocked date: ' . $e->getMessage());
        }
    }

    // Table Order Methods
    public function getTableOrder(Request $request)
    {
        try {
            $validated = $request->validate([
                'table_name' => 'required|string'
            ]);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-orders/get-table-order", [
                    'client_identifier' => auth()->user()->identifier,
                    'table_name' => $validated['table_name']
                ]);

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to get table order');
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function saveTableOrder(Request $request)
    {
        try {
            $validated = $request->validate([
                'table_name' => 'required|string',
                'items' => 'array',
                'discount' => 'required|numeric',
                'discount_type' => 'required|in:percentage,fixed',
                'subtotal' => 'required|numeric',
                'total_amount' => 'required|numeric'
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-orders/save-table-order", $validated);

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to save table order');
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function completeTableOrder(Request $request)
    {
        try {
            \Log::info('Frontend Complete Table Order Request:', $request->all());
            
            $validated = $request->validate([
                'table_name' => 'required|string',
                'payment_amount' => 'required|numeric|min:0',
                'payment_method' => 'required|string|in:cash,card',
                'change' => 'nullable|numeric|min:0'
            ]);

            $apiPayload = [
                'client_identifier' => auth()->user()->identifier,
                'table_name' => $validated['table_name'],
                'payment_amount' => $validated['payment_amount'],
                'payment_method' => $validated['payment_method'],
                'change' => $validated['change'] ?? 0
            ];
            
            \Log::info('Sending to backend API:', $apiPayload);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-orders/complete", $apiPayload);

            \Log::info('Backend API Response:', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            if (!$response->successful()) {
                \Log::error('Backend API Error:', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception($response->json()['message'] ?? 'Failed to complete order');
            }

            return redirect()->back()->with('success', 'Order completed successfully');
        } catch (\Exception $e) {
            \Log::error('Complete Table Order Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Failed to complete order: ' . $e->getMessage());
        }
    }

    public function getAllActiveOrders()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-orders/all-active", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception($response->json()['message'] ?? 'Failed to get active orders');
            }

            return response()->json([
                'orders' => $response->json()['orders'] ?? []
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'orders' => []
            ]);
        }
    }

    /**
     * Get sales data from API
     */
    public function getSales()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-sales?client_identifier={$clientIdentifier}");

            if (!$response->json()) {
                return [];
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return $response->json()['data']['sales'] ?? [];
        } catch (\Exception $e) {
            return [];
        }
    }
}
