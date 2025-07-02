<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class LandingController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index(Request $request)
    {
        // Check if the request is from a mobile device
        if ($request->header('User-Agent') && preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i', $request->header('User-Agent'))) {
            return redirect()->route('login');
        }

        if (str_contains($request->getHost(), 'shop') || str_contains($request->getPathInfo(), 'shop')) {
            return Inertia::render('Landing/Shop', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'delivery') || str_contains($request->getPathInfo(), 'delivery')) {
            return Inertia::render('Landing/Delivery', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'jobs') || str_contains($request->getPathInfo(), 'jobs')) {
            return Inertia::render('Landing/Jobs', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'community') || str_contains($request->getPathInfo(), 'community')) {
            return Inertia::render('Landing/Community', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        if (str_contains($request->getHost(), 'logistics') || str_contains($request->getPathInfo(), 'logistics')) {
            return Inertia::render('Landing/Logistics', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        return Inertia::render('Landing/Default', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function shop()
    {
        return Inertia::render('Landing/Shop', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function delivery()
    {
        return Inertia::render('Landing/Delivery', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function jobs()
    {
        return Inertia::render('Landing/Jobs', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function community()
    {
        $communityUsers = User::where('project_identifier', 'community')
            ->select('id', 'name', 'email', 'created_at', 'slug')
            ->latest()
            ->get();

        return Inertia::render('Landing/Community/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'communityUsers' => $communityUsers,
        ]);
    }

    public function communityMember($identifier)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                ->first();
        }

        if (!$member) {
            abort(404, 'Member not found');
        }

        // Decode the app_currency JSON
        $member->app_currency = json_decode($member->app_currency);

        // Fetch challenges from API
        $challenges = [];
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/challenges", [
                    'client_identifier' => $member->identifier,
                    'limit' => 5 // Get only the latest 5 challenges
                ]);
            if ($response->successful()) {
                $challenges = $response->json();
            }
        } catch (\Exception $e) {
            // Optionally log error
        }

        // Fetch events from API
        $events = [];
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events", [
                    'client_identifier' => $member->identifier,
                    'is_public' => true,
                    'limit' => 5 // Get only the latest 5 events
                ]);
            if ($response->successful()) {
                $responseData = $response->json();
                $events = $responseData['data'] ?? [];
            }
        } catch (\Exception $e) {
            // Optionally log error
        }

        // Fetch pages from API
        $pages = [];
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/pages", [
                    'client_identifier' => $member->identifier,
                    'is_published' => true
                ]);
            if ($response->successful()) {
                $responseData = $response->json();
                $pages = $responseData['data'] ?? [];
            }
        } catch (\Exception $e) {
            // Optionally log error
        }

        // Fetch contacts from API
        $contacts = [];
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contacts", [
                    'client_identifier' => $member->identifier
                ]);
            if ($response->successful()) {
                $contacts = $response->json();
            }
        } catch (\Exception $e) {
            // Optionally log error
        }

        // Fetch content/updates from API
        $updates = [];
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/content-creator", [
                    'client_identifier' => $member->identifier,
                    'status' => 'published',
                    'limit' => 10 // Get the latest 10 published content items
                ]);
            if ($response->successful()) {
                $responseData = $response->json();
                $updates = $responseData['data'] ?? [];
            }
        } catch (\Exception $e) {
            // Optionally log error
        }

        // Fetch products from API
        $products = [];
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products", [
                    'client_identifier' => $member->identifier,
                    'status' => 'published',
                    'limit' => 6 // Get only the latest 6 products for marketplace display
                ]);
            if ($response->successful()) {
                $products = $response->json();
            }
        } catch (\Exception $e) {
            // Optionally log error
        }

        // Fetch order history from API (will be used when visitor is authenticated)
        $orderHistory = [];
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders", [
                    'client_identifier' => $member->identifier,
                    'per_page' => 50 // Get more orders for order history
                ]);
            if ($response->successful()) {
                $responseData = $response->json();
                $orderHistory = $responseData['data'] ?? [];
            }
        } catch (\Exception $e) {
            // Optionally log error
        }

        return Inertia::render('Landing/Community/MemberRefactored', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'member' => $member,
            'challenges' => $challenges,
            'events' => $events,
            'pages' => $pages,
            'contacts' => $contacts,
            'updates' => $updates,
            'products' => $products,
            'orderHistory' => $orderHistory
        ]);
    }

    public function logistics()
    {
        return Inertia::render('Landing/Logistics', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }
} 