<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductVariantController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index($productId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/{$productId}/variants");
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch variants']);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in variants index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching variants'], 500);
        }
    }

    public function store(Request $request, $productId)
    {
        $validated = $request->validate([
            'sku' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|image|max:2048',
            'attributes' => 'required|array|min:1',
            'attributes.*' => 'string|max:255',
            'is_active' => 'boolean',
        ]);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('products/variants/thumbnails', 'public');
            $validated['thumbnail_url'] = Storage::disk('public')->url($path);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/products/{$productId}/variants", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to create variant']);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in variant store', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while creating the variant'], 500);
        }
    }

    public function show($productId, $variantId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/{$productId}/variants/{$variantId}");
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Variant not found'], 404);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in variant show', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching variant details'], 500);
        }
    }

    public function update(Request $request, $productId, $variantId)
    {
        $validated = $request->validate([
            'sku' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|image|max:2048',
            'attributes' => 'sometimes|required|array|min:1',
            'attributes.*' => 'string|max:255',
            'is_active' => 'boolean',
        ]);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            // Get the old variant data to delete previous thumbnail if it exists
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/{$productId}/variants/{$variantId}");
            
            if ($getResponse->successful()) {
                $variant = $getResponse->json();
                if (!empty($variant['thumbnail_url'])) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $variant['thumbnail_url']);
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $path = $request->file('thumbnail')->store('products/variants/thumbnails', 'public');
            $validated['thumbnail_url'] = Storage::disk('public')->url($path);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/products/{$productId}/variants/{$variantId}", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to update variant']);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in variant update', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while updating the variant'], 500);
        }
    }

    public function destroy($productId, $variantId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/products/{$productId}/variants/{$variantId}");

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to delete variant']);
            }

            return response()->json(['message' => 'Variant deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Exception in variant destroy', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while deleting the variant'], 500);
        }
    }

    public function updateStock(Request $request, $productId, $variantId)
    {
        $validated = $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->patch("{$this->apiUrl}/products/{$productId}/variants/{$variantId}/stock", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to update variant stock']);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in variant stock update', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while updating variant stock'], 500);
        }
    }

    public function getAttributes($productId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/{$productId}/variants/attributes");
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch attributes'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in get attributes', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching attributes'], 500);
        }
    }

    public function bulkUpdate(Request $request, $productId)
    {
        $validated = $request->validate([
            'variants' => 'required|array|min:1',
            'variants.*.id' => 'required|exists:product_variants,id',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.is_active' => 'boolean',
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/products/{$productId}/variants/bulk-update", $validated);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to update variants']);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in bulk update variants', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while updating variants'], 500);
        }
    }
} 