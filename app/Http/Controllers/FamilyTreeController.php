<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class FamilyTreeController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the family tree viewer/maker page
     */
    public function index()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            Log::error('Failed to fetch family members', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return back()->withErrors(['error' => 'Failed to fetch family members']);
        }

        return Inertia::render('FamilyTree/Index', [
            'familyMembers' => $response->json('data', [])
        ]);
    }

    /**
     * Get all family members for the current user
     */
    public function getFamilyMembers()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            Log::error('Failed to fetch family members', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to fetch family members'], $response->status());
        }

        return response()->json($response->json('data', []));
    }

    /**
     * Store a new family member
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'death_date' => 'nullable|date|after:birth_date',
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'photo' => 'nullable|image|max:2048',
            'notes' => 'nullable|string',
        ]);

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('family-photos', 'public');
            $validated['photo'] = Storage::disk('public')->url($path);
        }

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/family-tree/members", $validated);

        if (!$response->successful()) {
            Log::error('Failed to create family member', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to create family member'], $response->status());
        }

        return response()->json($response->json('data'), $response->status());
    }

    /**
     * Update an existing family member
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'death_date' => 'nullable|date|after:birth_date',
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'photo' => 'nullable|image|max:2048',
            'notes' => 'nullable|string',
        ]);

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/family-tree/members/{$id}");
            
            if ($getResponse->successful()) {
                $member = $getResponse->json();
                if (!empty($member['photo'])) {
                    $path = str_replace(Storage::disk('public')->url(''), '', $member['photo']);
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            $path = $request->file('photo')->store('family-photos', 'public');
            $validated['photo'] = Storage::disk('public')->url($path);
        }

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        $response = Http::withToken($this->apiToken)
            ->put("{$this->apiUrl}/family-tree/members/{$id}", $validated);

        if (!$response->successful()) {
            Log::error('Failed to update family member', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to update family member'], $response->status());
        }

        return response()->json($response->json('data'), $response->status());
    }

    /**
     * Delete a family member
     */
    public function destroy($id)
    {
        $clientIdentifier = auth()->user()->identifier;

        // Get member data first to delete photo if exists
        $getResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members/{$id}", [
                'client_identifier' => $clientIdentifier
            ]);
        
        if ($getResponse->successful()) {
            $member = $getResponse->json();
            if (!empty($member['photo'])) {
                $path = str_replace(Storage::disk('public')->url(''), '', $member['photo']);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/family-tree/members/{$id}", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            Log::error('Failed to delete family member', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to delete family member'], $response->status());
        }

        return response()->json(null, $response->status());
    }

    /**
     * Add a relationship between two family members
     */
    public function addRelationship(Request $request)
    {
        $validated = $request->validate([
            'from_member_id' => 'required|integer',
            'to_member_id' => 'required|integer',
            'relationship_type' => ['required', Rule::in([
                'parent', 'child', 'spouse', 'sibling'
            ])],
        ]);

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/family-tree/relationships", $validated);

        if (!$response->successful()) {
            Log::error('Failed to add relationship', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to add relationship'], $response->status());
        }

        return response()->json($response->json('data'), $response->status());
    }

    /**
     * Remove a relationship between family members
     */
    public function removeRelationship(Request $request, $id)
    {
        $validated = $request->validate([
            'from_member_id' => 'required|integer',
            'to_member_id' => 'required|integer',
        ]);

        $clientIdentifier = auth()->user()->identifier;

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/family-tree/relationships/{$id}", [
                'client_identifier' => $clientIdentifier,
                'from_member_id' => $validated['from_member_id'],
                'to_member_id' => $validated['to_member_id'],
            ]);

        if (!$response->successful()) {
            Log::error('Failed to remove relationship', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to remove relationship'], $response->status());
        }

        return response()->json(null, $response->status());
    }

    /**
     * Export family tree data
     */
    public function export()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/export", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            Log::error('Failed to export family tree', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to export family tree'], $response->status());
        }

        return response()->json($response->json(), $response->status());
    }

    /**
     * Import family tree data
     */
    public function import(Request $request)
    {
        $validated = $request->validate([
            'family_members' => 'required|array',
            'family_members.*.first_name' => 'required|string|max:255',
            'family_members.*.last_name' => 'required|string|max:255',
            'family_members.*.birth_date' => 'nullable|date',
            'family_members.*.death_date' => 'nullable|date',
            'family_members.*.gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'family_members.*.relationships' => 'array',
        ]);

        $clientIdentifier = auth()->user()->identifier;
        $validated['client_identifier'] = $clientIdentifier;

        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/family-tree/import", $validated);

        if (!$response->successful()) {
            Log::error('Failed to import family tree', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to import family tree'], $response->status());
        }

        return response()->json($response->json(), $response->status());
    }

    /**
     * Get family tree visualization data
     */
    public function getVisualizationData()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/visualization", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            Log::error('Failed to get visualization data', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to get visualization data'], $response->status());
        }

        return response()->json($response->json('data', []), $response->status());
    }
}
