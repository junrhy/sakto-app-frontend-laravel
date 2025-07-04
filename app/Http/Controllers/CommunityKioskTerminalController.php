<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CommunityKioskTerminalController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the main kiosk terminal interface
     */
    public function index()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Fetch all data needed for the kiosk terminal
            $data = $this->fetchKioskData($clientIdentifier);
            
            return Inertia::render('KioskTerminal/Community/Index', $data);
        } catch (\Exception $e) {
            Log::error('Error in kiosk terminal index: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to load kiosk terminal data']);
        }
    }

    /**
     * Fetch all data needed for the kiosk terminal
     */
    private function fetchKioskData($clientIdentifier)
    {
        $data = [
            'events' => [],
            'healthInsuranceMembers' => [],
            'mortuaryMembers' => [],
            'appCurrency' => json_decode(auth()->user()->app_currency)
        ];

        // Fetch events
        try {
            $eventsResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if ($eventsResponse->successful()) {
                $data['events'] = $eventsResponse->json()['data'] ?? $eventsResponse->json();
            }
        } catch (\Exception $e) {
            Log::error('Error fetching events for kiosk: ' . $e->getMessage());
        }

        // Fetch health insurance members
        try {
            $healthResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/health-insurance?client_identifier={$clientIdentifier}");
            
            if ($healthResponse->successful()) {
                $healthData = $healthResponse->json()['data'];
                $data['healthInsuranceMembers'] = $healthData['members'] ?? [];
            }
        } catch (\Exception $e) {
            Log::error('Error fetching health insurance members for kiosk: ' . $e->getMessage());
        }

        // Fetch mortuary members
        try {
            $mortuaryResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/mortuary?client_identifier={$clientIdentifier}");
            
            if ($mortuaryResponse->successful()) {
                $mortuaryData = $mortuaryResponse->json()['data'];
                $data['mortuaryMembers'] = $mortuaryData['members'] ?? [];
            }
        } catch (\Exception $e) {
            Log::error('Error fetching mortuary members for kiosk: ' . $e->getMessage());
        }

        return $data;
    }

    /**
     * Get event participants for check-in
     */
    public function getEventParticipants($eventId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/events/{$eventId}/participants");

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch participants'], $response->status());
            }

            $participants = $response->json();
            if (isset($participants['data'])) {
                $participants = $participants['data'];
            }

            return response()->json($participants);
        } catch (\Exception $e) {
            Log::error('Error fetching event participants: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch participants'], 500);
        }
    }

    /**
     * Check-in an event participant
     */
    public function checkInParticipant(Request $request, $eventId, $participantId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/events/{$eventId}/participants/{$participantId}/check-in");

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to check in participant'], $response->status());
            }

            return response()->json(['message' => 'Participant checked in successfully']);
        } catch (\Exception $e) {
            Log::error('Error checking in participant: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to check in participant'], 500);
        }
    }

    /**
     * Submit health insurance contributions for multiple members
     */
    public function submitHealthInsuranceContributions(Request $request)
    {
        $validated = $request->validate([
            'contributions' => 'required|array|min:1',
            'contributions.*.member_id' => 'required|string',
            'contributions.*.amount' => 'required|numeric|min:0',
            'contributions.*.payment_date' => 'required|date',
            'contributions.*.payment_method' => 'required|string',
            'contributions.*.reference_number' => 'nullable|string'
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $successCount = 0;
            $failedContributions = [];

            foreach ($validated['contributions'] as $contribution) {
                try {
                    $contribution['client_identifier'] = $clientIdentifier;
                    $response = Http::withToken($this->apiToken)
                        ->post("{$this->apiUrl}/health-insurance/contributions/{$contribution['member_id']}", $contribution);

                    if ($response->successful()) {
                        $successCount++;
                    } else {
                        $failedContributions[] = [
                            'member_id' => $contribution['member_id'],
                            'error' => $response->body()
                        ];
                    }
                } catch (\Exception $e) {
                    $failedContributions[] = [
                        'member_id' => $contribution['member_id'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            $totalCount = count($validated['contributions']);
            $failedCount = count($failedContributions);

            if ($failedCount === 0) {
                return response()->json([
                    'success' => true,
                    'message' => "Successfully recorded {$successCount} health insurance contributions",
                    'data' => [
                        'total' => $totalCount,
                        'successful' => $successCount,
                        'failed' => $failedCount
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => "Recorded {$successCount} health insurance contributions, {$failedCount} failed",
                    'data' => [
                        'total' => $totalCount,
                        'successful' => $successCount,
                        'failed' => $failedCount,
                        'failed_contributions' => $failedContributions
                    ]
                ], 207); // 207 Multi-Status
            }
        } catch (\Exception $e) {
            Log::error('Error recording health insurance contributions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record health insurance contributions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit mortuary contributions for multiple members
     */
    public function submitMortuaryContributions(Request $request)
    {
        $validated = $request->validate([
            'contributions' => 'required|array|min:1',
            'contributions.*.member_id' => 'required|string',
            'contributions.*.amount' => 'required|numeric|min:0',
            'contributions.*.payment_date' => 'required|date',
            'contributions.*.payment_method' => 'required|string',
            'contributions.*.reference_number' => 'nullable|string'
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $successCount = 0;
            $failedContributions = [];

            foreach ($validated['contributions'] as $contribution) {
                try {
                    $contribution['client_identifier'] = $clientIdentifier;
                    $response = Http::withToken($this->apiToken)
                        ->post("{$this->apiUrl}/mortuary/contributions/{$contribution['member_id']}", $contribution);

                    if ($response->successful()) {
                        $successCount++;
                    } else {
                        $failedContributions[] = [
                            'member_id' => $contribution['member_id'],
                            'error' => $response->body()
                        ];
                    }
                } catch (\Exception $e) {
                    $failedContributions[] = [
                        'member_id' => $contribution['member_id'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            $totalCount = count($validated['contributions']);
            $failedCount = count($failedContributions);

            if ($failedCount === 0) {
                return response()->json([
                    'success' => true,
                    'message' => "Successfully recorded {$successCount} mortuary contributions",
                    'data' => [
                        'total' => $totalCount,
                        'successful' => $successCount,
                        'failed' => $failedCount
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => "Recorded {$successCount} mortuary contributions, {$failedCount} failed",
                    'data' => [
                        'total' => $totalCount,
                        'successful' => $successCount,
                        'failed' => $failedCount,
                        'failed_contributions' => $failedContributions
                    ]
                ], 207); // 207 Multi-Status
            }
        } catch (\Exception $e) {
            Log::error('Error recording mortuary contributions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record mortuary contributions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get updated data for the kiosk terminal (for real-time updates)
     */
    public function getUpdatedData()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $data = $this->fetchKioskData($clientIdentifier);
            
            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Error fetching updated kiosk data: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch updated data'], 500);
        }
    }

    /**
     * Search members by name or contact number
     */
    public function searchMembers(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:1',
            'type' => 'required|in:health_insurance,mortuary'
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $query = $validated['query'];
            $type = $validated['type'];

            $endpoint = $type === 'health_insurance' ? 'health-insurance' : 'mortuary';
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/{$endpoint}?client_identifier={$clientIdentifier}&search={$query}");

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to search members'], $response->status());
            }

            $data = $response->json()['data'];
            $members = $data['members'] ?? [];

            return response()->json($members);
        } catch (\Exception $e) {
            Log::error('Error searching members: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to search members'], 500);
        }
    }
}
