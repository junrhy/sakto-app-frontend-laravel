<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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
                $threshold = $product['low_stock_threshold'] ?? 10;
                $product['status'] = $product['quantity'] === 0 ? 'out_of_stock' : 
                                   ($product['quantity'] <= $threshold ? 'low_stock' : 'in_stock');
                $product['low_stock_threshold'] = $threshold;
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

            // Handle multiple image uploads - upload to storage and get URLs
            if ($request->hasFile('images')) {
                $imageUrls = [];
                foreach ($request->file('images') as $image) {
                    $path = $image->store('inventory-images', 'public');
                    $imageUrls[] = Storage::disk('public')->url($path);
                }
                $formData['images'] = $imageUrls;
            } else {
                // Ensure images is an empty array if no files
                $formData['images'] = [];
            }

            // Send request to backend API with image URLs
            $response = Http::withToken($this->apiToken)
                ->timeout(30)
                ->asJson()
                ->post("{$this->apiUrl}/inventory", $formData);
            
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
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            // Add client identifier to the request
            $formData = array_merge($request->except('images'), [
                'client_identifier' => auth()->user()->identifier,
                'id' => $id
            ]);

            // Handle multiple image uploads - upload to storage and get URLs
            if ($request->hasFile('images')) {
                $imageUrls = [];
                foreach ($request->file('images') as $image) {
                    $path = $image->store('inventory-images', 'public');
                    $imageUrls[] = Storage::disk('public')->url($path);
                }
                
                // Get existing images from the product if editing
                $existingImagesJson = $request->input('existing_images');
                if ($existingImagesJson) {
                    $existingImages = json_decode($existingImagesJson, true);
                    
                    // Handle case where existing_images might be nested empty array like [[]]
                    if (is_array($existingImages) && count($existingImages) === 1 && is_array($existingImages[0]) && empty($existingImages[0])) {
                        $existingImages = [];
                    }
                    
                    // Filter out any nested arrays or empty values, keep only valid URL strings
                    $existingImages = array_filter($existingImages, function($item) {
                        return is_string($item) && !empty($item);
                    });
                    
                    if (!empty($existingImages) && is_array($existingImages)) {
                        // Merge new images with existing ones
                        $formData['images'] = array_merge(array_values($existingImages), $imageUrls);
                    } else {
                        // Only new images
                        $formData['images'] = $imageUrls;
                    }
                } else {
                    // Only new images
                    $formData['images'] = $imageUrls;
                }
            } else {
                // No new images, but preserve existing ones if provided
                $existingImagesJson = $request->input('existing_images');
                if ($existingImagesJson) {
                    $existingImages = json_decode($existingImagesJson, true);
                    
                    // Handle case where existing_images might be nested empty array like [[]]
                    if (is_array($existingImages) && count($existingImages) === 1 && is_array($existingImages[0]) && empty($existingImages[0])) {
                        $existingImages = [];
                    }
                    
                    // Filter out any nested arrays or empty values, keep only valid URL strings
                    $existingImages = array_filter($existingImages, function($item) {
                        return is_string($item) && !empty($item);
                    });
                    
                    if (!empty($existingImages) && is_array($existingImages)) {
                        $formData['images'] = array_values($existingImages);
                    }
                }
            }

            // Send request to backend API with image URLs
            $response = Http::withToken($this->apiToken)
                ->timeout(30)
                ->asJson()
                ->put("{$this->apiUrl}/inventory/{$id}", $formData);
            
            if (!$response->successful()) {
                Log::error('API request failed (update)', [
                    'response' => $response->body(),
                    'status' => $response->status()
                ]);
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Failed to update product', [
                'error' => $e->getMessage(),
                'request_data' => $request->except('images'),
                'files' => $request->hasFile('images') ? 'Has files' : 'No files'
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
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

    public function bulkOperation(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'required|integer',
                'operation' => 'required|in:price,category,stock',
            ]);

            $payload = [
                'ids' => $request->ids,
                'operation' => $request->operation,
                'client_identifier' => auth()->user()->identifier,
            ];

            if ($request->operation === 'price') {
                $request->validate([
                    'price_type' => 'required|in:percentage,fixed',
                    'price_value' => 'required|numeric',
                ]);
                $payload['price_type'] = $request->price_type;
                $payload['price_value'] = $request->price_value;
            } elseif ($request->operation === 'category') {
                $request->validate([
                    'category_id' => 'required|integer',
                ]);
                $payload['category_id'] = $request->category_id;
            } elseif ($request->operation === 'stock') {
                $request->validate([
                    'stock_action' => 'required|in:add,remove,set',
                    'stock_value' => 'required|integer|min:1',
                ]);
                $payload['stock_action'] = $request->stock_action;
                $payload['stock_value'] = $request->stock_value;
                $payload['performed_by'] = auth()->user()->name ?? 'System';
            }

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/inventory/bulk-operation", $payload);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'Bulk operation completed successfully');
        } catch (\Exception $e) {
            Log::error('Failed to perform bulk operation', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
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

    public function addStock(Request $request, $id)
    {
        try {
            $request->request->add(['client_identifier' => auth()->user()->identifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/inventory/{$id}/stock/add", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'Stock added successfully');
        } catch (\Exception $e) {
            Log::error('Failed to add stock', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function removeStock(Request $request, $id)
    {
        try {
            $request->request->add(['client_identifier' => auth()->user()->identifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/inventory/{$id}/stock/remove", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'Stock removed successfully');
        } catch (\Exception $e) {
            Log::error('Failed to remove stock', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function adjustStock(Request $request, $id)
    {
        try {
            $request->request->add(['client_identifier' => auth()->user()->identifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/inventory/{$id}/stock/adjust", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'Stock adjusted successfully');
        } catch (\Exception $e) {
            Log::error('Failed to adjust stock', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function getStockHistory($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory/{$id}/stock/history", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            $data = $response->json()['data'];
            
            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get stock history', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getLowStockAlerts()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory/low-stock-alerts", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            $data = $response->json()['data'];
            
            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get low stock alerts', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
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

    public function exportProducts(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Fetch data from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory", [
                    'client_identifier' => $clientIdentifier
                ]);

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to Inventory API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $products = $response->json()['data']['products'];
            $categories = $response->json()['data']['categories'] ?? [];
            
            // Get category mapping
            $categoryMap = [];
            foreach ($categories as $category) {
                $categoryMap[$category['id']] = $category['name'];
            }

            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            // Get selected fields from request or use defaults
            $selectedFields = $request->input('fields', ['name', 'sku', 'quantity', 'price']);
            $format = $request->input('format', 'csv');

            // Prepare headers
            $headers = [];
            $fieldLabels = [
                'name' => 'Product Name',
                'sku' => 'SKU',
                'barcode' => 'Barcode',
                'category' => 'Category',
                'quantity' => 'Quantity',
                'low_stock_threshold' => 'Low Stock Threshold',
                'price' => 'Price',
                'status' => 'Status',
                'description' => 'Description',
                'created_at' => 'Created Date',
            ];

            foreach ($selectedFields as $field) {
                if (isset($fieldLabels[$field])) {
                    $headers[] = $fieldLabels[$field];
                }
            }

            // Generate CSV
            $csv = fopen('php://temp', 'r+');
            fputcsv($csv, $headers);
            
            foreach ($products as $product) {
                $row = [];
                $threshold = $product['low_stock_threshold'] ?? 10;
                $status = $product['quantity'] === 0 ? 'Out of Stock' : 
                         ($product['quantity'] <= $threshold ? 'Low Stock' : 'In Stock');
                
                foreach ($selectedFields as $field) {
                    switch ($field) {
                        case 'name':
                            $row[] = $product['name'] ?? '';
                            break;
                        case 'sku':
                            $row[] = $product['sku'] ?? '';
                            break;
                        case 'barcode':
                            $row[] = $product['barcode'] ?? '';
                            break;
                        case 'category':
                            $categoryId = $product['category_id'] ?? null;
                            $row[] = $categoryMap[$categoryId] ?? 'Uncategorized';
                            break;
                        case 'quantity':
                            $row[] = $product['quantity'] ?? 0;
                            break;
                        case 'low_stock_threshold':
                            $row[] = $threshold;
                            break;
                        case 'price':
                            $price = $product['price'] ?? 0;
                            $formattedPrice = $jsonAppCurrency->symbol . number_format(
                                $price, 
                                2, 
                                $jsonAppCurrency->decimal_separator, 
                                $jsonAppCurrency->thousands_separator
                            );
                            $row[] = $formattedPrice;
                            break;
                        case 'status':
                            $row[] = $status;
                            break;
                        case 'description':
                            $row[] = $product['description'] ?? '';
                            break;
                        case 'created_at':
                            $row[] = isset($product['created_at']) ? date('Y-m-d H:i:s', strtotime($product['created_at'])) : '';
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

            $filename = 'inventory_' . date('Y-m-d_His') . '.csv';

            return response($content)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Transfer-Encoding', 'binary');
        } catch (\Exception $e) {
            Log::error('Failed to export products', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to export products: ' . $e->getMessage()], 500);
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

    // Variant Management Methods
    public function getVariants($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory/{$id}/variants", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            $data = $response->json()['data'];
            
            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get variants', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function storeVariant(Request $request, $id)
    {
        try {
            $request->request->add(['client_identifier' => auth()->user()->identifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/inventory/{$id}/variants", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'Variant created successfully');
        } catch (\Exception $e) {
            Log::error('Failed to create variant', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function updateVariant(Request $request, $id, $variantId)
    {
        try {
            $request->request->add(['client_identifier' => auth()->user()->identifier]);
            
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/inventory/{$id}/variants/{$variantId}", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'Variant updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update variant', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroyVariant($id, $variantId)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/inventory/{$id}/variants/{$variantId}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'Variant deleted successfully');
        } catch (\Exception $e) {
            Log::error('Failed to delete variant', [
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // Discount Management Methods
    public function getDiscounts()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory/discounts", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            $data = $response->json()['data'];
            
            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get discounts', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getActiveDiscounts()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory/discounts/active", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            $data = $response->json()['data'];
            
            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get active discounts', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function storeDiscount(Request $request)
    {
        try {
            $request->request->add(['client_identifier' => auth()->user()->identifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/inventory/discounts", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'Discount created successfully');
        } catch (\Exception $e) {
            Log::error('Failed to create discount', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function updateDiscount(Request $request, $id)
    {
        try {
            $request->request->add(['client_identifier' => auth()->user()->identifier]);
            
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/inventory/discounts/{$id}", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'Discount updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update discount', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroyDiscount($id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/inventory/discounts/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'Discount deleted successfully');
        } catch (\Exception $e) {
            Log::error('Failed to delete discount', [
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function calculateDiscount(Request $request)
    {
        try {
            $request->request->add(['client_identifier' => auth()->user()->identifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/inventory/discounts/calculate", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            $data = $response->json()['data'];
            
            return response()->json([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to calculate discount', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function discounts()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Fetch discounts
            $discountsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory/discounts", [
                    'client_identifier' => $clientIdentifier
                ]);

            // Fetch categories
            $categoriesResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory", [
                    'client_identifier' => $clientIdentifier
                ]);

            // Fetch products
            $productsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/inventory", [
                    'client_identifier' => $clientIdentifier
                ]);

            $discounts = $discountsResponse->successful() ? ($discountsResponse->json()['data'] ?? []) : [];
            $categories = $categoriesResponse->successful() ? ($categoriesResponse->json()['data']['categories'] ?? []) : [];
            $products = $productsResponse->successful() ? ($productsResponse->json()['data']['products'] ?? []) : [];

            $items = array_map(function($product) {
                return [
                    'id' => $product['id'],
                    'name' => $product['name'],
                ];
            }, $products ?? []);

            return Inertia::render('PosRetail/Discounts', [
                'discounts' => $discounts,
                'categories' => $categories,
                'items' => $items,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load discounts page', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
