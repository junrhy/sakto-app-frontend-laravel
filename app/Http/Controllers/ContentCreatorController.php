<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ContentCreatorController extends Controller
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

            $response = Http::withToken($this->apiToken)    
                ->get("{$this->apiUrl}/content-creator", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            $content = $response->json()['data'];

            return Inertia::render('ContentCreator/Index', [
                'content' => $content
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in content index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching content']);
        }
    }

    public function create()
    {
        $clientIdentifier = auth()->user()->identifier;
        return Inertia::render('ContentCreator/Create', [
            'client_identifier' => $clientIdentifier
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|string|in:draft,published',
            'featured_image' => 'nullable|image|max:2048',
            'author' => 'required|string',
        ]);

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('content_images', 'public');
            $validated['featured_image'] = Storage::disk('public')->url($path);
        }

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;
        
        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/content-creator", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to create post']);
        }

        return redirect()->route('content-creator.index')
            ->with('message', 'Post created successfully');
    }

    public function show($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/content-creator/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('content-creator.index')
                ->with('error', 'Content not found');
        }

        return Inertia::render('ContentCreator/Show', [
            'content' => $response->json()
        ]);
    }

    public function edit($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/content-creator/{$id}");
        
        if (!$response->successful()) {
            return redirect()->route('content-creator.index')
                ->with('error', 'Content not found');
        }

        return Inertia::render('ContentCreator/Edit', [
            'content' => $response->json()
        ]);
    }

    public function update(Request $request, $id)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|string|in:draft,published',
            'author' => 'required|string',
        ];

        if ($request->hasFile('featured_image')) {
            $rules['featured_image'] = 'required|image|max:2048';
        } else {
            $rules['featured_image'] = 'nullable|string';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('featured_image')) {
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/content-creator/{$id}");
            
            if ($getResponse->successful()) {
                $content = $getResponse->json();
                if (!empty($content['featured_image'])) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $content['featured_image']);
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $path = $request->file('featured_image')->store('content_images', 'public');
            $validated['featured_image'] = Storage::disk('public')->url($path);
        }

        $validated['client_identifier'] = auth()->user()->identifier;

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/content-creator/{$id}", $validated);

        if (!$response->successful()) {
            Log::error('Failed to update post', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return back()->withErrors(['error' => 'Failed to update post: ' . ($response->json()['message'] ?? 'Unknown error')]);
        }

        return redirect()->route('content-creator.index')
            ->with('message', 'Post updated successfully');
    }

    public function destroy($id)
    {
        $getResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/content-creator/{$id}");
        
        if ($getResponse->successful()) {
            $content = $getResponse->json();
            
            if (!empty($content['featured_image'])) {
                $path = str_replace(Storage::disk('public')->url(''), '', $content['featured_image']);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/content-creator/{$id}");

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to delete post']);
        }

        return redirect()->route('content-creator.index')
            ->with('message', 'Post deleted successfully');
    }

    public function settings()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/content-creator/settings", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Failed to fetch content settings']);
            }

            return Inertia::render('ContentCreator/Settings', [
                'settings' => $response->json()
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in content settings', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching content settings']);
        }
    }

    public function getContent()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/content-creator/list", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch content list'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception in getContent', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching content list'], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:draft,published,archived'
        ]);

        $response = Http::withToken($this->apiToken)
            ->patch("{$this->apiUrl}/content-creator/{$id}/status", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to update content status']);
        }

        return back()->with('message', 'Content status updated successfully');
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array'
        ]);

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/content-creator/bulk-delete", $validated);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to delete selected content']);
        }

        return back()->with('message', 'Selected content deleted successfully');
    }

    public function preview($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/content-creator/{$id}/preview");
        
        if (!$response->successful()) {
            return redirect()->route('content-creator.index')
                ->with('error', 'Content not found');
        }

        return Inertia::render('ContentCreator/Preview', [
            'content' => $response->json()
        ]);
    }
}
