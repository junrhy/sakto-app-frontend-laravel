<?php

namespace App\Http\Controllers\Customer;

use App\Models\User;
use App\Models\UserCustomer;
use App\Models\CommunityJoinRequest;
use App\Mail\CommunityJoinRequestMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CommunityController extends CustomerProjectController
{
    /**
     * Display a listing of all community members
     */
    public function index(Request $request): Response
    {
        // Check if user has community project_identifier
        if ($request->user()->project_identifier !== 'community') {
            abort(403, 'Unauthorized access');
        }

        // Get all community users with user_type = 'user'
        $communities = User::where('project_identifier', 'community')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        // Get joined community IDs for the current customer
        $joinedCommunityIds = UserCustomer::where('customer_id', $request->user()->id)
            ->where('relationship_type', 'member')
            ->pluck('user_id')
            ->toArray();

        // Get pending join request community IDs for the current customer
        $pendingRequestIds = CommunityJoinRequest::where('customer_id', $request->user()->id)
            ->where('status', 'pending')
            ->pluck('community_id')
            ->toArray();

        return Inertia::render('Customer/Communities/Index', [
            'communities' => $communities,
            'joinedCommunityIds' => $joinedCommunityIds,
            'pendingRequestIds' => $pendingRequestIds,
        ]);
    }

    /**
     * Display the specified community details
     */
    public function show(Request $request, $communityIdentifier): Response
    {
        if ($request->user()->project_identifier !== 'community') {
            abort(403, 'Unauthorized access');
        }

        $communityQuery = User::where('project_identifier', 'community')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier', 'app_currency', 'project_identifier');

        if (is_numeric($communityIdentifier)) {
            $communityQuery->where('id', $communityIdentifier);
        } else {
            $communityQuery->where('slug', $communityIdentifier);
        }

        /** @var \App\Models\User $community */
        $community = $communityQuery->firstOrFail();

        $community->app_currency = $this->decodeCurrency($community->app_currency);

        $isJoined = UserCustomer::where('user_id', $community->id)
            ->where('customer_id', $request->user()->id)
            ->exists();

        $isPending = CommunityJoinRequest::where('community_id', $community->id)
            ->where('customer_id', $request->user()->id)
            ->where('status', 'pending')
            ->exists();

        $membership = UserCustomer::where('user_id', $community->id)
            ->where('customer_id', $request->user()->id)
            ->where('relationship_type', 'member')
            ->first();

        $apiPayload = ['client_identifier' => $community->identifier];
        $customer = $request->user();
        $customerName = $customer->name ? trim($customer->name) : null;
        $customerContact = $customer->contact_number ? trim($customer->contact_number) : null;

        // Fetch data using the existing methods that were working before
        // This ensures data is properly extracted
        $challenges = $this->fetchApiCollection('challenges', array_merge($apiPayload, [
            'status' => 'published',
            'limit' => 24,
        ]));

        $events = $this->fetchApiCollection('events', array_merge($apiPayload, [
            'is_public' => true,
            'limit' => 24,
        ]));

        $pages = $this->fetchApiCollection('pages', array_merge($apiPayload, [
            'is_published' => true,
        ]));

        $updates = $this->fetchApiCollection('content-creator', array_merge($apiPayload, [
            'status' => 'published',
            'limit' => 24,
        ]));

        $productsResponse = $this->fetchApiRaw('products', array_merge($apiPayload, [
            'status' => 'published',
            'limit' => 6,
        ]));
        $products = $productsResponse['data'] ?? $productsResponse;

        $courses = $this->fetchApiCollection('courses', array_merge($apiPayload, [
            'status' => 'published',
            'limit' => 6,
        ]));

        $orderHistory = $this->fetchApiCollection('product-orders', array_merge($apiPayload, [
            'per_page' => 50,
        ]));

        // Lazy load records - these will be fetched when user navigates to respective sections
        // This improves initial page load performance significantly
        $lendingRecords = [];
        $healthcareRecords = [];
        $mortuaryRecords = [];

        // Get total number of user_customers (members) for this community
        $totalCustomers = UserCustomer::where('user_id', $community->id)
            ->where('is_active', true)
            ->count();

        return Inertia::render('Customer/Communities/Show', [
            'community' => $community,
            'isJoined' => $isJoined,
            'isPending' => $isPending,
            'joinedAt' => optional($membership?->created_at)?->toIso8601String(),
            'totalCustomers' => $totalCustomers,
            'challenges' => $challenges,
            'events' => $events,
            'pages' => $pages,
            'updates' => $updates,
            'products' => $products,
            'courses' => $courses,
            'orderHistory' => $orderHistory,
            'lendingRecords' => $lendingRecords,
            'healthcareRecords' => $healthcareRecords,
            'mortuaryRecords' => $mortuaryRecords,
            'appUrl' => config('app.url'),
        ]);
    }


    /**
     * Request to join a community
     */
    public function join(Request $request, $communityId): JsonResponse
    {
        try {
            // Check if user has community project_identifier
            if ($request->user()->project_identifier !== 'community') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Verify the community exists and is a user type
            $community = User::where('id', $communityId)
                ->where('project_identifier', 'community')
                ->where('user_type', 'user')
                ->first();

            if (!$community) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Community not found'
                ], 404);
            }

            // Check if already joined
            $existing = UserCustomer::where('user_id', $communityId)
                ->where('customer_id', $request->user()->id)
                ->first();

            if ($existing) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Already joined this community'
                ], 400);
            }

            // Check if there's already a pending request
            $pendingRequest = CommunityJoinRequest::where('community_id', $communityId)
                ->where('customer_id', $request->user()->id)
                ->where('status', 'pending')
                ->first();

            if ($pendingRequest) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You already have a pending request for this community'
                ], 400);
            }

            // Create the join request
            $joinRequest = CommunityJoinRequest::create([
                'community_id' => $communityId,
                'customer_id' => $request->user()->id,
                'message' => $request->input('message'),
                'status' => 'pending',
            ]);

            // Send email to community owner for approval
            Mail::to($community->email)->send(new CommunityJoinRequestMail($joinRequest));

            return response()->json([
                'status' => 'success',
                'message' => 'Join request sent! Waiting for community approval.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send join request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unjoin (leave) a community
     */
    public function unjoin(Request $request, $communityId): JsonResponse
    {
        try {
            // Check if user has community project_identifier
            if ($request->user()->project_identifier !== 'community') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Find and delete the relationship
            $deleted = UserCustomer::where('user_id', $communityId)
                ->where('customer_id', $request->user()->id)
                ->delete();

            if (!$deleted) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You are not a member of this community'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Successfully left community'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to leave community: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a join request
     */
    public function approve(Request $request, string $token): RedirectResponse
    {
        try {
            // Find the join request by token
            $joinRequest = CommunityJoinRequest::where('approval_token', $token)
                ->where('status', 'pending')
                ->first();

            if (!$joinRequest) {
                return redirect()->route('customer.dashboard')
                    ->with('error', 'Invalid or expired join request');
            }

            // Approve the request
            $joinRequest->approve();

            // Create the actual membership
            UserCustomer::create([
                'user_id' => $joinRequest->community_id,
                'customer_id' => $joinRequest->customer_id,
                'relationship_type' => 'member',
                'is_active' => true,
            ]);

            return redirect()->route('customer.dashboard')
                ->with('message', 'Join request approved successfully! ' . $joinRequest->customer->name . ' has been added to your community.');

        } catch (\Exception $e) {
            return redirect()->route('customer.dashboard')
                ->with('error', 'Failed to approve request: ' . $e->getMessage());
        }
    }

    /**
     * Deny a join request
     */
    public function deny(Request $request, string $token): RedirectResponse
    {
        try {
            // Find the join request by token
            $joinRequest = CommunityJoinRequest::where('approval_token', $token)
                ->where('status', 'pending')
                ->first();

            if (!$joinRequest) {
                return redirect()->route('customer.dashboard')
                    ->with('error', 'Invalid or expired join request');
            }

            // Deny the request
            $joinRequest->deny();

            return redirect()->route('customer.dashboard')
                ->with('message', 'Join request denied successfully.');

        } catch (\Exception $e) {
            return redirect()->route('customer.dashboard')
                ->with('error', 'Failed to deny request: ' . $e->getMessage());
        }
    }

    private function fetchApiCollection(string $endpoint, array $params): array
    {
        $response = $this->fetchApiRaw($endpoint, $params);

        return $response['data'] ?? [];
    }

    private function fetchApiRaw(string $endpoint, array $params): array
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/{$endpoint}", $params);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $th) {
            // Optional: add logging here in the future
        }

        return [];
    }

    /**
     * Extract data from HTTP response, handling different response structures
     * Matches the behavior of fetchApiCollection method
     */
    private function extractResponseData($response): array
    {
        if (!$response) {
            return [];
        }

        // Check if response has successful method (Http response object)
        if (method_exists($response, 'successful')) {
            if (!$response->successful()) {
                return [];
            }
        }

        try {
            $data = $response->json();
            
            if (!is_array($data)) {
                return [];
            }
            
            // Use same logic as fetchApiCollection: return $response['data'] ?? []
            if (isset($data['data'])) {
                return is_array($data['data']) ? $data['data'] : [];
            }
            
            return [];
        } catch (\Exception $e) {
            Log::error('Error extracting response data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    /**
     * NOTE: Lending, Healthcare, and Mortuary records are now lazy-loaded
     * to improve initial page load performance. These records are fetched
     * when users navigate to their respective sections or via their
     * dedicated controllers:
     * - LendingController::index()
     * - HealthcareController::index()
     * - MortuaryController::index()
     * 
     * If you need to fetch these records synchronously in the future,
     * consider using Http::pool() to make concurrent requests.
     */

    private function normalizePhoneNumber(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        $digitsOnly = preg_replace('/\D+/', '', $value);

        return $digitsOnly ?: null;
    }

    private function resolveCommunity(string $identifier): User
    {
        $query = User::where('project_identifier', 'community')
            ->where('user_type', 'user');

        if (is_numeric($identifier)) {
            $query->where('id', $identifier);
        } else {
            $query->where(function ($builder) use ($identifier) {
                $builder->where('slug', $identifier)
                    ->orWhere('identifier', $identifier);
            });
        }

        return $query->firstOrFail();
    }
}

