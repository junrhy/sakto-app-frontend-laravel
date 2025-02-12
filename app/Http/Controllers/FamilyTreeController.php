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
        $this->apiUrl = env('API_URL');
        $this->apiToken = env('API_TOKEN');
    }

    /**
     * Display the family tree viewer/maker page
     */
    public function index()
    {
        // $clientIdentifier = auth()->user()->identifier;
        // $response = Http::withToken($this->apiToken)
        //     ->get("{$this->apiUrl}/family-tree/members", [
        //         'client_identifier' => $clientIdentifier
        //     ]);

        // if (!$response->successful()) {
        //     Log::error('Failed to fetch family members', [
        //         'response' => $response->json(),
        //         'status' => $response->status()
        //     ]);
        //     return back()->withErrors(['error' => 'Failed to fetch family members']);
        // }

        // Sample family tree data with 200 members across 4 generations
        $sampleData = [];
        
        // First Generation (20 people - 10 couples)
        for ($i = 1; $i <= 20; $i++) {
            $isEven = $i % 2 === 0;
            $spouseId = $isEven ? $i - 1 : $i + 1;
            $birthYear = rand(1940, 1950);
            
            $relationships = [
                [
                    'id' => $i * 100,
                    'to_member_id' => $spouseId,
                    'relationship_type' => 'spouse'
                ]
            ];
            
            // Add parent relationships to second generation
            for ($child = 21; $child <= 70; $child++) {
                if ($child % 5 === ($i % 5)) {
                    $relationships[] = [
                        'id' => $i * 1000 + $child,
                        'to_member_id' => $child,
                        'relationship_type' => 'parent'
                    ];
                }
            }
            
            $sampleData[] = [
                'id' => $i,
                'first_name' => $isEven ? "Mary" : "John" . ($i > 2 ? " " . chr(64 + ceil($i/2)) : ""),
                'last_name' => "Generation1_" . ceil($i/2),
                'birth_date' => $birthYear . "-" . str_pad(rand(1, 12), 2, "0", STR_PAD_LEFT) . "-" . str_pad(rand(1, 28), 2, "0", STR_PAD_LEFT),
                'gender' => $isEven ? 'female' : 'male',
                'photo' => null,
                'notes' => "First generation - " . ($isEven ? "matriarch" : "patriarch") . " of family " . ceil($i/2),
                'relationships' => $relationships
            ];
        }
        
        // Second Generation (50 people - includes spouses)
        for ($i = 21; $i <= 70; $i++) {
            $isSpouse = $i > 45; // Last 25 are spouses
            $parentFamilyId = ($i % 5) + 1;
            $spouseId = $isSpouse ? null : $i + 25;
            $birthYear = rand(1965, 1975);
            
            $relationships = [];
            
            // Add spouse relationship
            if (!$isSpouse) {
                $relationships[] = [
                    'id' => $i * 100,
                    'to_member_id' => $spouseId,
                    'relationship_type' => 'spouse'
                ];
            }
            
            // Add parent relationships
            if (!$isSpouse) {
                $parentId1 = ($parentFamilyId * 2) - 1;
                $parentId2 = $parentFamilyId * 2;
                $relationships[] = [
                    'id' => $i * 100 + 1,
                    'to_member_id' => $parentId1,
                    'relationship_type' => 'child'
                ];
                $relationships[] = [
                    'id' => $i * 100 + 2,
                    'to_member_id' => $parentId2,
                    'relationship_type' => 'child'
                ];
            }
            
            // Add parent relationships to third generation
            if (!$isSpouse) {
                for ($child = 71; $child <= 150; $child++) {
                    if ($child % 25 === ($i % 25)) {
                        $relationships[] = [
                            'id' => $i * 1000 + $child,
                            'to_member_id' => $child,
                            'relationship_type' => 'parent'
                        ];
                    }
                }
            }
            
            $sampleData[] = [
                'id' => $i,
                'first_name' => $isSpouse ? 
                    ($i % 2 === 0 ? "James" : "Sarah") . " " . chr(65 + ($i % 26)) :
                    ($i % 2 === 0 ? "William" : "Elizabeth") . " " . chr(65 + ($i % 26)),
                'last_name' => $isSpouse ? "Spouse_Gen2_" . ($i - 45) : "Generation2_" . $parentFamilyId,
                'birth_date' => $birthYear . "-" . str_pad(rand(1, 12), 2, "0", STR_PAD_LEFT) . "-" . str_pad(rand(1, 28), 2, "0", STR_PAD_LEFT),
                'gender' => $i % 2 === 0 ? 'male' : 'female',
                'photo' => null,
                'notes' => "Second generation - " . ($isSpouse ? "spouse" : "child") . " of family " . $parentFamilyId,
                'relationships' => $relationships
            ];
        }
        
        // Third Generation (80 people - includes spouses)
        for ($i = 71; $i <= 150; $i++) {
            $isSpouse = $i > 110; // Last 40 are spouses
            $parentFamilyId = ($i % 25) + 1;
            $spouseId = $isSpouse ? null : $i + 40;
            $birthYear = rand(1990, 2000);
            
            $relationships = [];
            
            // Add spouse relationship
            if (!$isSpouse) {
                $relationships[] = [
                    'id' => $i * 100,
                    'to_member_id' => $spouseId,
                    'relationship_type' => 'spouse'
                ];
            }
            
            // Add parent relationships
            if (!$isSpouse) {
                $parentId1 = 21 + ($parentFamilyId - 1);
                $parentId2 = 46 + ($parentFamilyId - 1);
                $relationships[] = [
                    'id' => $i * 100 + 1,
                    'to_member_id' => $parentId1,
                    'relationship_type' => 'child'
                ];
                $relationships[] = [
                    'id' => $i * 100 + 2,
                    'to_member_id' => $parentId2,
                    'relationship_type' => 'child'
                ];
            }
            
            // Add parent relationships to fourth generation
            if (!$isSpouse) {
                for ($child = 151; $child <= 200; $child++) {
                    if ($child % 40 === ($i % 40)) {
                        $relationships[] = [
                            'id' => $i * 1000 + $child,
                            'to_member_id' => $child,
                            'relationship_type' => 'parent'
                        ];
                    }
                }
            }
            
            $sampleData[] = [
                'id' => $i,
                'first_name' => $isSpouse ? 
                    ($i % 2 === 0 ? "Michael" : "Emma") . " " . chr(65 + ($i % 26)) :
                    ($i % 2 === 0 ? "Daniel" : "Sophia") . " " . chr(65 + ($i % 26)),
                'last_name' => $isSpouse ? "Spouse_Gen3_" . ($i - 110) : "Generation3_" . $parentFamilyId,
                'birth_date' => $birthYear . "-" . str_pad(rand(1, 12), 2, "0", STR_PAD_LEFT) . "-" . str_pad(rand(1, 28), 2, "0", STR_PAD_LEFT),
                'gender' => $i % 2 === 0 ? 'male' : 'female',
                'photo' => null,
                'notes' => "Third generation - " . ($isSpouse ? "spouse" : "child") . " of family " . $parentFamilyId,
                'relationships' => $relationships
            ];
        }
        
        // Fourth Generation (50 people - youngest generation)
        for ($i = 151; $i <= 200; $i++) {
            $parentFamilyId = ($i % 40) + 1;
            $birthYear = rand(2010, 2020);
            
            $relationships = [];
            
            // Add parent relationships
            $parentId1 = 71 + ($parentFamilyId - 1);
            $parentId2 = 111 + ($parentFamilyId - 1);
            $relationships[] = [
                'id' => $i * 100 + 1,
                'to_member_id' => $parentId1,
                'relationship_type' => 'child'
            ];
            $relationships[] = [
                'id' => $i * 100 + 2,
                'to_member_id' => $parentId2,
                'relationship_type' => 'child'
            ];
            
            $sampleData[] = [
                'id' => $i,
                'first_name' => ($i % 2 === 0 ? "Lucas" : "Olivia") . " " . chr(65 + ($i % 26)),
                'last_name' => "Generation4_" . $parentFamilyId,
                'birth_date' => $birthYear . "-" . str_pad(rand(1, 12), 2, "0", STR_PAD_LEFT) . "-" . str_pad(rand(1, 28), 2, "0", STR_PAD_LEFT),
                'gender' => $i % 2 === 0 ? 'male' : 'female',
                'photo' => null,
                'notes' => "Fourth generation - child of family " . $parentFamilyId,
                'relationships' => $relationships
            ];
        }

        return Inertia::render('FamilyTree/Index', [
            'familyMembers' => $sampleData
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
        // Get member data first to delete photo if exists
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

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/family-tree/members/{$id}");

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
    public function removeRelationship(Request $request)
    {
        $validated = $request->validate([
            'from_member_id' => 'required|integer',
            'to_member_id' => 'required|integer',
        ]);

        $response = Http::withToken($this->apiToken)
            ->delete("{$this->apiUrl}/family-tree/relationships", [
                'json' => $validated
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
