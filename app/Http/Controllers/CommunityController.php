<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class CommunityController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index()
    {
        $communityUsers = User::where('project_identifier', 'community')
            ->select('id', 'name', 'email', 'created_at', 'slug')
            ->latest()
            ->get();

        // Fetch total contacts count from backend API
        $totalContacts = 0;
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contacts/total/count");
            
            if ($response->successful()) {
                $responseData = $response->json();
                $totalContacts = $responseData['data']['total_contacts'] ?? 0;
            }
        } catch (\Exception $e) {
            // Log error but continue with default value
            \Log::error('Failed to fetch total contacts count: ' . $e->getMessage());
        }

        return Inertia::render('Public/Community/Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'communityUsers' => $communityUsers,
            'totalContacts' => $totalContacts,
        ]);
    }

    public function about()
    {
        return Inertia::render('Public/Community/AboutUs');
    }

    public function help()
    {
        return Inertia::render('Public/Community/HelpCenter');
    }

    public function search()
    {
        $communityUsers = User::where('project_identifier', 'community')
            ->select('id', 'name', 'email', 'created_at', 'slug')
            ->latest()
            ->get();

        // Fetch total contacts count from backend API
        $totalContacts = 0;
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/contacts/total/count");
            
            if ($response->successful()) {
                $responseData = $response->json();
                $totalContacts = $responseData['data']['total_contacts'] ?? 0;
            }
        } catch (\Exception $e) {
            // Log error but continue with default value
            \Log::error('Failed to fetch total contacts count: ' . $e->getMessage());
        }

        return Inertia::render('Public/Community/SearchMember', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'communityUsers' => $communityUsers,
            'totalContacts' => $totalContacts,
        ]);
    }



    public function member($identifier)
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
                $responseData = $response->json();
                $contacts = $responseData['data'] ?? [];
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

        // Fetch courses from API
        $courses = [];
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/courses", [
                    'client_identifier' => $member->identifier,
                    'status' => 'published',
                    'limit' => 6 // Get only the latest 6 courses for display
                ]);
            if ($response->successful()) {
                $responseData = $response->json();
                $courses = $responseData['data'] ?? [];
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

        return Inertia::render('Public/Community/Member', [
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
            'courses' => $courses,
            'orderHistory' => $orderHistory,
            'appUrl' => config('app.url')
        ]);
    }

    public function cancelOrder(Request $request, $identifier, $orderId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            // Call the backend API to cancel the order
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/product-orders/{$orderId}", [
                    'order_status' => 'cancelled'
                ]);

            if ($response->successful()) {
                return response()->json([
                    'message' => 'Order cancelled successfully',
                    'order' => $response->json()
                ]);
            } else {
                $errorData = $response->json();
                return response()->json([
                    'error' => $errorData['error'] ?? 'Failed to cancel order'
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Network error occurred while cancelling order'
            ], 500);
        }
    }

    public function searchLendingRecords(Request $request, $identifier)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $borrowerName = $request->input('borrower_name');
            
            // Fetch lending records from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/lending", [
                    'client_identifier' => $member->identifier,
                    'borrower_name' => $borrowerName
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $loans = $data['data']['loans'] ?? [];
                
                // Filter loans by borrower name (case-insensitive)
                $matchingLoans = collect($loans)->filter(function ($loan) use ($borrowerName) {
                    return stripos($loan['borrower_name'], $borrowerName) !== false;
                })->values();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'loans' => $matchingLoans,
                        'total_found' => $matchingLoans->count()
                    ]
                ]);
            } else {
                return response()->json([
                    'error' => 'Failed to fetch lending records'
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Network error occurred while searching lending records'
            ], 500);
        }
    }

    public function searchHealthcareRecords(Request $request, $identifier)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $searchParams = $request->only(['name', 'gender', 'date_of_birth']);
            
            // Fetch health insurance records from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/health-insurance", [
                    'client_identifier' => $member->identifier
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $members = $data['data']['members'] ?? [];

                // Filter members by search criteria
                $matchingMembers = collect($members)->filter(function ($member) use ($searchParams) {
                    $matches = true;
                    
                    if (!empty($searchParams['name'])) {
                        $matches = $matches && stripos($member['name'], $searchParams['name']) !== false;
                    }

                    if (!empty($searchParams['gender'])) {
                        $matches = $matches && strtolower($member['gender']) === strtolower($searchParams['gender']);
                    }

                    if (!empty($searchParams['phone'])) {
                        $matches = $matches && strtolower($member['contact_number']) === strtolower($searchParams['phone']);
                    }
                    
                    if (!empty($searchParams['date_of_birth'])) {
                        // Format the date_of_birth from ISO format to Y-m-d format for comparison
                        $memberDateOfBirth = date('Y-m-d', strtotime($member['date_of_birth']));
                        $matches = $matches && $memberDateOfBirth === $searchParams['date_of_birth'];
                    }

                    return $matches;
                })->values();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'members' => $matchingMembers,
                        'total_found' => $matchingMembers->count()
                    ]
                ]);
            } else {
                return response()->json([
                    'error' => 'Failed to fetch healthcare records'
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Network error occurred while searching healthcare records'
            ], 500);
        }
    }

    public function searchMortuaryRecords(Request $request, $identifier)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $searchParams = $request->only(['name', 'gender', 'date_of_birth']);
            
            // Fetch mortuary records from API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/mortuary", [
                    'client_identifier' => $member->identifier
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $members = $data['data']['members'] ?? [];
                
                // Filter members by search criteria
                $matchingMembers = collect($members)->filter(function ($member) use ($searchParams) {
                    $matches = true;
                    
                    if (!empty($searchParams['name'])) {
                        $matches = $matches && stripos($member['name'], $searchParams['name']) !== false;
                    }
                    
                    if (!empty($searchParams['gender'])) {
                        $matches = $matches && strtolower($member['gender']) === strtolower($searchParams['gender']);
                    }

                    if (!empty($searchParams['phone'])) {
                        $matches = $matches && strtolower($member['contact_number']) === strtolower($searchParams['phone']);
                    }
                    
                    if (!empty($searchParams['date_of_birth'])) {
                        // Format the date_of_birth from ISO format to Y-m-d format for comparison
                        $memberDateOfBirth = date('Y-m-d', strtotime($member['date_of_birth']));
                        $matches = $matches && $memberDateOfBirth === $searchParams['date_of_birth'];
                    }

                    
                    return $matches;
                })->values();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'members' => $matchingMembers,
                        'total_found' => $matchingMembers->count()
                    ]
                ]);
            } else {
                return response()->json([
                    'error' => 'Failed to fetch mortuary records'
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Network error occurred while searching mortuary records'
            ], 500);
        }
    }

    public function getUserProducts($identifier, Request $request)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        } elseif (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        $contactId = $request->query('contact_id');
        
        if (!$contactId) {
            return response()->json(['error' => 'Contact ID is required'], 400);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products", [
                    'client_identifier' => $member->identifier,
                    'contact_products' => true,
                    'contact_id' => $contactId
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json(['error' => 'Failed to fetch products'], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while fetching products'], 500);
        }
    }

    public function createUserProduct(Request $request, $identifier)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        } elseif (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        // Validate the request
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
            'status' => 'required|string|in:draft,published,archived,inactive',
            'tags' => 'nullable|string', // Changed to string since it comes as JSON
            'contact_id' => 'nullable|integer',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max per image
        ]);

        // Add client identifier
        $validated['client_identifier'] = $member->identifier;

        // Handle tags if they come as JSON string
        if (isset($validated['tags']) && is_string($validated['tags'])) {
            $validated['tags'] = json_decode($validated['tags'], true) ?? [];
        }

        // Extract images data before sending to API
        $images = $request->file('images') ?? null;
        unset($validated['images']);

        try {
            // Send product data to API first
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/products", $validated);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to create product'], $response->status());
            }

            $product = $response->json();

            // Upload images if provided
            if ($images && is_array($images)) {
                foreach ($images as $image) {
                    if ($image instanceof \Illuminate\Http\UploadedFile) {
                        // Upload image to local storage
                        $path = $image->store('products/images', 'public');
                        $imageUrl = \Illuminate\Support\Facades\Storage::disk('public')->url($path);

                        // Prepare the image data for API
                        $imagePayload = [
                            'image_url' => $imageUrl,
                            'alt_text' => $image->getClientOriginalName(),
                            'is_primary' => false,
                            'sort_order' => 0,
                        ];

                        // Send image data to API
                        $imageResponse = Http::withToken($this->apiToken)
                            ->post("{$this->apiUrl}/products/{$product['id']}/images", $imagePayload);

                        if (!$imageResponse->successful()) {
                            \Illuminate\Support\Facades\Log::error('Failed to create image record', [
                                'product_id' => $product['id'],
                                'image_data' => $imagePayload,
                                'response' => $imageResponse->json()
                            ]);
                        }
                    }
                }
            }

            return response()->json($product, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while creating the product'], 500);
        }
    }

    public function deleteUserProduct($identifier, $productId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        } elseif (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/products/{$productId}");

            if ($response->successful()) {
                return response()->json(['message' => 'Product deleted successfully']);
            } else {
                return response()->json(['error' => 'Failed to delete product'], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while deleting the product'], 500);
        }
    }

    public function updateUserProduct(Request $request, $identifier, $productId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        } elseif (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/products/{$productId}", $request->all());

            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json(['error' => 'Failed to update product'], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while updating the product'], 500);
        }
    }

    public function uploadProductImages(Request $request, $identifier, $productId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        } elseif (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        // Validate the request
        $validated = $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            // Upload images if provided
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    if ($image instanceof \Illuminate\Http\UploadedFile) {
                        // Upload image to local storage
                        $path = $image->store('products/images', 'public');
                        $imageUrl = \Illuminate\Support\Facades\Storage::disk('public')->url($path);

                        // Prepare the image data for API
                        $imagePayload = [
                            'image_url' => $imageUrl,
                            'alt_text' => $image->getClientOriginalName(),
                            'is_primary' => false,
                            'sort_order' => 0,
                        ];

                        // Send image data to API
                        $imageResponse = Http::withToken($this->apiToken)
                            ->post("{$this->apiUrl}/products/{$productId}/images", $imagePayload);

                        if (!$imageResponse->successful()) {
                            \Illuminate\Support\Facades\Log::error('Failed to create image record', [
                                'product_id' => $productId,
                                'image_data' => $imagePayload,
                                'response' => $imageResponse->json()
                            ]);
                        }
                    }
                }
            }

            return response()->json(['message' => 'Images uploaded successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while uploading images'], 500);
        }
    }

    public function deleteProductImage($identifier, $productId, $imageId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        // Check if identifier is a UUID (36 characters with hyphens in specific positions)
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $identifier)) {
            // Search by identifier (UUID)
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        } elseif (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            // First, get the image details to delete the file from storage
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/{$productId}/images/{$imageId}");

            if ($getResponse->successful()) {
                $image = $getResponse->json();
                
                // Delete the image file from storage if it exists
                if (!empty($image['image_url'])) {
                    $path = str_replace(\Illuminate\Support\Facades\Storage::disk('public')->url(''), '', $image['image_url']);
                    if (\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
                    }
                }
            }

            // Delete the image record from the backend API
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/products/{$productId}/images/{$imageId}");

            if ($response->successful()) {
                return response()->json(['message' => 'Image deleted successfully']);
            } else {
                return response()->json(['error' => 'Failed to delete image'], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while deleting the image'], 500);
        }
    }

    public function getOrdersForProduct($identifier, $productId, Request $request)
    {
        try {
            $params = $request->all();
            $params['client_identifier'] = $identifier;
            
            \Log::info('Fetching orders for product from API', [
                'identifier' => $identifier,
                'product_id' => $productId,
                'params' => $params
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders/product/{$productId}", $params);
            
            \Log::info('API response for product orders', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body_length' => strlen($response->body())
            ]);
            
            if (!$response->successful()) {
                \Log::error('Failed to fetch product orders', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json(['error' => 'Failed to fetch orders for this product'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            \Log::error('Exception in getOrdersForProduct', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'An error occurred while fetching orders for this product'], 500);
        }
    }

    public function productDetail($identifier, $productId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        // Check if identifier is a UUID (36 characters with hyphens in specific positions)
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $identifier)) {
            // Search by identifier (UUID)
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        } elseif (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }
        if (!$member) {
            abort(404, 'Member not found');
        }

        // Fetch product details from backend API
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/{$productId}", [
                    'client_identifier' => $member->identifier
                ]);

            if ($response->successful()) {
                $product = $response->json() ?? null;
                
                if (!$product) {
                    abort(404, 'Product not found');
                }

                $appCurrency = json_decode($member->app_currency) ?? null;

                return Inertia::render('Public/Community/ProductDetail', [
                    'product' => $product,
                    'appCurrency' => $appCurrency,
                    'member' => [
                        'id' => $member->id,
                        'identifier' => $member->slug ?? $member->id,
                        'name' => $member->name,
                    ],
                ]);
            } else {
                abort(404, 'Product not found');
            }
        } catch (\Exception $e) {
            abort(500, 'Failed to load product details');
        }
    }

    public function checkout($identifier)
    {
        // Check if identifier is a UUID (36 characters with hyphens in specific positions)
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $identifier)) {
            // Search by identifier (UUID)
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        } elseif (is_numeric($identifier)) {
            // Search by ID
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            // Search by slug
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }
        
        if (!$member) {
            abort(404, 'Member not found');
        }

        // Fetch products from backend API
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products", [
                    'client_identifier' => $member->identifier
                ]);
            if ($response->successful()) {
                $products = $response->json();
            } else {
                $products = [];
            }
        } catch (\Exception $e) {
            $products = [];
        }

        return Inertia::render('Public/Community/Checkout', [
            'products' => $products,
            'member' => [
                'id' => $member->id,
                'identifier' => $member->identifier, // Use the actual UUID identifier
                'name' => $member->name,
            ],
            'appCurrency' => json_decode($member->app_currency) ?? null,
        ]);
    }

    public function sendSignUpLink(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'member_id' => 'required|integer',
            'registration_url' => 'required|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $email = $request->email;
            $memberId = $request->member_id;
            $registrationUrl = $request->registration_url;

            // Get member details for email
            $member = User::where('project_identifier', 'community')
                ->where('id', $memberId)
                ->first();

            if (!$member) {
                return response()->json([
                    'message' => 'Member not found'
                ], 404);
            }

            // Send email with registration link
            Mail::send('emails.signup-link', [
                'registrationUrl' => $registrationUrl,
                'email' => $email,
                'memberName' => $member->name
            ], function ($message) use ($email, $member) {
                $message->to($email)
                        ->from(config('mail.from.address'), $member->name)
                        ->subject("Complete Your Registration - {$member->name}'s App");
            });

            return response()->json([
                'message' => 'Registration link sent successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send registration link. Please try again.'
            ], 500);
        }
    }

    /**
     * Get courses for a community member (view only).
     */
    public function getCourses(Request $request, $identifier)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/courses", [
                    'client_identifier' => $member->identifier,
                    'status' => 'published',
                    'per_page' => $request->get('per_page', 12),
                    'page' => $request->get('page', 1),
                    'search' => $request->get('search', ''),
                    'category' => $request->get('category', ''),
                    'featured' => $request->get('featured', false),
                    'free' => $request->get('free', false),
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json([
                    'error' => 'Failed to fetch courses',
                    'data' => []
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Network error occurred while fetching courses',
                'data' => []
            ], 500);
        }
    }

    /**
     * Get course categories for a community member (view only).
     */
    public function getCourseCategories(Request $request, $identifier)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/courses/categories", [
                    'client_identifier' => $member->identifier
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json([
                    'error' => 'Failed to fetch course categories',
                    'data' => []
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Network error occurred while fetching course categories',
                'data' => []
            ], 500);
        }
    }

    /**
     * Show a specific course for a community member (view only).
     */
    public function showCourse(Request $request, $identifier, $courseId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            abort(404, 'Member not found');
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/courses/{$courseId}");

            if ($response->successful()) {
                $course = $response->json()['data'];
            } else {
                abort(404, 'Course not found');
            }

            // Get contact information if contact_id is provided
            $contact = null;
            $contactId = null;
            
            if ($request->has('contact_id')) {
                $contactId = $request->contact_id;
                $contactResponse = Http::withToken($this->apiToken)
                    ->get("{$this->apiUrl}/contacts/{$contactId}", [
                        'client_identifier' => $member->identifier
                    ]);
                
                if ($contactResponse->successful()) {
                    $contact = $contactResponse->json();
                }
            }

            // Check enrollment status and get progress if contact is provided
            $progress = null;
            if ($contactId) {
                // First check enrollment status
                $enrollmentCheckResponse = Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/course-enrollments/check-status", [
                        'course_id' => $courseId,
                        'contact_id' => $contactId,
                        'client_identifier' => $member->identifier,
                    ]);

                if ($enrollmentCheckResponse->successful()) {
                    $enrollmentData = $enrollmentCheckResponse->json()['data'];
                    
                    if ($enrollmentData['is_enrolled'] && $enrollmentData['enrollment']) {
                        // Get detailed progress for enrolled user
                        $progressResponse = Http::withToken($this->apiToken)
                            ->get("{$this->apiUrl}/course-progress/{$courseId}/{$contactId}");

                        if ($progressResponse->successful()) {
                            $progress = $progressResponse->json()['data'];
                        }
                    }
                }
            }

            return Inertia::render('Public/Community/Course/Show', [
                'member' => $member,
                'course' => $course,
                'viewingContact' => $contact,
                'progress' => $progress,
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
                'appUrl' => config('app.url')
            ]);
        } catch (\Exception $e) {
            abort(404, 'Course not found');
        }
    }

    /**
     * Get course lessons for a community member (view only).
     */
    public function getCourseLessons(Request $request, $identifier, $courseId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            // Build the API URL with contact_id if provided
            $apiUrl = "{$this->apiUrl}/courses/{$courseId}/lessons";
            if ($request->has('contact_id')) {
                $apiUrl .= '?contact_id=' . $request->contact_id;
            }

            $response = Http::withToken($this->apiToken)
                ->get($apiUrl);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch lessons',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show course lessons page for a community member (view only).
     */
    public function showCourseLessons(Request $request, $identifier, $courseId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            abort(404, 'Member not found');
        }

        try {
            // Get course details
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/courses/{$courseId}");

            if ($response->successful()) {
                $course = $response->json()['data'];
            } else {
                abort(404, 'Course not found');
            }

            // Get contact information if contact_id is provided
            $contact = null;
            $contactId = null;
            
            if ($request->has('contact_id')) {
                $contactId = $request->contact_id;
                $contactResponse = Http::withToken($this->apiToken)
                    ->get("{$this->apiUrl}/contacts/{$contactId}", [
                        'client_identifier' => $member->identifier
                    ]);
                
                if ($contactResponse->successful()) {
                    $contact = $contactResponse->json();
                }
            }

            // Get lessons for this course
            $lessonsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/courses/{$courseId}/lessons");

            $lessons = [];
            if ($lessonsResponse->successful()) {
                $lessons = $lessonsResponse->json()['data'] ?? [];
            }

            // Check enrollment status and get progress if contact is provided
            $progress = null;
            if ($contactId) {
                // First check enrollment status
                $enrollmentCheckResponse = Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/course-enrollments/check-status", [
                        'course_id' => $courseId,
                        'contact_id' => $contactId,
                        'client_identifier' => $member->identifier,
                    ]);

                if ($enrollmentCheckResponse->successful()) {
                    $enrollmentData = $enrollmentCheckResponse->json()['data'];
                    
                    if ($enrollmentData['is_enrolled'] && $enrollmentData['enrollment']) {
                        // Get detailed progress for enrolled user
                        $progressResponse = Http::withToken($this->apiToken)
                            ->get("{$this->apiUrl}/course-progress/{$courseId}/{$contactId}");

                        if ($progressResponse->successful()) {
                            $progress = $progressResponse->json()['data'];
                        }
                    }
                }
            }

            // Update lessons with progress data if available
            if ($progress && isset($progress['enrollment']['lesson_progress'])) {
                $lessonProgressMap = [];
                foreach ($progress['enrollment']['lesson_progress'] as $lp) {
                    $lessonProgressMap[$lp['lesson_id']] = $lp;
                }

                foreach ($lessons as &$lesson) {
                    if (isset($lessonProgressMap[$lesson['id']])) {
                        $lesson['is_completed'] = $lessonProgressMap[$lesson['id']]['status'] === 'completed';
                        $lesson['is_accessible'] = true; // If enrolled, all lessons are accessible
                        $lesson['progress'] = $lessonProgressMap[$lesson['id']];
                    } else {
                        $lesson['is_completed'] = false;
                        $lesson['is_accessible'] = $contactId ? true : false; // Accessible if viewing as contact
                        $lesson['progress'] = null;
                    }
                }
            } else {
                // No enrollment or progress data
                foreach ($lessons as &$lesson) {
                    $lesson['is_completed'] = false;
                    $lesson['is_accessible'] = false; // Not enrolled, lessons are locked
                    $lesson['progress'] = null;
                }
            }

            return Inertia::render('Public/Community/Course/Lessons/Index', [
                'member' => $member,
                'course' => $course,
                'lessons' => $lessons,
                'progress' => $progress,
                'viewingContact' => $contact,
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
                'appUrl' => config('app.url')
            ]);
        } catch (\Exception $e) {
            abort(404, 'Course not found');
        }
    }

    /**
     * Get course learning page for a community member (view only).
     */
    public function learnCourse(Request $request, $identifier, $courseId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            abort(404, 'Member not found');
        }

        try {
            // Get course details
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/courses/{$courseId}");

            if ($response->successful()) {
                $course = $response->json()['data'];
            } else {
                abort(404, 'Course not found');
            }

            // Get contact information if contact_id is provided
            $contact = null;
            $contactId = null;
            
            if ($request->has('contact_id')) {
                $contactId = $request->contact_id;
                $contactResponse = Http::withToken($this->apiToken)
                    ->get("{$this->apiUrl}/contacts/{$contactId}", [
                        'client_identifier' => $member->identifier
                    ]);
                
                if ($contactResponse->successful()) {
                    $contact = $contactResponse->json();
                }
            }

            // Check enrollment status and get progress if contact is provided
            $progress = null;
            if ($contactId) {
                // First check enrollment status
                $enrollmentCheckResponse = Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/course-enrollments/check-status", [
                        'course_id' => $courseId,
                        'contact_id' => $contactId,
                        'client_identifier' => $member->identifier,
                    ]);

                if ($enrollmentCheckResponse->successful()) {
                    $enrollmentData = $enrollmentCheckResponse->json()['data'];
                    
                    if ($enrollmentData['is_enrolled'] && $enrollmentData['enrollment']) {
                        // Get detailed progress for enrolled user
                        $progressResponse = Http::withToken($this->apiToken)
                            ->get("{$this->apiUrl}/course-progress/{$courseId}/{$contactId}");

                        if ($progressResponse->successful()) {
                            $progress = $progressResponse->json()['data'];
                        }
                    }
                }
            }

            // Get lessons for the course
            $lessonsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/courses/{$courseId}/lessons");

            $lessons = [];
            if ($lessonsResponse->successful()) {
                $lessons = $lessonsResponse->json()['data'] ?? [];
            }

            // Get specific lesson if lesson_id is provided
            $currentLesson = null;
            if ($request->has('lesson_id')) {
                $lessonId = $request->lesson_id;
                $currentLesson = collect($lessons)->firstWhere('id', $lessonId);
                
                if (!$currentLesson) {
                    abort(404, 'Lesson not found');
                }
            } else {
                // Default to first lesson if no lesson_id provided
                $currentLesson = $lessons[0] ?? null;
            }

            return Inertia::render('Public/Community/Course/Learn', [
                'member' => $member,
                'course' => $course,
                'lessons' => $lessons,
                'currentLesson' => $currentLesson,
                'progress' => $progress,
                'viewingContact' => $contact,
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
                'appUrl' => config('app.url')
            ]);
        } catch (\Exception $e) {
            abort(404, 'Course not found');
        }
    }

    /**
     * Get course progress for a community member (view only).
     */
    public function getCourseProgress(Request $request, $identifier, $courseId, $contactId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/course-progress/{$courseId}/{$contactId}");

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch course progress',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check enrollment status for a contact in a community member's course.
     */
    public function checkEnrollmentStatus(Request $request, $identifier, $courseId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $request->merge([
                'course_id' => $courseId,
                'client_identifier' => $member->identifier,
            ]);

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/course-enrollments/check-status', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check enrollment status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark a lesson as started for an enrollment in a community member's course.
     */
    public function markLessonAsStarted(Request $request, $identifier, $enrollmentId, $lessonId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/course-enrollments/{$enrollmentId}/progress/{$lessonId}/start");

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark lesson as started',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark a lesson as completed for an enrollment in a community member's course.
     */
    public function markLessonAsCompleted(Request $request, $identifier, $enrollmentId, $lessonId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('slug', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/course-enrollments/{$enrollmentId}/progress/{$lessonId}/complete");

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark lesson as completed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get billers for a community member.
     */
    public function getBillers(Request $request, $identifier)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            $params = [
                'client_identifier' => $member->identifier,
                'per_page' => $request->get('per_page', 50),
                'page' => $request->get('page', 1),
                'search' => $request->get('search', ''),
                'category' => $request->get('category', ''),
                'status' => 'active'
            ];

            // Add contact_id if provided for favorite status
            if ($request->filled('contact_id')) {
                $params['contact_id'] = $request->contact_id;
            }

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/billers", $params);

            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json([
                    'error' => 'Failed to fetch billers',
                    'data' => []
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Network error occurred while fetching billers',
                'data' => []
            ], 500);
        }
    }

    /**
     * Toggle favorite status for a biller.
     */
    public function toggleBillerFavorite(Request $request, $identifier, $billerId)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        // Validate contact_id is provided
        if (!$request->filled('contact_id')) {
            return response()->json(['error' => 'Contact ID is required'], 400);
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/billers/{$billerId}/toggle-favorite", [
                    'client_identifier' => $member->identifier,
                    'contact_id' => $request->contact_id
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json([
                    'error' => 'Failed to toggle favorite status',
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Network error occurred while toggling favorite status',
            ], 500);
        }
    }

    /**
     * Store a new bill payment for a community member.
     */
    public function storeBillPayment(Request $request, $identifier)
    {
        // Check if identifier is numeric (ID) or string (slug)
        $member = null;
        
        if (is_numeric($identifier)) {
            $member = User::where('project_identifier', 'community')
                ->where('id', $identifier)
                ->first();
        } else {
            $member = User::where('project_identifier', 'community')
                ->where('identifier', $identifier)
                ->first();
        }

        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }

        try {
            // Fetch contact details to get name information
            $contactName = '';
            if ($request->contact_id) {
                try {
                    $contactResponse = Http::withToken($this->apiToken)
                        ->get("{$this->apiUrl}/contacts/{$request->contact_id}");

                    if ($contactResponse->successful()) {
                        $contact = $contactResponse->json() ?? null;
                        if ($contact) {
                            $firstName = $contact['first_name'] ?? '';
                            $middleName = $contact['middle_name'] ?? '';
                            $lastName = $contact['last_name'] ?? '';
                            
                            // Build full name
                            $nameParts = array_filter([$firstName, $middleName, $lastName]);
                            $contactName = implode(' ', $nameParts);
                        }
                    }
                } catch (\Exception $e) {
                    // Log error but continue with empty contact name
                    \Log::error('Failed to fetch contact details: ' . $e->getMessage());
                }
            }

            // Prepare payment data
            $paymentData = [
                'bill_title' => $request->biller_name . ' Payment',
                'bill_description' => $request->description ?? 'Bill payment' . ($contactName ? ' for ' . $contactName : ''),
                'biller_id' => $request->biller_id,
                'amount' => $request->amount,
                'due_date' => now()->format('Y-m-d'), // Payment is due immediately
                'payment_date' => now()->format('Y-m-d'), // Payment is made immediately
                'status' => 'paid', // Payment is completed
                'payment_method' => 'wallet', // Payment method used
                'reference_number' => $request->account_number, // Use account number as reference
                'notes' => $request->description ?? null,
                'client_identifier' => $member->identifier,
                'category' => $request->category ?? 'Utilities',
                'priority' => 'medium',
                'is_recurring' => false,
            ];

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/bill-payments", $paymentData);

            if ($response->successful()) {
                // Calculate total amount including service fee
                $serviceFee = 10;
                $totalAmount = $request->amount + $serviceFee;
                
                // Deduct funds from the contact's wallet
                $deductResponse = Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/contact-wallets/{$request->contact_id}/deduct-funds", [
                        'amount' => $totalAmount,
                        'description' => "Bill payment to {$request->biller_name}",
                        'reference' => $request->account_number,
                    ]);

                if (!$deductResponse->successful()) {
                    // If wallet deduction fails, we should ideally rollback the payment
                    // For now, we'll return an error indicating the payment was created but wallet deduction failed
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment created but wallet deduction failed',
                        'error' => $deductResponse->json()['message'] ?? 'Unknown error',
                    ], 500);
                }

                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to create bill payment',
                'error' => $response->json()['message'] ?? 'Unknown error',
                'errors' => $response->json()['errors'] ?? null
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating bill payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 