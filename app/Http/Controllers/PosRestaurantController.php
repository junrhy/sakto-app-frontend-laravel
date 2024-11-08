<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use App\Models\Table;

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
}
