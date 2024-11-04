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
        $this->apiUrl = env('API_URL');
        $this->apiToken = env('API_TOKEN');
        
        // Set PHP execution time for long-running requests
        set_time_limit((int)env('MAX_EXECUTION_TIME', 300));
        
        // Increase memory limit if needed
        ini_set('memory_limit', '256M');
    }

    public function index()
    {
        try {
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory");

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
            
            return Inertia::render('Inventory', [
                'inventory' => $inventoryData,
                'categories' => $inventoryCategories
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
            $response = Http::withToken($this->apiToken)
                ->timeout(30)
                ->post("{$this->apiUrl}/inventory", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to create product', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
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
            
            return response()->json($response->json());
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
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete product'], 500);
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
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function uploadImages(Request $request)
    {
        try {
            if (!$request->hasFile('images')) {
                return response()->json(['error' => 'No images provided'], 400);
            }

            $timeout = (int)env('API_UPLOAD_TIMEOUT', 300);
            $files = $request->file('images');
            $files = is_array($files) ? $files : [$files];
            
            $response = Http::withToken($this->apiToken)
                ->timeout($timeout)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Connection' => 'keep-alive'
                ])
                ->attach('images[]', function() use ($files) {
                    $attachments = [];
                    foreach ($files as $file) {
                        $attachments[] = [
                            'contents' => fopen($file->getRealPath(), 'r'),
                            'filename' => $file->getClientOriginalName()
                        ];
                    }
                    return $attachments;
                })
                ->post("{$this->apiUrl}/inventory/upload-images");
            
            if (!$response->successful()) {
                Log::error('Upload failed with response', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception('Image upload failed: ' . $response->body());
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to upload images', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to upload images: ' . $e->getMessage()], 500);
        }
    }

    public function checkLowStock()
    {
        try {
            $lowStockThreshold = env('LOW_STOCK_THRESHOLD', 10);
            $lowStockProducts = array_filter($this->getDummyData()['data']['products'], function($product) use ($lowStockThreshold) {
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
            $products = $this->getDummyData()['data']['products'];
            
            // Generate CSV
            $csv = fopen('php://temp', 'r+');
            fputcsv($csv, ['ID', 'Name', 'SKU', 'Quantity', 'Price']); // Headers
            
            foreach ($products as $product) {
                fputcsv($csv, [
                    $product['id'],
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
}
