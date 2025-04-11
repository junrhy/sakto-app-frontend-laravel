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

            $response = Http::withToken($this->apiToken)    
                ->get("{$this->apiUrl}/challenges", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                Log::error('API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => "{$this->apiUrl}/challenges"
                ]);
                
                return back()->withErrors(['error' => 'Failed to fetch challenges']);
            }

            $challenges = $response->json();

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
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/challenges", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                Log::error('Failed to fetch challenges list', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json(['error' => 'Failed to fetch challenges'], $response->status());
            }

            return response()->json([
                'challenges' => $response->json()
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
            'visibility' => 'required|in:public,private,friends,family,coworkers',
            'rewards' => 'nullable|array',
            'rewards.*.type' => 'required|in:badge,points,achievement',
            'rewards.*.value' => 'required|string'
        ]);

        $clientIdentifier = auth()->user()->identifier;
        $validated['status'] = 'active';
        $validated['client_identifier'] = $clientIdentifier;

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/challenges", $validated);

        if (!$response->successful()) {
            Log::error('Failed to create challenge', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return back()->withErrors(['error' => 'Failed to create challenge']);
        }

        return redirect()->route('challenges')->with('success', 'Challenge created successfully');
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
            return back()->withErrors(['error' => 'Failed to update challenge']);
        }

        return redirect()->route('challenges')->with('success', 'Challenge updated successfully');
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
            return back()->withErrors(['error' => 'Failed to delete challenge']);
        }

        return redirect()->route('challenges')->with('success', 'Challenge deleted successfully');
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
            ->delete("{$this->apiUrl}/challenges/bulk-delete", $validated);

        if (!$response->successful()) {
            Log::error('Failed to bulk delete challenges', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return back()->withErrors(['error' => 'Failed to delete challenges']);
        }

        return redirect()->route('challenges')->with('success', 'Challenges deleted successfully');
    }

    /**
     * Get challenge participants and their progress
     */
    public function getParticipants($id)
    {
        try {
            // Fetch challenge details
            $challengeResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/challenges/{$id}");
                
            if (!$challengeResponse->successful()) {
                Log::error('Failed to fetch challenge', [
                    'status' => $challengeResponse->status(),
                    'body' => $challengeResponse->body()
                ]);
                return back()->withErrors(['error' => 'Failed to fetch challenge']);
            }
            
            $challenge = $challengeResponse->json();
            
            // Fetch participants
            $participantsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/challenges/{$id}/participants");

            if (!$participantsResponse->successful()) {
                Log::error('Failed to fetch participants', [
                    'status' => $participantsResponse->status(),
                    'body' => $participantsResponse->body()
                ]);
                return back()->withErrors(['error' => 'Failed to fetch participants']);
            }
            
            $participants = $participantsResponse->json();
            
            // Filter out users who are already participants
            $participantIds = collect($participants)->pluck('id')->toArray();

            return Inertia::render('Challenges/Participants', [
                'challenge' => $challenge,
                'participants' => $participants
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in getParticipants', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching participants']);
        }
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
            return back()->withErrors(['error' => 'Failed to update progress']);
        }

        return back()->with('success', 'Progress updated successfully');
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
            return back()->withErrors(['error' => 'Failed to update participation status']);
        }

        return back()->with('success', 'Participation status updated successfully');
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
            return back()->withErrors(['error' => 'Failed to fetch leaderboard']);
        }

        return Inertia::render('Challenges/Leaderboard', [
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
            return back()->withErrors(['error' => 'Failed to fetch statistics']);
        }

        return Inertia::render('Challenges/Statistics', [
            'statistics' => $response->json()
        ]);
    }

    /**
     * Add a participant to a challenge
     */
    public function addParticipant(Request $request, $id)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
        ]);

        // Add client identifier
        $validated['client_identifier'] = auth()->user()->identifier;

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/challenges/{$id}/participants", $validated);

        if (!$response->successful()) {
            Log::error('Failed to add participant', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return back()->withErrors(['error' => 'Failed to add participant']);
        }

        return back()->with('success', 'Participant added successfully');
    }

    /**
     * Remove a participant from a challenge
     */
    public function removeParticipant($id, $participantId)
    {
        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/challenges/{$id}/participants/{$participantId}");

        if (!$response->successful()) {
            Log::error('Failed to remove participant', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return back()->withErrors(['error' => 'Failed to remove participant']);
        }

        return back()->with('success', 'Participant removed successfully');
    }
}
