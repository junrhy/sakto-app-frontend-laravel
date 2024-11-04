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
        try {
            $response = Http::withToken($this->apiToken)
                ->timeout(30)
                ->post("{$this->apiUrl}/pos-retail", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            dd($response->json());
            return redirect()->back();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
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