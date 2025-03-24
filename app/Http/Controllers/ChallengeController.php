<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChallengeController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the challenges index page
     */
    public function index()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            Log::info('Making API request', [
                'url' => "{$this->apiUrl}/challenges",
                'client_identifier' => $clientIdentifier
            ]);

            // $response = Http::withToken($this->apiToken)    
            //     ->get("{$this->apiUrl}/challenges", [
            //         'client_identifier' => $clientIdentifier
            //     ]);
            
            // if (!$response->successful()) {
            //     Log::error('API request failed', [
            //         'status' => $response->status(),
            //         'body' => $response->body(),
            //         'url' => "{$this->apiUrl}/challenges"
            //     ]);
                
            //     return back()->withErrors(['error' => 'Failed to fetch challenges']);
            // }

            // $challenges = $response->json();
            $challenges = [];

            return Inertia::render('Challenges/Index', [
                'auth' => [
                    'user' => Auth::user()
                ],
                'challenges' => $challenges
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in challenges index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching challenges']);
        }
    }

    /**
     * Display the challenges settings page
     */
    public function settings()
    {
        return Inertia::render('Challenges/Settings');
    }

    /**
     * Get list of challenges
     */
    public function getList()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // $response = Http::withToken($this->apiToken)
            //     ->get("{$this->apiUrl}/challenges", [
            //         'client_identifier' => $clientIdentifier
            //     ]);

            // if (!$response->successful()) {
            //     Log::error('Failed to fetch challenges list', [
            //         'status' => $response->status(),
            //         'body' => $response->body()
            //     ]);
            //     return response()->json(['error' => 'Failed to fetch challenges'], $response->status());
            // }

            // return response()->json([
            //     'challenges' => $response->json()
            // ]);
            $challenges = [];
            return response()->json([
                'challenges' => $challenges
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in getList', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'An error occurred'], 500);
        }
    }

    /**
     * Store a new challenge
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'goal_type' => 'required|in:steps,calories,distance,time,weight,other',
            'goal_value' => 'required|numeric',
            'goal_unit' => 'required|string',
            'participants' => 'required|array',
            'participants.*' => 'exists:users,id',
            'visibility' => 'required|in:public,private,friends,family,coworkers',
            'rewards' => 'nullable|array',
            'rewards.*.type' => 'required|in:badge,points,achievement',
            'rewards.*.value' => 'required|string'
        ]);

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/challenges", $validated);

        if (!$response->successful()) {
            Log::error('Failed to create challenge', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to create challenge'], $response->status());
        }

        return response()->json([
            'message' => 'Challenge created successfully',
            'challenge' => $response->json()
        ]);
    }

    /**
     * Update an existing challenge
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'goal_type' => 'sometimes|required|in:steps,calories,distance,time,weight,other',
            'goal_value' => 'sometimes|required|numeric',
            'goal_unit' => 'sometimes|required|string',
            'participants' => 'sometimes|required|array',
            'participants.*' => 'exists:users,id',
            'visibility' => 'sometimes|required|in:public,private,friends,family,coworkers',
            'rewards' => 'nullable|array',
            'rewards.*.type' => 'required|in:badge,points,achievement',
            'rewards.*.value' => 'required|string'
        ]);

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/challenges/{$id}", $validated);

        if (!$response->successful()) {
            Log::error('Failed to update challenge', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to update challenge'], $response->status());
        }

        return response()->json([
            'message' => 'Challenge updated successfully',
            'challenge' => $response->json()
        ]);
    }

    /**
     * Delete a challenge
     */
    public function destroy($id)
    {
        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/challenges/{$id}");

        if (!$response->successful()) {
            Log::error('Failed to delete challenge', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to delete challenge'], $response->status());
        }

        return response()->json([
            'message' => 'Challenge deleted successfully'
        ]);
    }

    /**
     * Bulk delete challenges
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:challenges,id'
        ]);

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/challenges/bulk", $validated);

        if (!$response->successful()) {
            Log::error('Failed to bulk delete challenges', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to delete challenges'], $response->status());
        }

        return response()->json([
            'message' => 'Challenges deleted successfully'
        ]);
    }

    /**
     * Get challenge participants and their progress
     */
    public function getParticipants($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/challenges/{$id}/participants");

        if (!$response->successful()) {
            Log::error('Failed to fetch participants', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to fetch participants'], $response->status());
        }

        return response()->json($response->json());
    }

    /**
     * Update participant progress
     */
    public function updateProgress(Request $request, $id)
    {
        $validated = $request->validate([
            'progress_value' => 'required|numeric',
            'date' => 'required|date'
        ]);

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/challenges/{$id}/progress", $validated);

        if (!$response->successful()) {
            Log::error('Failed to update progress', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to update progress'], $response->status());
        }

        return response()->json([
            'message' => 'Progress updated successfully',
            'progress' => $response->json()
        ]);
    }

    /**
     * Accept or reject challenge invitation
     */
    public function updateParticipationStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:accepted,rejected'
        ]);

        $response = Http::withToken($this->apiToken)
            ->patch("{$this->apiUrl}/challenges/{$id}/participation", $validated);

        if (!$response->successful()) {
            Log::error('Failed to update participation status', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to update participation status'], $response->status());
        }

        return response()->json([
            'message' => 'Participation status updated successfully',
            'participant' => $response->json()
        ]);
    }

    /**
     * Get leaderboard for a challenge
     */
    public function getLeaderboard($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/challenges/{$id}/leaderboard");

        if (!$response->successful()) {
            Log::error('Failed to fetch leaderboard', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to fetch leaderboard'], $response->status());
        }

        return response()->json([
            'leaderboard' => $response->json()
        ]);
    }

    /**
     * Get challenge statistics
     */
    public function getStatistics($id)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/challenges/{$id}/statistics");

        if (!$response->successful()) {
            Log::error('Failed to fetch statistics', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to fetch statistics'], $response->status());
        }

        return response()->json([
            'statistics' => $response->json()
        ]);
    }
}
