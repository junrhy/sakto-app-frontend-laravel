<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserCustomer;
use App\Models\CommunityJoinRequest;
use App\Mail\CommunityJoinRequestMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class CommunityController extends Controller
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
}

