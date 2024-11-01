<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InventoryController extends Controller
{
    protected $apiUrl;

    public function __construct()
    {
        $this->apiUrl = env('INVENTORY_API_URL');
        
        // Set PHP execution time for long-running requests
        set_time_limit((int)env('MAX_EXECUTION_TIME', 300));
        
        // Increase memory limit if needed
        ini_set('memory_limit', '256M');
    }

    private function getDummyData()
    {
        return [
            'status' => 'success',
            'message' => 'Products retrieved successfully',
            'data' => [
                'products' => [
                    [
                        'id' => 1,
                        'name' => "Laptop Pro Y1",
                        'sku' => "LPT-001",
                        'quantity' => 25,
                        'price' => 1299.99,
                        'images' => [
                            'https://picsum.photos/200/200?random=1',
                            'https://picsum.photos/200/200?random=2'
                        ]
                    ],
                    [
                        'id' => 2,
                        'name' => "Wireless Mouse M1",
                        'sku' => "WM-002",
                        'quantity' => 150,
                        'price' => 49.99,
                        'images' => [
                            'https://picsum.photos/200/200?random=3'
                        ]
                    ],
                    [
                        'id' => 3,
                        'name' => "4K Monitor 27\"",
                        'sku' => "MON-003",
                        'quantity' => 45,
                        'price' => 399.99,
                        'images' => [
                            'https://picsum.photos/200/200?random=4',
                            'https://picsum.photos/200/200?random=5',
                            'https://picsum.photos/200/200?random=6'
                        ]
                    ],
                    [
                        'id' => 4,
                        'name' => "Mechanical Keyboard",
                        'sku' => "KB-004",
                        'quantity' => 75,
                        'price' => 129.99,
                        'images' => []
                    ],
                    [
                        'id' => 5,
                        'name' => "USB-C Hub",
                        'sku' => "USB-005",
                        'quantity' => 200,
                        'price' => 79.99,
                        'images' => [
                            'https://picsum.photos/200/200?random=7'
                        ]
                    ],
                    [
                        'id' => 6,
                        'name' => "Wireless Headphones",
                        'sku' => "WH-006",
                        'quantity' => 60,
                        'price' => 199.99,
                        'images' => [
                            'https://picsum.photos/200/200?random=8',
                            'https://picsum.photos/200/200?random=9'
                        ]
                    ],
                    [
                        'id' => 7,
                        'name' => "Gaming Mouse Pad XL",
                        'sku' => "MP-007",
                        'quantity' => 100,
                        'price' => 29.99,
                        'images' => [
                            'https://picsum.photos/200/200?random=10'
                        ]
                    ],
                    [
                        'id' => 8,
                        'name' => "Webcam Pro 4K",
                        'sku' => "WC-008",
                        'quantity' => 30,
                        'price' => 149.99,
                        'images' => [
                            'https://picsum.photos/200/200?random=11',
                            'https://picsum.photos/200/200?random=12'
                        ]
                    ],
                    [
                        'id' => 9,
                        'name' => "External SSD 1TB",
                        'sku' => "SSD-009",
                        'quantity' => 40,
                        'price' => 159.99,
                        'images' => [
                            'https://picsum.photos/200/200?random=13'
                        ]
                    ],
                    [
                        'id' => 10,
                        'name' => "Graphics Card RTX",
                        'sku' => "GPU-010",
                        'quantity' => 15,
                        'price' => 799.99,
                        'images' => [
                            'https://picsum.photos/200/200?random=14',
                            'https://picsum.photos/200/200?random=15',
                            'https://picsum.photos/200/200?random=16'
                        ]
                    ]
                ],
                'meta' => [
                    'total' => 10,
                    'page' => 1,
                    'per_page' => 10,
                    'total_pages' => 1
                ]
            ]
        ];
    }

    public function index()
    {
        try {
            $inventoryData = $this->getDummyData()['data']['products'];
            $inventoryData = array_map(function($product) {
                $product['status'] = $product['quantity'] === 0 ? 'out_of_stock' : 
                                   ($product['quantity'] <= 10 ? 'low_stock' : 'in_stock');
                $product['category_id'] = 1; // Add dummy category for now
                return $product;
            }, $inventoryData);
            
            Log::info('Inventory data retrieved successfully');
            
            return Inertia::render('Inventory', [
                'inventory' => $inventoryData
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch inventory', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch inventory'], 500);
        }
    }

    public function getProducts()
    {
        try {
            return response()->json($this->getDummyData());
        } catch (\Exception $e) {
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
            $response = Http::timeout(30)->post("{$this->apiUrl}/inventory", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to create product', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            return response()->json(['error' => 'Failed to create product'], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $response = Http::put("{$this->apiUrl}/inventory/{$id}", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update product'], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $response = Http::delete("{$this->apiUrl}/inventory/{$id}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete product'], 500);
        }
    }

    public function bulkDestroy(Request $request)
    {
        try {
            $response = Http::delete("{$this->apiUrl}/inventory/bulk", [
                'ids' => $request->ids
            ]);
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete products'], 500);
        }
    }

    public function uploadImages(Request $request)
    {
        try {
            if (!$request->hasFile('images')) {
                return response()->json(['error' => 'No images provided'], 400);
            }

            // Set a longer timeout for file uploads
            $timeout = (int)env('API_UPLOAD_TIMEOUT', 300);
            
            // Handle multiple files
            $files = $request->file('images');
            $files = is_array($files) ? $files : [$files];
            
            $response = Http::timeout($timeout)
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
