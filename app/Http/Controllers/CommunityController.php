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

        return Inertia::render('Landing/Community/Index', [
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
        return Inertia::render('Landing/Community/AboutUs');
    }

    public function help()
    {
        return Inertia::render('Landing/Community/HelpCenter');
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

        return Inertia::render('Landing/Community/SearchMember', [
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

        return Inertia::render('Landing/Community/Member', [
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
} 