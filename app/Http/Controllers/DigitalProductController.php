<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DigitalProductController extends Controller
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
            
            Log::info('Making API request', [
                'url' => "{$this->apiUrl}/digital-products",
                'client_identifier' => $clientIdentifier
            ]);

            // $response = Http::withToken($this->apiToken)    
            //     ->get("{$this->apiUrl}/digital-products", [
            //         'client_identifier' => $clientIdentifier
            //     ]);
            
            // if (!$response->successful()) {
            //     Log::error('API request failed', [
            //         'status' => $response->status(),
            //         'body' => $response->body(),
            //         'url' => "{$this->apiUrl}/digital-products"
            //     ]);
                
            //     return back()->withErrors(['error' => 'Failed to fetch digital products']);
            // }

            // $products = $response->json();

            $products = [];

            return Inertia::render('DigitalProducts/Index', [
                'products' => $products
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in digital products index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching digital products']);
        }
    }

    public function create()
    {
        $clientIdentifier = auth()->user()->identifier;
        return Inertia::render('DigitalProducts/Create', [
            'client_identifier' => $clientIdentifier
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'type' => 'required|string|in:ebook,course,software,audio,other',
            'file' => 'required|file|max:102400', // max 100MB
            'thumbnail' => 'nullable|image|max:2048', // max 2MB
            'status' => 'required|string|in:draft,published,archived',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('digital_products', 'public');
            $validated['file_url'] = Storage::disk('public')->url($path);
        }

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('digital_product_thumbnails', 'public');
            $validated['thumbnail_url'] = Storage::disk('public')->url($path);
        }

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;
        
        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/digital-products", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to create digital product']);
        }

        return redirect()->route('digital-products.index')
            ->with('message', 'Digital product created successfully');
    }

    public function show($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/digital-products/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('digital-products.index')
                ->with('error', 'Digital product not found');
        }

        return Inertia::render('DigitalProducts/Show', [
            'product' => $response->json()
        ]);
    }

    public function edit($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/digital-products/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('digital-products.index')
                ->with('error', 'Digital product not found');
        }

        return Inertia::render('DigitalProducts/Edit', [
            'product' => $response->json()
        ]);
    }

    public function update(Request $request, $id)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'type' => 'required|string|in:ebook,course,software,audio,other',
            'status' => 'required|string|in:draft,published,archived',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255',
        ];

        if ($request->hasFile('file')) {
            $rules['file'] = 'required|file|max:102400'; // max 100MB
        }

        if ($request->hasFile('thumbnail')) {
            $rules['thumbnail'] = 'required|image|max:2048'; // max 2MB
        }

        $validated = $request->validate($rules);

        // Handle file uploads
        if ($request->hasFile('file')) {
            // Get the old product data to delete previous file if it exists
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/digital-products/{$id}");
            
            if ($getResponse->successful()) {
                $product = $getResponse->json();
                if (!empty($product['file_url'])) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $product['file_url']);
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $path = $request->file('file')->store('digital_products', 'public');
            $validated['file_url'] = Storage::disk('public')->url($path);
        }

        if ($request->hasFile('thumbnail')) {
            // Get the old product data to delete previous thumbnail if it exists
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/digital-products/{$id}");
            
            if ($getResponse->successful()) {
                $product = $getResponse->json();
                if (!empty($product['thumbnail_url'])) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $product['thumbnail_url']);
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $path = $request->file('thumbnail')->store('digital_product_thumbnails', 'public');
            $validated['thumbnail_url'] = Storage::disk('public')->url($path);
        }

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/digital-products/{$id}", $validated);

        if (!$response->successful()) {
            Log::error('Failed to update digital product', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return back()->withErrors(['error' => 'Failed to update digital product: ' . ($response->json()['message'] ?? 'Unknown error')]);
        }

        return redirect()->route('digital-products.index')
            ->with('message', 'Digital product updated successfully');
    }

    public function destroy($id)
    {
        // Get product data first to get the file and thumbnail paths
        $getResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/digital-products/{$id}");
        
        if ($getResponse->successful()) {
            $product = $getResponse->json();
            
            // Delete the file if it exists
            if (!empty($product['file_url'])) {
                $path = str_replace(Storage::disk('public')->url(''), '', $product['file_url']);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            // Delete the thumbnail if it exists
            if (!empty($product['thumbnail_url'])) {
                $path = str_replace(Storage::disk('public')->url(''), '', $product['thumbnail_url']);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/digital-products/{$id}");

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to delete digital product']);
        }

        return redirect()->route('digital-products.index')
            ->with('message', 'Digital product deleted successfully');
    }

    public function settings()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/digital-products/settings", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch settings']);
            }

            return Inertia::render('DigitalProducts/Settings', [
                'settings' => $response->json()
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in digital products settings', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching settings']);
        }
    }

    public function getProducts()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/digital-products", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch products'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in get digital products', [
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
                ->get("{$this->apiUrl}/digital-products/{$id}/download");
            
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
            Log::error('Exception in download digital product', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while downloading the product']);
        }
    }
}
