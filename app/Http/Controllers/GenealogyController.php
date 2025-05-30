<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use App\Mail\FamilyMemberEditRequest;

class GenealogyController extends Controller
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

        return Inertia::render('Genealogy/Index', [
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

        $exportData = $response->json('data');
        $fileName = 'family-tree-export-' . now()->format('Y-m-d') . '.json';

        return response()->json($exportData)
            ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"')
            ->header('Content-Type', 'application/json');
    }

    /**
     * Import family tree data
     */
    public function import(Request $request)
    {
        $validated = $request->validate([
            'family_members' => 'required|array',
            'family_members.*.import_id' => 'required',
            'family_members.*.first_name' => 'required|string|max:255',
            'family_members.*.last_name' => 'required|string|max:255',
            'family_members.*.birth_date' => 'nullable|date',
            'family_members.*.death_date' => 'nullable|date',
            'family_members.*.gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'family_members.*.relationships' => 'array',
            'family_members.*.relationships.*.import_id' => 'nullable',
            'family_members.*.relationships.*.to_member_import_id' => 'nullable',
            'family_members.*.relationships.*.relationship_type' => ['nullable', Rule::in(['parent', 'child', 'spouse', 'sibling'])],
            'import_mode' => ['required', Rule::in(['skip', 'update', 'duplicate'])],
        ]);

        $clientIdentifier = auth()->user()->identifier;

        Log::info('Starting import request to API', [
            'client_identifier' => $clientIdentifier,
            'mode' => $validated['import_mode'],
            'members_count' => count($validated['family_members'])
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/family-tree/import", array_merge($validated, [
                    'client_identifier' => $clientIdentifier
                ]));

            if (!$response->successful()) {
                Log::error('Failed to import family tree', [
                    'response' => $response->json(),
                    'status' => $response->status()
                ]);
                return response()->json([
                    'error' => 'Failed to import family tree: ' . ($response->json('error') ?? 'Unknown error')
                ], $response->status());
            }

            Log::info('Import successful', [
                'response' => $response->json()
            ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Exception during import', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to import family tree: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get family tree visualization data
     */
    public function getVisualizationData()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/family-tree/visualization", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                Log::error('Failed to fetch visualization data', [
                    'response' => $response->json(),
                    'status' => $response->status()
                ]);
                return response()->json(['error' => 'Failed to fetch visualization data'], $response->status());
            }

            return response()->json($response->json('data', []));
        } catch (\Exception $e) {
            Log::error('Error fetching visualization data: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch visualization data'], 500);
        }
    }

    /**
     * Get family tree statistics for the widget
     */
    public function getWidgetStats()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            Log::error('Failed to fetch family members for widget', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to fetch family members'], $response->status());
        }

        $familyMembers = $response->json('data', []);

        return response()->json($familyMembers);
    }

    /**
     * Handle edit request for a family member
     */
    public function requestEdit(Request $request, $clientIdentifier)
    {
        $validated = $request->validate([
            'member_id' => 'required|integer',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'death_date' => 'nullable|date|after:birth_date',
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'photo' => 'nullable|image|max:2048',
            'notes' => 'nullable|string',
        ]);

        // Get the current member data
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members/{$validated['member_id']}", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            Log::error('Failed to fetch member data for edit request', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to process edit request'], $response->status());
        }

        $currentMember = $response->json('data');

        // Store photo if provided
        $photoUrl = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('family-photos-pending', 'public');
            $photoUrl = Storage::disk('public')->url($path);
        }

        // Get the account owner's email
        $userEmail = auth()->user()->email;

        // Prepare data for email
        $editData = [
            'member_id' => $validated['member_id'],
            'current' => $currentMember,
            'proposed' => array_merge($validated, ['photo' => $photoUrl]),
            'client_identifier' => $clientIdentifier
        ];

        try {
            // Send email to account owner
            Mail::to($userEmail)->send(new FamilyMemberEditRequest($editData));

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/family-tree/edit-requests", [
                    'member_id' => $validated['member_id'],
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'birth_date' => $validated['birth_date'],
                    'death_date' => $validated['death_date'],
                    'gender' => $validated['gender'],
                    'photo' => $photoUrl,
                    'notes' => $validated['notes'],
                    'client_identifier' => $clientIdentifier
                ]);

            return response()->json([
                'message' => 'Edit request has been sent to the account owner for approval.'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send edit request email', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Clean up stored photo if there was an error
            if ($photoUrl) {
                $path = str_replace(Storage::disk('public')->url(''), '', $photoUrl);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            return response()->json([
                'error' => 'Failed to send edit request. Please try again.'
            ], 500);
        }
    }

    /**
     * Get family tree settings from API
     */
    private function getSettingsFromApi($clientIdentifier)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/family-tree/settings", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                Log::error('Failed to fetch family tree settings', [
                    'response' => $response->json(),
                    'status' => $response->status()
                ]);
                throw new \Exception('Failed to fetch family tree settings');
            }

            return $response->json('data', []);
        } catch (\Exception $e) {
            Log::error('Error fetching family tree settings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Display the family tree settings page
     */
    public function settings()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $settings = $this->getSettingsFromApi($clientIdentifier);

            return Inertia::render('Genealogy/Settings', [
                'settings' => $settings
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load settings');
        }
    }

    /**
     * Save family tree settings
     */
    public function saveSettings(Request $request)
    {
        try {
            $validated = $request->validate([
                'organization_info.family_name' => 'required|string|max:255',
                'organization_info.email' => 'nullable|email|max:255',
                'organization_info.contact_number' => 'nullable|string|max:50',
                'organization_info.website' => 'nullable|url|max:255',
                'organization_info.address' => 'nullable|string|max:500',
                'organization_info.banner' => 'nullable|string|max:1000',
                'organization_info.logo' => 'nullable|string|max:1000',
                'auth.username' => 'nullable|string|max:255',
                'auth.password' => 'nullable|string|min:6',
                'elected_officials' => 'nullable|array',
                'elected_officials.*.name' => 'required_with:elected_officials|string|max:255',
                'elected_officials.*.officials' => 'required_with:elected_officials|array',
                'elected_officials.*.officials.*.name' => 'required_with:elected_officials.*.officials|string|max:255',
                'elected_officials.*.officials.*.position' => 'required_with:elected_officials.*.officials|string|max:255',
                'elected_officials.*.officials.*.profile_url' => 'nullable|string'
            ]);

            $clientIdentifier = auth()->user()->identifier;

            // Make API request to save settings
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/family-tree/settings", array_merge($validated, [
                    'client_identifier' => $clientIdentifier
                ]));

            if (!$response->successful()) {
                Log::error('Failed to save family tree settings', [
                    'response' => $response->json(),
                    'status' => $response->status()
                ]);
                return response()->json([
                    'error' => 'Failed to save settings: ' . ($response->json('error') ?? 'Unknown error')
                ], $response->status());
            }

            return response()->json([
                'message' => 'Settings saved successfully',
                'data' => $response->json('data')
            ]);

        } catch (\Exception $e) {
            Log::error('Error saving family tree settings', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to save settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all pending edit requests for the current user
     */
    public function getEditRequests()
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/edit-requests", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            Log::error('Failed to fetch edit requests', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to fetch edit requests'], $response->status());
        }

        return response()->json($response->json('data', []));
    }

    /**
     * Accept an edit request
     */
    public function acceptEditRequest(Request $request, $id)
    {
        $clientIdentifier = auth()->user()->identifier;

        // First get the edit request data to check for pending photo
        $getResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/edit-requests/{$id}", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$getResponse->successful()) {
            Log::error('Failed to fetch edit request data', [
                'response' => $getResponse->json(),
                'status' => $getResponse->status()
            ]);
            return response()->json(['error' => 'Failed to fetch edit request data'], $getResponse->status());
        }

        $editRequest = $getResponse->json('data');
        $photoUrl = $editRequest['photo'] ?? null;

        // If there's a pending photo, move it to the main photos folder
        if ($photoUrl) {
            try {
                // Extract the path from the URL
                $pendingPath = str_replace(Storage::disk('public')->url(''), '', $photoUrl);
                
                // Check if the file exists in pending folder
                if (Storage::disk('public')->exists($pendingPath)) {
                    // Create new path in main photos folder
                    $newPath = str_replace('family-photos-pending', 'family-photos', $pendingPath);
                    
                    // Move the file to the new location
                    Storage::disk('public')->move($pendingPath, $newPath);
                    
                    // Update the photo URL to point to the new location
                    $photoUrl = Storage::disk('public')->url($newPath);
                }
            } catch (\Exception $e) {
                Log::error('Failed to move pending photo', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json(['error' => 'Failed to process photo'], 500);
            }
        }

        // Accept the edit request with the updated photo URL
        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/family-tree/edit-requests/{$id}/accept", [
                'client_identifier' => $clientIdentifier,
                'photo' => $photoUrl
            ]);

        if (!$response->successful()) {
            Log::error('Failed to accept edit request', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to accept edit request'], $response->status());
        }

        return response()->json([
            'message' => 'Edit request accepted successfully',
            'data' => $response->json('data')
        ]);
    }

    /**
     * Reject an edit request
     */
    public function rejectEditRequest(Request $request, $id)
    {
        $clientIdentifier = auth()->user()->identifier;
        $response = Http::withToken($this->apiToken)
            ->post("{$this->apiUrl}/family-tree/edit-requests/{$id}/reject", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            Log::error('Failed to reject edit request', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);
            return response()->json(['error' => 'Failed to reject edit request'], $response->status());
        }

        return response()->json(null, $response->status());
    }

    /**
     * Display the edit requests management page
     */
    public function editRequests()
    {
        return Inertia::render('Genealogy/EditRequests');
    }

    /**
     * Display the full view of the family tree
     */
    public function fullView($clientIdentifier)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to fetch family members']);
        }

        return Inertia::render('Genealogy/FullView', [
            'familyMembers' => $response->json('data', []),
            'clientIdentifier' => $clientIdentifier
        ]);
    }

    /**
     * Get all family members for public view
     */
    public function getAllMembers($clientIdentifier)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Failed to fetch family members'], $response->status());
        }

        return response()->json($response->json('data', []));
    }

    /**
     * Display a specific family member's profile
     */
    public function memberProfile($clientIdentifier, $memberId)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members/{$memberId}", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to fetch family members']);
        }

        $member = $response->json('data', []);

        if (!$member) {
            return back()->withErrors(['error' => 'Member not found']);
        }

        return Inertia::render('Genealogy/MemberProfile', [
            'member' => $member,
            'clientIdentifier' => $clientIdentifier
        ]);
    }

    /**
     * Display the circular view of the family tree
     */
    public function circularView($clientIdentifier)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to fetch family members']);
        }

        return Inertia::render('Genealogy/CircularView', [
            'familyMembers' => $response->json('data', []),
            'clientIdentifier' => $clientIdentifier
        ]);
    }

    /**
     * Display the printable view of the family tree
     */
    public function printableView($clientIdentifier)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to fetch family members']);
        }

        return Inertia::render('Genealogy/PrintableView', [
            'familyMembers' => $response->json('data', []),
            'clientIdentifier' => $clientIdentifier
        ]);
    }

    /**
     * Display the full view of all family members
     */
    public function familyMemberFullView($clientIdentifier)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/family-tree/members", [
                'client_identifier' => $clientIdentifier
            ]);

        if (!$response->successful()) {
            return back()->withErrors(['error' => 'Failed to fetch family members']);
        }

        return Inertia::render('Genealogy/FamilyMemberFullView', [
            'familyMembers' => $response->json('data', []),
            'clientIdentifier' => $clientIdentifier
        ]);
    }

    /**
     * Get public family tree settings
     */
    public function getPublicSettings($clientIdentifier)
    {
        try {
            $settings = $this->getSettingsFromApi($clientIdentifier);
            return response()->json($settings);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch settings'], 500);
        }
    }
}
