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

        // Handle featured_image validation
        if ($request->hasFile('featured_image')) {
            $rules['featured_image'] = 'image|max:2048';
        } else {
            $rules['featured_image'] = 'nullable';
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

    public function publicShow($slug)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/content-creator/public/{$slug}");
            
            if (!$response->successful()) {
                abort(404, 'Post not found');
            }

            $responseData = $response->json();
            $content = $responseData['content'];
            $suggestedContent = $responseData['suggestedContent'] ?? [];

            // Only show published content publicly
            if ($content['status'] !== 'published') {
                abort(404, 'Post not found');
            }

            // Extract YouTube video IDs from content
            $youtubeVideos = $this->extractYouTubeVideos($content['content']);
            
            // Hide YouTube links in the content
            $content['content'] = $this->hideYouTubeLinks($content['content'], false); // false = completely remove links

            return Inertia::render('ContentCreator/PublicShow', [
                'content' => $content,
                'suggestedContent' => $suggestedContent,
                'youtubeVideos' => $youtubeVideos
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in content public show', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(404, 'Post not found');
        }
    }

    /**
     * Extract YouTube video IDs from content
     */
    private function extractYouTubeVideos($content)
    {
        $videos = [];
        
        // YouTube URL patterns
        $patterns = [
            // youtube.com/watch?v=VIDEO_ID
            '/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/',
            // youtu.be/VIDEO_ID
            '/youtu\.be\/([a-zA-Z0-9_-]{11})/',
            // youtube.com/embed/VIDEO_ID
            '/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/',
            // youtube.com/v/VIDEO_ID
            '/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/',
            // youtube.com/watch?v=VIDEO_ID&other_params
            '/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/',
            // youtube.com/embed/VIDEO_ID?other_params
            '/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})\?/'
        ];

        foreach ($patterns as $pattern) {
            if (preg_match_all($pattern, $content, $matches)) {
                foreach ($matches[1] as $videoId) {
                    if (!in_array($videoId, array_column($videos, 'id'))) {
                        $videos[] = [
                            'id' => $videoId,
                            'embedUrl' => "https://www.youtube.com/embed/{$videoId}?autoplay=1&mute=1&rel=0&modestbranding=1"
                        ];
                    }
                }
            }
        }

        return $videos;
    }

    /**
     * Hide YouTube links in content by removing them or replacing with placeholder text
     */
    private function hideYouTubeLinks($content, $showPlaceholder = false)
    {
        // YouTube URL patterns to hide
        $patterns = [
            // youtube.com/watch?v=VIDEO_ID
            '/https?:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})([&\w=]*)/',
            // youtu.be/VIDEO_ID
            '/https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/',
            // youtube.com/embed/VIDEO_ID
            '/https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/',
            // youtube.com/v/VIDEO_ID
            '/https?:\/\/www\.youtube\.com\/v\/([a-zA-Z0-9_-]{11})/',
            // youtube.com/embed/VIDEO_ID with parameters
            '/https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})\?[^"\s]*/'
        ];

        if ($showPlaceholder) {
            // Replace YouTube links with a subtle placeholder
            $placeholder = '<span class="text-gray-400 dark:text-gray-600 text-sm italic">[Video content available above]</span>';
            foreach ($patterns as $pattern) {
                $content = preg_replace($pattern, $placeholder, $content);
            }
        } else {
            // Replace YouTube links with empty string
            foreach ($patterns as $pattern) {
                $content = preg_replace($pattern, '', $content);
            }
        }

        // Remove anchor tags that contain only YouTube links
        $content = preg_replace('/<a[^>]*href\s*=\s*["\']?https?:\/\/(www\.)?youtube\.com[^"\']*["\']?[^>]*>.*?<\/a>/i', '', $content);
        $content = preg_replace('/<a[^>]*href\s*=\s*["\']?https?:\/\/youtu\.be[^"\']*["\']?[^>]*>.*?<\/a>/i', '', $content);

        // Clean up any empty paragraphs, divs, or spans that might be left
        $content = preg_replace('/<p>\s*<\/p>/', '', $content);
        $content = preg_replace('/<div>\s*<\/div>/', '', $content);
        $content = preg_replace('/<span>\s*<\/span>/', '', $content);
        $content = preg_replace('/<p>\s*&nbsp;\s*<\/p>/', '', $content);
        $content = preg_replace('/<div>\s*&nbsp;\s*<\/div>/', '', $content);
        $content = preg_replace('/<span>\s*&nbsp;\s*<\/span>/', '', $content);

        // Clean up multiple consecutive empty lines
        $content = preg_replace('/\n\s*\n\s*\n/', "\n\n", $content);

        return $content;
    }
}
