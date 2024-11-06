<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Sale;

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

        $app_currency = json_decode(auth()->user()->app_currency);
        $responseData = $response->json();
        $sales = collect($responseData['data'])->map(function ($sale) use ($app_currency) {
            return [
                'id' => $sale['id'],
                'created_at' => $sale['created_at'],
                'items' => $this->mapSaleItems($sale['items']),
                'total_amount' => $app_currency->symbol . number_format($sale['total_amount'], 2, $app_currency->decimal_separator, $app_currency->thousands_separator),
                'cash_received' => $app_currency->symbol . number_format($sale['cash_received'], 2, $app_currency->decimal_separator, $app_currency->thousands_separator),
                'change' => $app_currency->symbol . number_format($sale['change'], 2, $app_currency->decimal_separator, $app_currency->thousands_separator),
                'payment_method' => ucfirst($sale['payment_method']),
            ];
        });
        return Inertia::render('PosRetailSale', [
            'sales' => $sales
        ]);
    }

    private function mapSaleItems($items) {
        // Fetch data from API
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/inventory");

        if(!$response->json()) {
            return response()->json(['error' => 'Failed to connect to Retail POS Sales API.'], 500);
        }

        if (!$response->successful()) {
            throw new \Exception('API request failed: ' . $response->body());
        }

        $inventoryProducts = $response->json()['data']['products'];

        return collect($items)->map(function ($item) use ($inventoryProducts) {
            $product = collect($inventoryProducts)->firstWhere('id', $item['id']);
            return ['id' => $product['name'], 'price' => $product['price'], 'quantity' => $item['quantity']];
        });
    }

    public function destroy($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/pos-retail/sales/{$id}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json(['message' => 'Sale deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete sale: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete sale'], 500);
        }
    }

    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids');
            
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/pos-retail/sales/bulk", [
                    'ids' => $ids
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json(['message' => 'Sales deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to bulk delete sales: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete sales'], 500);
        }
    }
}
