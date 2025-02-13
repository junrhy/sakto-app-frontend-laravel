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
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory?client_identifier={$clientIdentifier}");

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to Retail POS API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $inventoryProducts = $response->json()['data']['products'];
            $inventoryCategories = $response->json()['data']['categories'];
            
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            $inventoryProducts = array_map(function($product) use ($jsonAppCurrency) {
                $product['price_formatted'] = $jsonAppCurrency->symbol . number_format($product['price'], 2, $jsonAppCurrency->decimal_separator, $jsonAppCurrency->thousands_separator);
                return $product;
            }, $inventoryProducts);
            
            return Inertia::render('PosRetail', [
                'products' => $inventoryProducts,
                'categories' => $inventoryCategories,
                'appCurrency' => $jsonAppCurrency
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
            $request->request->add(['client_identifier' => auth()->user()->identifier]);

            $response = Http::withToken($this->apiToken)
                ->timeout(30)
                ->post("{$this->apiUrl}/pos-retail", $request->all());
     
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

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