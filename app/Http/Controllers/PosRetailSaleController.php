<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PosRetailSaleController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = env('API_URL');
        $this->apiToken = env('API_TOKEN');
    }

    public function index()
    {
        // Fetch data from API
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/pos-retail/sales");

        if(!$response->json()) {
            return response()->json(['error' => 'Failed to connect to Retail POS Sales API.'], 500);
        }

        if (!$response->successful()) {
            throw new \Exception('API request failed: ' . $response->body());
        }

        return Inertia::render('PosRetailSale', [
            'sales' => $response->json()['data']
        ]);
    }

    public function showSalesReport() {
        return view('sales-report'); // Assuming you have a corresponding Blade view
    }
}
