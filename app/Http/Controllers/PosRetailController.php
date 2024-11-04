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
        dd($request->all());
        $validatedData = $request->validate([
            'items' => 'required|array',
            'totalAmount' => 'required|numeric',
            'cashReceived' => 'required|numeric',
            'change' => 'required|numeric',
        ]);

        // Here you would typically save the sale to the database
        // For example, you might have a Sale model to handle this
        // Sale::create([...]);

        return response()->json(['message' => 'Sale recorded successfully.'], 201);
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