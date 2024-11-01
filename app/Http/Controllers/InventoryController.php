<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class InventoryController extends Controller
{
    protected $apiUrl = 'your-external-api-url';

    private function getDummyData()
    {
        return [
            [
                'id' => 1,
                'name' => "Laptop Pro X1",
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
        ];
    }

    public function index()
    {
        try {
            return Inertia::render('Inventory', [
                'inventory' => $this->getDummyData()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch inventory'], 500);
        }
    }

    public function getProducts()
    {
        try {
            // For now, return dummy data instead of making API call
            return response()->json($this->getDummyData());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch products'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $response = Http::post("{$this->apiUrl}/inventory", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
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
            // Handle file uploads to your external service
            $response = Http::attach(
                'images', 
                $request->file('images')
            )->post("{$this->apiUrl}/inventory/upload-images");
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to upload images'], 500);
        }
    }
}
