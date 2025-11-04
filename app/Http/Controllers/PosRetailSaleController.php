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
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index()
    {
        $clientIdentifier = auth()->user()->identifier;
        // Fetch data from API
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/pos-retail/sales?client_identifier={$clientIdentifier}");

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
                'total_amount' => (float) $sale['total_amount'],
                'total_amount_formatted' => $app_currency->symbol . number_format($sale['total_amount'], 2, $app_currency->decimal_separator, $app_currency->thousands_separator),
                'cash_received' => $sale['cash_received'] ? (float) $sale['cash_received'] : null,
                'cash_received_formatted' => $sale['cash_received'] ? $app_currency->symbol . number_format($sale['cash_received'], 2, $app_currency->decimal_separator, $app_currency->thousands_separator) : null,
                'change' => $sale['change'] ? (float) $sale['change'] : null,
                'change_formatted' => $sale['change'] ? $app_currency->symbol . number_format($sale['change'], 2, $app_currency->decimal_separator, $app_currency->thousands_separator) : null,
                'payment_method' => strtolower($sale['payment_method']),
            ];
        });

        $jsonAppCurrency = json_decode(auth()->user()->app_currency);
        
        return Inertia::render('PosRetail/Sales', [
            'sales' => $sales,
            'appCurrency' => $jsonAppCurrency
        ]);
    }

    private function mapSaleItems($items) {
        $clientIdentifier = auth()->user()->identifier;
        // Fetch data from API
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/inventory?client_identifier={$clientIdentifier}");

        if(!$response->json()) {
            return response()->json(['error' => 'Failed to connect to Retail POS Sales API.'], 500);
        }

        if (!$response->successful()) {
            throw new \Exception('API request failed: ' . $response->body());
        }

        $inventoryProducts = $response->json()['data']['products'];

        return collect($items)->map(function ($item) use ($inventoryProducts) {
            $product = collect($inventoryProducts)->firstWhere('id', $item['id']);
            return [
                'id' => $item['id'],
                'name' => $product ? $product['name'] : 'Unknown Product',
                'price' => $product ? $product['price'] : 0,
                'quantity' => $item['quantity']
            ];
        });
    }

    public function destroy($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/pos-retail/sale/{$id}");

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
                ->post("{$this->apiUrl}/pos-retail/sales/bulk-delete", [
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

    public function getSalesOverview()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/pos-retail/sales/overview?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return [
                'todaySales' => $response->json()['todaySales'],
                'weeklySales' => $response->json()['weeklySales'],
                'currency_symbol' => $jsonAppCurrency->symbol
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get sales overview: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to get sales overview'], 500);
        }
    }

    public function exportSales(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Build API request with date range filters
            $apiParams = ['client_identifier' => $clientIdentifier];
            
            if ($request->has('date_from')) {
                $apiParams['date_from'] = $request->input('date_from');
            }
            if ($request->has('date_to')) {
                $apiParams['date_to'] = $request->input('date_to');
            }

            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/pos-retail/sales", $apiParams);

            if (!$response->json()) {
                return response()->json(['error' => 'Failed to connect to Sales API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $sales = $response->json()['data'] ?? [];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            // Get selected fields from request or use defaults
            $selectedFields = $request->input('fields', ['id', 'date', 'items', 'total_amount', 'payment_method']);
            $fields = is_string($selectedFields) ? explode(',', $selectedFields) : $selectedFields;
            $format = $request->input('format', 'csv');

            // Prepare headers
            $headers = [];
            $fieldLabels = [
                'id' => 'Sale ID',
                'date' => 'Date',
                'items' => 'Items',
                'total_amount' => 'Total Amount',
                'payment_method' => 'Payment Method',
                'cash_received' => 'Cash Received',
                'change' => 'Change',
            ];

            foreach ($fields as $field) {
                if (isset($fieldLabels[$field])) {
                    $headers[] = $fieldLabels[$field];
                }
            }

            // Generate CSV
            $csv = fopen('php://temp', 'r+');
            fputcsv($csv, $headers);
            
            foreach ($sales as $sale) {
                $row = [];
                
                foreach ($fields as $field) {
                    switch ($field) {
                        case 'id':
                            $row[] = $sale['id'] ?? '';
                            break;
                        case 'date':
                            $row[] = isset($sale['created_at']) ? date('Y-m-d H:i:s', strtotime($sale['created_at'])) : '';
                            break;
                        case 'items':
                            $items = $sale['items'] ?? [];
                            $itemsList = [];
                            foreach ($items as $item) {
                                $itemsList[] = ($item['name'] ?? 'Unknown') . ' (Qty: ' . ($item['quantity'] ?? 0) . ')';
                            }
                            $row[] = implode('; ', $itemsList);
                            break;
                        case 'total_amount':
                            $amount = $sale['total_amount'] ?? 0;
                            $formattedAmount = $jsonAppCurrency->symbol . number_format(
                                $amount, 
                                2, 
                                $jsonAppCurrency->decimal_separator, 
                                $jsonAppCurrency->thousands_separator
                            );
                            $row[] = $formattedAmount;
                            break;
                        case 'payment_method':
                            $row[] = ucfirst($sale['payment_method'] ?? '');
                            break;
                        case 'cash_received':
                            $cashReceived = $sale['cash_received'] ?? 0;
                            $formattedCash = $cashReceived > 0 
                                ? $jsonAppCurrency->symbol . number_format(
                                    $cashReceived, 
                                    2, 
                                    $jsonAppCurrency->decimal_separator, 
                                    $jsonAppCurrency->thousands_separator
                                )
                                : '';
                            $row[] = $formattedCash;
                            break;
                        case 'change':
                            $change = $sale['change'] ?? 0;
                            $formattedChange = $change > 0 
                                ? $jsonAppCurrency->symbol . number_format(
                                    $change, 
                                    2, 
                                    $jsonAppCurrency->decimal_separator, 
                                    $jsonAppCurrency->thousands_separator
                                )
                                : '';
                            $row[] = $formattedChange;
                            break;
                        default:
                            $row[] = '';
                    }
                }
                fputcsv($csv, $row);
            }

            rewind($csv);
            $content = stream_get_contents($csv);
            fclose($csv);

            $dateFrom = $request->input('date_from', '');
            $dateTo = $request->input('date_to', '');
            $dateRange = ($dateFrom && $dateTo) ? "_{$dateFrom}_to_{$dateTo}" : '';
            $filename = 'sales' . $dateRange . '_' . date('Y-m-d_His') . '.csv';

            return response($content)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Transfer-Encoding', 'binary');
        } catch (\Exception $e) {
            Log::error('Failed to export sales', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to export sales: ' . $e->getMessage()], 500);
        }
    }
}
