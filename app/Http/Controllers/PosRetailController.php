<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class PosRetailController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = env('API_URL');
        $this->apiToken = env('API_TOKEN');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // $products = [
        //     ['id' => 1, 'name' => "Product A", 'price' => 10.0, 'images' => ["/images/product-a.jpg"], 'quantity' => 50],
        //     ['id' => 2, 'name' => "Product B", 'price' => 15.0, 'images' => ["/images/product-b.jpg"], 'quantity' => 30],
        //     ['id' => 3, 'name' => "Product C", 'price' => 20.0, 'images' => ["/images/product-c.jpg"], 'quantity' => 20],
        //     ['id' => 4, 'name' => "Product D", 'price' => 25.0, 'images' => ["/images/product-d.jpg"], 'quantity' => 15],
        //     ['id' => 5, 'name' => "Product E", 'price' => 30.0, 'images' => ["/images/product-e.jpg"], 'quantity' => 25],
        //     ['id' => 6, 'name' => "Product F", 'price' => 35.0, 'images' => ["/images/product-f.jpg"], 'quantity' => 10],
        //     ['id' => 7, 'name' => "Product G", 'price' => 40.0, 'images' => ["/images/product-g.jpg"], 'quantity' => 5],
        // ];
        try {
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory");

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to Retail POS API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $inventoryProducts = $response->json()['data']['products'];
            $inventoryCategories = $response->json()['data']['categories'];
            
            return Inertia::render('PosRetail', [
                'products' => $inventoryProducts,
                'categories' => $inventoryCategories
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}