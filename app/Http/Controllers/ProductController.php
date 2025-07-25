<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
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
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            Log::info('Making API request', [
                'url' => "{$this->apiUrl}/products",
                'client_identifier' => $clientIdentifier
            ]);

            $response = Http::withToken($this->apiToken)    
                ->get("{$this->apiUrl}/products", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                Log::error('API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => "{$this->apiUrl}/products"
                ]);
                
                return back()->withErrors(['error' => 'Failed to fetch products']);
            }

            $products = $response->json();

            return Inertia::render('Products/Index', [
                'products' => $products,
                'currency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in products index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching products']);
        }
    }

    public function create()
    {
        $clientIdentifier = auth()->user()->identifier;
        $jsonAppCurrency = json_decode(auth()->user()->app_currency);
        
        return Inertia::render('Products/Create', [
            'client_identifier' => $clientIdentifier,
            'currency' => $jsonAppCurrency
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'type' => 'required|string|in:physical,digital,service,subscription',
            'sku' => 'nullable|string|max:255',
            'stock_quantity' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:255',
            'file' => 'nullable|file|max:102400', // max 100MB for digital products
            'images' => 'nullable|array',
            'images.*.file' => 'nullable|image|max:2048', // max 2MB per image
            'images.*.alt_text' => 'nullable|string|max:255',
            'images.*.is_primary' => 'boolean',
            'images.*.sort_order' => 'integer|min:0',
            'status' => 'required|string|in:draft,published,archived,inactive',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255',
            'metadata' => 'nullable|array',
            // Supplier related fields
            'supplier_name' => 'nullable|string|max:255',
            'supplier_email' => 'nullable|email|max:255',
            'supplier_phone' => 'nullable|string|max:255',
            'supplier_address' => 'nullable|string|max:500',
            'supplier_website' => 'nullable|url|max:255',
            'supplier_contact_person' => 'nullable|string|max:255',
            // Purchase related fields
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_currency' => 'nullable|string|max:10',
            'purchase_date' => 'nullable|date',
            'purchase_order_number' => 'nullable|string|max:255',
            'purchase_notes' => 'nullable|string|max:1000',
            'reorder_point' => 'nullable|integer|min:0',
            'reorder_quantity' => 'nullable|integer|min:0',
            'lead_time_days' => 'nullable|integer|min:0',
            'payment_terms' => 'nullable|string|max:255',
            'variants' => 'nullable|array',
            'variants.*.sku' => 'nullable|string|max:255',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock_quantity' => 'required_with:variants|integer|min:0',
            'variants.*.weight' => 'nullable|numeric|min:0',
            'variants.*.dimensions' => 'nullable|string|max:255',
            'variants.*.attributes' => 'required_with:variants|array|min:1',
            'variants.*.attributes.*' => 'string|max:255',
            'variants.*.thumbnail' => 'nullable|image|max:2048',
        ]);

        // Handle file uploads for digital products
        if ($request->hasFile('file') && $validated['type'] === 'digital') {
            $path = $request->file('file')->store('products/files', 'public');
            $validated['file_url'] = Storage::disk('public')->url($path);
        }

        // Extract images data before sending to API
        $images = $validated['images'] ?? null;
        unset($validated['images']);

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;
        
        // Extract variants data before sending to API
        $variants = $validated['variants'] ?? null;
        unset($validated['variants']);
        
        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/products", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to create product']);
        }

        $product = $response->json();

        // Upload images if provided
        if ($images && is_array($images)) {
            foreach ($images as $imageData) {
                if (isset($imageData['file']) && $imageData['file'] instanceof \Illuminate\Http\UploadedFile) {
                    // Upload image to local storage
                    $path = $imageData['file']->store('products/images', 'public');
                    $imageUrl = Storage::disk('public')->url($path);

                    // Prepare the image data for API
                    $imagePayload = [
                        'image_url' => $imageUrl,
                        'alt_text' => $imageData['alt_text'] ?? null,
                        'is_primary' => $imageData['is_primary'] ?? false,
                        'sort_order' => $imageData['sort_order'] ?? 0,
                    ];

                    // Send image data to API
                    $imageResponse = Http::withToken($this->apiToken)
                        ->post("{$this->apiUrl}/products/{$product['id']}/images", $imagePayload);

                    if (!$imageResponse->successful()) {
                        Log::error('Failed to create image record', [
                            'product_id' => $product['id'],
                            'image_data' => $imageData,
                            'response' => $imageResponse->json()
                        ]);
                    }
                }
            }
        }

        // Create variants if provided
        if ($variants && $validated['type'] === 'physical') {
            foreach ($variants as $variantData) {
                // Handle variant thumbnail upload
                if (isset($variantData['thumbnail']) && $variantData['thumbnail'] instanceof \Illuminate\Http\UploadedFile) {
                    $path = $variantData['thumbnail']->store('products/variants/thumbnails', 'public');
                    $variantData['thumbnail_url'] = Storage::disk('public')->url($path);
                }
                unset($variantData['thumbnail']);

                $variantResponse = Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/products/{$product['id']}/variants", $variantData);

                if (!$variantResponse->successful()) {
                    Log::error('Failed to create variant', [
                        'product_id' => $product['id'],
                        'variant_data' => $variantData,
                        'response' => $variantResponse->json()
                    ]);
                }
            }
        }

        return redirect()->route('products.index')
            ->with('message', 'Product created successfully');
    }

    public function show($id)
    {
        $jsonAppCurrency = json_decode(auth()->user()->app_currency);
        
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/products/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('products.index')
                ->with('error', 'Product not found');
        }

        return Inertia::render('Products/Show', [
            'product' => $response->json(),
            'currency' => $jsonAppCurrency
        ]);
    }

    public function edit($id)
    {
        $jsonAppCurrency = json_decode(auth()->user()->app_currency);
        
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/products/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('products.index')
                ->with('error', 'Product not found');
        }

        $product = $response->json();
        
        // Debug logging for variants
        Log::info('Product edit API response', [
            'product_id' => $id,
            'product_name' => $product['name'] ?? 'Unknown',
            'has_variants' => isset($product['active_variants']),
            'variants_count' => isset($product['active_variants']) ? count($product['active_variants']) : 0,
            'variants_data' => $product['active_variants'] ?? []
        ]);

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'currency' => $jsonAppCurrency
        ]);
    }

    public function update(Request $request, $id)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'type' => 'required|string|in:physical,digital,service,subscription',
            'sku' => 'nullable|string|max:255',
            'stock_quantity' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:255',
            'status' => 'required|string|in:draft,published,archived,inactive',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255',
            'metadata' => 'nullable|array',
            // Supplier related fields
            'supplier_name' => 'nullable|string|max:255',
            'supplier_email' => 'nullable|email|max:255',
            'supplier_phone' => 'nullable|string|max:255',
            'supplier_address' => 'nullable|string|max:500',
            'supplier_website' => 'nullable|url|max:255',
            'supplier_contact_person' => 'nullable|string|max:255',
            // Purchase related fields
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_currency' => 'nullable|string|max:10',
            'purchase_date' => 'nullable|date',
            'purchase_order_number' => 'nullable|string|max:255',
            'purchase_notes' => 'nullable|string|max:1000',
            'reorder_point' => 'nullable|integer|min:0',
            'reorder_quantity' => 'nullable|integer|min:0',
            'lead_time_days' => 'nullable|integer|min:0',
            'payment_terms' => 'nullable|string|max:255',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|integer|exists:product_variants,id',
            'variants.*.sku' => 'nullable|string|max:255',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock_quantity' => 'required_with:variants|integer|min:0',
            'variants.*.weight' => 'nullable|numeric|min:0',
            'variants.*.dimensions' => 'nullable|string|max:255',
            'variants.*.attributes' => 'required_with:variants|array|min:1',
            'variants.*.attributes.*' => 'string|max:255',
            'variants.*.thumbnail' => 'nullable|image|max:2048',
            'variants.*.is_active' => 'boolean',
            'images' => 'nullable|array',
            'images.*.file' => 'nullable|image|max:2048', // max 2MB per image
            'images.*.alt_text' => 'nullable|string|max:255',
            'images.*.is_primary' => 'boolean',
            'images.*.sort_order' => 'integer|min:0',
        ];

        if ($request->hasFile('file')) {
            $rules['file'] = 'required|file|max:102400'; // max 100MB
        }

        $validated = $request->validate($rules);

        // Handle file uploads
        if ($request->hasFile('file')) {
            // Get the old product data to delete previous file if it exists
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/{$id}");
            
            if ($getResponse->successful()) {
                $product = $getResponse->json();
                if (!empty($product['file_url'])) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $product['file_url']);
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $path = $request->file('file')->store('products/files', 'public');
            $validated['file_url'] = Storage::disk('public')->url($path);
        }

        // Extract variants and images data before sending to API
        $variants = $validated['variants'] ?? null;
        $images = $validated['images'] ?? null;
        unset($validated['variants']);
        unset($validated['images']);

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/products/{$id}", $validated);

        if (!$response->successful()) {
            Log::error('Failed to update product', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return back()->withErrors(['error' => 'Failed to update product: ' . ($response->json()['message'] ?? 'Unknown error')]);
        }

        // Handle variants if provided
        if ($variants && $validated['type'] === 'physical') {
            foreach ($variants as $variantData) {
                // Handle variant thumbnail upload
                if (isset($variantData['thumbnail']) && $variantData['thumbnail'] instanceof \Illuminate\Http\UploadedFile) {
                    $path = $variantData['thumbnail']->store('products/variants/thumbnails', 'public');
                    $variantData['thumbnail_url'] = Storage::disk('public')->url($path);
                }
                unset($variantData['thumbnail']);

                if (isset($variantData['id'])) {
                    // Update existing variant
                    $variantResponse = Http::withToken($this->apiToken)
                        ->put("{$this->apiUrl}/products/{$id}/variants/{$variantData['id']}", $variantData);
                } else {
                    // Create new variant
                    $variantResponse = Http::withToken($this->apiToken)
                        ->post("{$this->apiUrl}/products/{$id}/variants", $variantData);
                }

                if (!$variantResponse->successful()) {
                    Log::error('Failed to update/create variant', [
                        'product_id' => $id,
                        'variant_data' => $variantData,
                        'response' => $variantResponse->json()
                    ]);
                }
            }
        }

        // Handle images if provided
        if ($images && is_array($images)) {
            foreach ($images as $imageData) {
                if (isset($imageData['file']) && $imageData['file'] instanceof \Illuminate\Http\UploadedFile) {
                    // Upload image to local storage
                    $path = $imageData['file']->store('products/images', 'public');
                    $imageUrl = Storage::disk('public')->url($path);

                    // Prepare the image data for API
                    $imagePayload = [
                        'image_url' => $imageUrl,
                        'alt_text' => $imageData['alt_text'] ?? null,
                        'is_primary' => $imageData['is_primary'] ?? false,
                        'sort_order' => $imageData['sort_order'] ?? 0,
                    ];

                    // Send image data to API
                    $imageResponse = Http::withToken($this->apiToken)
                        ->post("{$this->apiUrl}/products/{$id}/images", $imagePayload);

                    if (!$imageResponse->successful()) {
                        Log::error('Failed to create image record', [
                            'product_id' => $id,
                            'image_data' => $imageData,
                            'response' => $imageResponse->json()
                        ]);
                    }
                }
            }
        }

        return redirect()->route('products.index')
            ->with('message', 'Product updated successfully');
    }

    public function destroy($id)
    {
        // Get product data first to get the file and thumbnail paths
        $getResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/products/{$id}");
        
        if ($getResponse->successful()) {
            $product = $getResponse->json();
            
            // Delete the file if it exists
            if (!empty($product['file_url'])) {
                $path = str_replace(Storage::disk('public')->url(''), '', $product['file_url']);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            // Delete all product images if they exist
            if (!empty($product['images']) && is_array($product['images'])) {
                foreach ($product['images'] as $image) {
                    if (!empty($image['image_url'])) {
                        $path = str_replace(Storage::disk('public')->url(''), '', $image['image_url']);
                        if (Storage::disk('public')->exists($path)) {
                            Storage::disk('public')->delete($path);
                        }
                    }
                }
            }
        }

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/products/{$id}");

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to delete product']);
        }

        return redirect()->route('products.index')
            ->with('message', 'Product deleted successfully');
    }

    public function settings()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/settings", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch product settings']);
            }

            return Inertia::render('Products/Settings', [
                'settings' => $response->json(),
                'currency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in products settings', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching product settings']);
        }
    }

    public function getProducts()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch products'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in get products', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching products'], 500);
        }
    }

    public function download($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/{$id}/download");
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to download product']);
            }

            $product = $response->json();
            $filePath = str_replace(Storage::disk('public')->url(''), '', $product['file_url']);
            
            if (!Storage::disk('public')->exists($filePath)) {
                return back()->withErrors(['error' => 'File not found']);
            }

            return Storage::disk('public')->download($filePath, $product['name'] . '.' . pathinfo($filePath, PATHINFO_EXTENSION));
        } catch (\Exception $e) {
            Log::error('Exception in download product', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while downloading the product']);
        }
    }

    public function updateStock(Request $request, $id)
    {
        $validated = $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $response = Http::withToken($this->apiToken)
            ->patch("{$this->apiUrl}/products/{$id}/stock", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to update stock']);
        }

        return back()->with('message', 'Stock updated successfully');
    }

    public function getCategories()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/categories", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch categories'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in get categories', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching categories'], 500);
        }
    }

    // Review-related methods
    public function getReviews($productId, Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $params = $request->all();
            $params['client_identifier'] = $clientIdentifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/{$productId}/reviews", $params);
            
            if (!$response->successful()) {
                Log::error('Failed to fetch reviews', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'product_id' => $productId
                ]);
                return response()->json(['error' => 'Failed to fetch reviews'], 500);
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in getReviews', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'product_id' => $productId
            ]);
            return response()->json(['error' => 'An error occurred while fetching reviews'], 500);
        }
    }

    public function storeReview($productId, Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string|max:5000',
                'rating' => 'required|integer|min:1|max:5',
                'images' => 'nullable|array',
                'images.*' => 'string', // Base64 encoded images
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/products/{$productId}/reviews", [
                    'client_identifier' => $clientIdentifier,
                    'user_id' => auth()->id(),
                    ...$validated
                ]);
            
            if (!$response->successful()) {
                Log::error('Failed to store review', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'product_id' => $productId
                ]);
                return response()->json(['error' => 'Failed to store review'], 500);
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in storeReview', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'product_id' => $productId
            ]);
            return response()->json(['error' => 'An error occurred while storing review'], 500);
        }
    }

    public function voteReview($productId, $reviewId, Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $validated = $request->validate([
                'vote_type' => 'required|string|in:helpful,unhelpful',
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/products/{$productId}/reviews/{$reviewId}/vote", [
                    'client_identifier' => $clientIdentifier,
                    'user_id' => auth()->id(),
                    ...$validated
                ]);
            
            if (!$response->successful()) {
                Log::error('Failed to vote on review', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'product_id' => $productId,
                    'review_id' => $reviewId
                ]);
                return response()->json(['error' => 'Failed to vote on review'], 500);
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in voteReview', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'product_id' => $productId,
                'review_id' => $reviewId
            ]);
            return response()->json(['error' => 'An error occurred while voting on review'], 500);
        }
    }

    public function deleteReview($productId, $reviewId)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/products/{$productId}/reviews/{$reviewId}", [
                    'client_identifier' => $clientIdentifier,
                    'user_id' => auth()->id(),
                ]);
            
            if (!$response->successful()) {
                Log::error('Failed to delete review', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'product_id' => $productId,
                    'review_id' => $reviewId
                ]);
                return response()->json(['error' => 'Failed to delete review'], 500);
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in deleteReview', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'product_id' => $productId,
                'review_id' => $reviewId
            ]);
            return response()->json(['error' => 'An error occurred while deleting review'], 500);
        }
    }

    public function approveReview($productId, $reviewId)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/products/{$productId}/reviews/{$reviewId}/approve", [
                    'client_identifier' => $clientIdentifier,
                    'user_id' => auth()->id(),
                ]);
            
            if (!$response->successful()) {
                Log::error('Failed to approve review', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'product_id' => $productId,
                    'review_id' => $reviewId
                ]);
                return response()->json(['error' => 'Failed to approve review'], 500);
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in approveReview', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'product_id' => $productId,
                'review_id' => $reviewId
            ]);
            return response()->json(['error' => 'An error occurred while approving review'], 500);
        }
    }

    public function toggleFeatureReview($productId, $reviewId)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/products/{$productId}/reviews/{$reviewId}/toggle-feature", [
                    'client_identifier' => $clientIdentifier,
                    'user_id' => auth()->id(),
                ]);
            
            if (!$response->successful()) {
                Log::error('Failed to toggle review feature', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'product_id' => $productId,
                    'review_id' => $reviewId
                ]);
                return response()->json(['error' => 'Failed to toggle review feature'], 500);
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in toggleFeatureReview', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'product_id' => $productId,
                'review_id' => $reviewId
            ]);
            return response()->json(['error' => 'An error occurred while toggling review feature'], 500);
        }
    }
}
