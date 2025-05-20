<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PagesController extends Controller
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
                'url' => "{$this->apiUrl}/pages",
                'client_identifier' => $clientIdentifier
            ]);

            $response = Http::withToken($this->apiToken)    
                ->get("{$this->apiUrl}/pages", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                Log::error('API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => "{$this->apiUrl}/pages"
                ]);
                
                return back()->withErrors(['error' => 'Failed to fetch pages']);
            }

            $pages = $response->json();

            return Inertia::render('Pages/Index', [
                'pages' => $pages
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in pages index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching pages']);
        }
    }

    public function create()
    {
        $clientIdentifier = auth()->user()->identifier;
        return Inertia::render('Pages/Create', [
            'client_identifier' => $clientIdentifier
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'content' => 'required|string',
            'meta_description' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'template' => 'nullable|string|max:255',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'featured_image' => 'nullable|image|max:2048', // max 2MB
        ]);

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('page_images', 'public');
            $validated['featured_image'] = Storage::disk('public')->url($path);
        }

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;
        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/pages", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to create page']);
        }

        return redirect()->route('pages.index')
            ->with('message', 'Page created successfully');
    }

    public function show($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/pages/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('pages.index')
                ->with('error', 'Page not found');
        }

        return Inertia::render('Pages/Show', [
            'page' => $response->json()
        ]);
    }

    public function edit($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/pages/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('pages.index')
                ->with('error', 'Page not found');
        }

        return Inertia::render('Pages/Edit', [
            'page' => $response->json()
        ]);
    }

    public function update(Request $request, $id)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'content' => 'required|string',
            'meta_description' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'template' => 'nullable|string|max:255',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
        ];

        if ($request->hasFile('featured_image')) {
            $rules['featured_image'] = 'required|image|max:2048';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('featured_image')) {
            // Get the old page data to delete previous image if it exists
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/pages/{$id}");
            
            if ($getResponse->successful()) {
                $page = $getResponse->json();
                if (!empty($page['featured_image'])) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $page['featured_image']);
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $path = $request->file('featured_image')->store('page_images', 'public');
            $validated['featured_image'] = Storage::disk('public')->url($path);
        }

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/pages/{$id}", $validated);

        if (!$response->successful()) {
            Log::error('Failed to update page', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return back()->withErrors(['error' => 'Failed to update page: ' . ($response->json()['message'] ?? 'Unknown error')]);
        }

        return redirect()->route('pages.index')
            ->with('message', 'Page updated successfully');
    }

    public function destroy($id)
    {
        // Get page data first to get the featured_image path
        $getResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/pages/{$id}");
        
        if ($getResponse->successful()) {
            $page = $getResponse->json();
            
            // Delete the featured_image file if it exists
            if (!empty($page['featured_image'])) {
                $path = str_replace(Storage::disk('public')->url(''), '', $page['featured_image']);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/pages/{$id}");

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to delete page']);
        }

        return redirect()->route('pages.index')
            ->with('message', 'Page deleted successfully');
    }

    public function settings()
    {
        $clientIdentifier = auth()->user()->identifier;
        return Inertia::render('Pages/Settings', [
            'client_identifier' => $clientIdentifier
        ]);
    }

    public function getPages()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/pages", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch pages'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in getPages', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'An error occurred while fetching pages'], 500);
        }
    }

    public function getPage($slug)
    {
        return Inertia::render('Pages/Public', [
            'slug' => $slug
        ]);
    }

    public function getPageBySlug($slug)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/pages/slug/{$slug}");
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Page not found'], 404);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in getPageBySlug', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'An error occurred while fetching the page'], 500);
        }
    }
}
