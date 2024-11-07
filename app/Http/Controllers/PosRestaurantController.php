<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class PosRestaurantController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = env('API_URL');
        $this->apiToken = env('API_TOKEN');
    }

    public function index()
    {
        $menuItems = $this->getMenuItems();
        return Inertia::render('PosRestaurant', ['menuItems' => $menuItems]);
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
    public function store(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-menu-items", $request->all());

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return redirect()->back()->with('success', 'Menu item created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to store menu item.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
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
    public function destroy(string $id)
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
    
    public function bulkDestroy(Request $request)
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
}
