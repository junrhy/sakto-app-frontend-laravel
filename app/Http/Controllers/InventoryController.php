<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InventoryController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory?client_identifier={$clientIdentifier}");

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to Inventory API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $inventoryData = $response->json()['data']['products'];
            $inventoryData = array_map(function($product) {
                $product['status'] = $product['quantity'] === 0 ? 'out_of_stock' : 
                                   ($product['quantity'] <= 10 ? 'low_stock' : 'in_stock');
                return $product;
            }, $inventoryData);
            $inventoryCategories = $response->json()['data']['categories'];

            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            $inventoryData = array_map(function($product) use ($jsonAppCurrency) {
                $product['price_formatted'] = $jsonAppCurrency->symbol . number_format($product['price'], 2, $jsonAppCurrency->decimal_separator, $jsonAppCurrency->thousands_separator);
                return $product;
            }, $inventoryData);
            
            return Inertia::render('PosRetail/Inventory', [
                'inventory' => $inventoryData,
                'categories' => $inventoryCategories ?? [],
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getProducts()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch products', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch products',
                'data' => null
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Add client identifier to the request
            $formData = array_merge($request->except('images'), [
                'client_identifier' => auth()->user()->identifier
            ]);

            // Initialize response variable
            $response = null;

            // Handle multiple image uploads
            if ($request->hasFile('images')) {
                // Create a new HTTP client instance for multipart request
                $client = Http::withToken($this->apiToken)
                    ->timeout(30)
                    ->asMultipart();

                // Add all form data fields
                foreach ($formData as $key => $value) {
                    $client = $client->attach($key, (string)$value);
                }

                // Add all images with proper 'contents' key
                foreach ($request->file('images') as $image) {
                    $client = $client->attach(
                        'images[]', 
                        file_get_contents($image->getPathname()),
                        $image->getClientOriginalName(),
                        ['Content-Type' => $image->getMimeType()]
                    );
                }

                // Send the request
                $response = $client->post("{$this->apiUrl}/inventory");
            } else {
                // If no images, send regular request
                $response = Http::withToken($this->apiToken)
                    ->timeout(30)
                    ->post("{$this->apiUrl}/inventory", $formData);
            }
            
            if (!$response->successful()) {
                Log::error('API request failed', [
                    'response' => $response->body(),
                    'status' => $response->status()
                ]);
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Failed to create product', [
                'error' => $e->getMessage(),
                'request_data' => $request->except('images'),
                'files' => $request->hasFile('images') ? 'Has files' : 'No files'
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/inventory/{$id}", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/inventory/{$id}");
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function bulkDestroy(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/inventory/bulk-destroy", [
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

    public function checkLowStock()
    {
        try {
            $lowStockThreshold = env('LOW_STOCK_THRESHOLD', 10);
            $lowStockProducts = array_filter($this->getProducts()['data']['products'], function($product) use ($lowStockThreshold) {
                return $product['quantity'] <= $lowStockThreshold;
            });

            if (count($lowStockProducts) > 0) {
                // Send notification or email
                Log::warning('Low stock alert', ['products' => $lowStockProducts]);
            }

            return response()->json([
                'status' => 'success',
                'data' => $lowStockProducts
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to check low stock', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to check low stock'], 500);
        }
    }

    public function getInventoryHistory(string $productId)
    {
        try {
            // This would typically come from a database
            $history = [
                [
                    'id' => 1,
                    'product_id' => $productId,
                    'action' => 'stock_added',
                    'quantity' => 50,
                    'user_id' => 1,
                    'timestamp' => now(),
                    'notes' => 'Regular stock replenishment'
                ],
                // ... more history entries
            ];

            return response()->json([
                'status' => 'success',
                'data' => $history
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch history'], 500);
        }
    }

    public function generateBarcode(string $sku)
    {
        try {
            // You'll need to install a barcode package like "picqer/php-barcode-generator"
            $generator = new \Picqer\Barcode\BarcodeGeneratorPNG();
            $barcode = base64_encode($generator->getBarcode($sku, $generator::TYPE_CODE_128));

            return response()->json([
                'status' => 'success',
                'data' => [
                    'barcode' => 'data:image/png;base64,' . $barcode
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to generate barcode'], 500);
        }
    }

    public function importProducts(Request $request)
    {
        try {
            if (!$request->hasFile('file')) {
                return response()->json(['error' => 'No file provided'], 400);
            }

            // Process CSV/Excel file
            $file = $request->file('file');
            // Add logic to process the file and import products

            return response()->json([
                'status' => 'success',
                'message' => 'Products imported successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to import products'], 500);
        }
    }

    public function exportProducts()
    {
        try {
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory");

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to Inventory API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $products = $response->json()['data']['products'];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            $products = array_map(function($product) use ($jsonAppCurrency) {
                $product['price'] = $jsonAppCurrency->symbol . number_format($product['price'], 2, $jsonAppCurrency->decimal_separator, $jsonAppCurrency->thousands_separator);
                return $product;
            }, $products);

            // Generate CSV
            $csv = fopen('php://temp', 'r+');
            fputcsv($csv, ['Name', 'SKU', 'Quantity', 'Price']); // Headers
            
            foreach ($products as $product) {
                fputcsv($csv, [
                    $product['name'],
                    $product['sku'],
                    $product['quantity'],
                    $product['price']
                ]);
            }

            rewind($csv);
            $content = stream_get_contents($csv);
            fclose($csv);

            return response($content)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="inventory.csv"');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to export products'], 500);
        }
    }

    public function getProductsOverview()
    {
        try {
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products-overview");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $items = $response->json()['data']['products'];
            $categories = $response->json()['data']['categories'];

            return response()->json([
                'items' => $items,
                'categories' => $categories
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function storeCategory(Request $request)
    {
        try {
            $request->request->add(['client_identifier' => auth()->user()->identifier]);

            $response = Http::withToken($this->apiToken)
                ->timeout(30)
                ->post("{$this->apiUrl}/inventory/categories", $request->all());

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            // Fetch updated categories
            $clientIdentifier = auth()->user()->identifier;
            $categoriesResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory?client_identifier={$clientIdentifier}");

            if ($categoriesResponse->successful()) {
                $inventoryCategories = $categoriesResponse->json()['data']['categories'];
                return redirect()->back()->with('categories', $inventoryCategories);
            }

            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Failed to create category', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function updateCategory(Request $request, string $id)
    {
        try {
            $request->request->add(['client_identifier' => auth()->user()->identifier]);

            $response = Http::withToken($this->apiToken)
                ->timeout(30)
                ->put("{$this->apiUrl}/inventory/categories/{$id}", $request->all());

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            // Fetch updated categories
            $clientIdentifier = auth()->user()->identifier;
            $categoriesResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory?client_identifier={$clientIdentifier}");

            if ($categoriesResponse->successful()) {
                $inventoryCategories = $categoriesResponse->json()['data']['categories'];
                return redirect()->back()->with('categories', $inventoryCategories);
            }

            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Failed to update category', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroyCategory(string $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->timeout(30)
                ->delete("{$this->apiUrl}/inventory/categories/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            // Fetch updated categories
            $categoriesResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory?client_identifier={$clientIdentifier}");

            if ($categoriesResponse->successful()) {
                $inventoryCategories = $categoriesResponse->json()['data']['categories'];
                return redirect()->back()->with('categories', $inventoryCategories);
            }

            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Failed to delete category', [
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
