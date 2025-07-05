<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HealthInsuranceController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Fetch health insurance data
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/health-insurance?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $data = $response->json()['data'];
            $members = $data['members'] ?? [];
            $contributions = $data['contributions'] ?? [];
            $claims = $data['claims'] ?? [];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('HealthInsurance/Index', [
                'initialMembers' => $members,
                'initialContributions' => $contributions,
                'initialClaims' => $claims,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching health insurance data: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch health insurance data.'], 500);
        }
    }

    public function storeMember(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'contact_number' => 'required|string',
            'address' => 'required|string',
            'membership_start_date' => 'required|date',
            'contribution_amount' => 'required|numeric|min:0',
            'contribution_frequency' => 'required|in:monthly,quarterly,annually',
            'status' => 'required|in:active,inactive',
            'group' => 'nullable|string'
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/health-insurance/members", [
                    ...$validated,
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                // Return JSON error response for AJAX requests
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'error' => 'Failed to store member',
                        'details' => $response->body()
                    ], $response->status());
                }
                throw new \Exception('API request failed: ' . $response->body());
            }

            // Return JSON success response for AJAX requests
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Member added successfully',
                    'data' => $response->json()['data'] ?? null
                ]);
            }

            return back()->with('success', 'Member added successfully');
        } catch (\Exception $e) {
            Log::error('Error storing member: ' . $e->getMessage());
            
            // Return JSON error response for AJAX requests
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'error' => 'Failed to store member',
                    'details' => $e->getMessage()
                ], 500);
            }
            
            return back()->with('error', 'Failed to store member.');
        }
    }

    public function updateMember(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'contact_number' => 'required|string',
            'address' => 'required|string',
            'membership_start_date' => 'required|date',
            'contribution_amount' => 'required|numeric|min:0',
            'contribution_frequency' => 'required|in:monthly,quarterly,annually',
            'status' => 'required|in:active,inactive',
            'group' => 'nullable|string'
        ]);

        try {
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/health-insurance/members/{$id}", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Member updated successfully');
        } catch (\Exception $e) {
            Log::error('Error updating member: ' . $e->getMessage());
            return back()->with('error', 'Failed to update member.');
        }
    }

    public function recordContribution(Request $request, string $memberId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string'
        ]);

        try {
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/health-insurance/contributions/{$memberId}", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Contribution recorded successfully');
        } catch (\Exception $e) {
            Log::error('Error recording contribution: ' . $e->getMessage());
            return back()->with('error', 'Failed to record contribution.');
        }
    }

    public function recordBulkContributions(Request $request)
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
                    'message' => "Successfully recorded {$successCount} contributions",
                    'data' => [
                        'total' => $totalCount,
                        'successful' => $successCount,
                        'failed' => $failedCount
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => "Recorded {$successCount} contributions, {$failedCount} failed",
                    'data' => [
                        'total' => $totalCount,
                        'successful' => $successCount,
                        'failed' => $failedCount,
                        'failed_contributions' => $failedContributions
                    ]
                ], 207); // 207 Multi-Status
            }
        } catch (\Exception $e) {
            Log::error('Error recording bulk contributions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record bulk contributions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateContribution(Request $request, string $memberId, string $contributionId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string'
        ]);

        try {
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/health-insurance/contributions/{$memberId}/{$contributionId}", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Contribution updated successfully');
        } catch (\Exception $e) {
            Log::error('Error updating contribution: ' . $e->getMessage());
            return back()->with('error', 'Failed to update contribution.');
        }
    }

    public function submitClaim(Request $request, string $memberId)
    {
        $validated = $request->validate([
            'claim_type' => 'required|in:hospitalization,outpatient,dental,optical,prescription',
            'amount' => 'required|numeric|min:0',
            'date_of_service' => 'required|date',
            'hospital_name' => 'required|string',
            'diagnosis' => 'required|string'
        ]);

        try {
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/health-insurance/claims/{$memberId}", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Claim submitted successfully');
        } catch (\Exception $e) {
            Log::error('Error submitting claim: ' . $e->getMessage());
            return back()->with('error', 'Failed to submit claim.');
        }
    }

    public function updateClaimStatus(Request $request, string $claimId)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'remarks' => 'nullable|string'
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->patch("{$this->apiUrl}/health-insurance/claims/{$claimId}/status", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error updating claim status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update claim status.'], 500);
        }
    }

    public function getMemberClaims(string $memberId)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/health-insurance/claims/{$memberId}?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error fetching member claims: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch member claims.'], 500);
        }
    }

    public function getMemberContributions(string $memberId)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/health-insurance/contributions/{$memberId}?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error fetching member contributions: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch member contributions.'], 500);
        }
    }

    public function generateReport(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'report_type' => 'required|in:contributions,claims,members'
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/health-insurance/reports", [
                    ...$validated,
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error generating report: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate report.'], 500);
        }
    }

    public function deleteMember(string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/health-insurance/members/{$id}");

            if ($response->successful()) {
                return redirect()->back()->with('success', 'Member deleted successfully');
            }

            throw new \Exception($response->json()['message'] ?? 'Failed to delete member');
        } catch (\Exception $e) {
            Log::error('Error deleting member: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete member: ' . $e->getMessage());
        }
    }

    public function deleteContribution(string $memberId, string $contributionId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/health-insurance/contributions/{$memberId}/{$contributionId}");

            if ($response->successful()) {
                return redirect()->back()->with('success', 'Contribution deleted successfully');
            }

            throw new \Exception($response->json()['message'] ?? 'Failed to delete contribution');
        } catch (\Exception $e) {
            Log::error('Error deleting contribution: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete contribution: ' . $e->getMessage());
        }
    }

    public function deleteClaim(string $memberId, string $claimId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/health-insurance/claims/{$memberId}/{$claimId}");

            if ($response->successful()) {
                return redirect()->back()->with('success', 'Claim deleted successfully');
            }

            throw new \Exception($response->json()['message'] ?? 'Failed to delete claim');
        } catch (\Exception $e) {
            Log::error('Error deleting claim: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete claim: ' . $e->getMessage());
        }
    }

    public function updateClaim(Request $request, string $memberId, string $claimId)
    {
        try {
            $validated = $request->validate([
                'claim_type' => 'required|in:hospitalization,outpatient,dental,optical',
                'amount' => 'required|numeric|min:0',
                'date_of_service' => 'required|date',
                'hospital_name' => 'required|string',
                'diagnosis' => 'required|string',
                'status' => 'required|in:pending,approved,rejected'
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/health-insurance/claims/{$memberId}/{$claimId}", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Claim updated successfully');
        } catch (\Exception $e) {
            Log::error('Error updating claim: ' . $e->getMessage());
            return back()->with('error', 'Failed to update claim.');
        }
    }

    public function showMember($id)
    {
        $clientIdentifier = auth()->user()->identifier;
        
        // Get member details
        $memberResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/health-insurance/members/{$id}?client_identifier={$clientIdentifier}");

        if (!$memberResponse->successful()) {
            return redirect()->route('health-insurance')->with('error', 'Failed to fetch member details');
        }
        
        $responseData = $memberResponse->json()['data'];
        $member = $responseData['member'];

        // Convert contribution_amount to float
        $member['contribution_amount'] = (float) $member['contribution_amount'];
        
        // Get member's contributions
        $contributionsResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/health-insurance/contributions/{$id}?client_identifier={$clientIdentifier}");
        
        $contributions = $contributionsResponse->successful() ? $contributionsResponse->json()['data'] ?? [] : [];
        
        // Convert contribution amounts to float
        $contributions = array_map(function($contribution) {
            $contribution['amount'] = (float) $contribution['amount'];
            return $contribution;
        }, $contributions);
        
        // Get member's claims
        $claimsResponse = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/health-insurance/claims/{$id}?client_identifier={$clientIdentifier}");
        
        $claims = $claimsResponse->successful() ? $claimsResponse->json()['data'] ?? [] : [];
        
        // Convert claim amounts to float
        $claims = array_map(function($claim) {
            $claim['amount'] = (float) $claim['amount'];
            return $claim;
        }, $claims);

        // Calculate upcoming and past due contributions
        $upcomingContributions = $responseData['upcoming_contributions'];
        $pastDueContributions = $responseData['past_due_contributions'];

        $jsonAppCurrency = json_decode(auth()->user()->app_currency);

        return Inertia::render('HealthInsurance/MemberDetails', [
            'member' => $member,
            'contributions' => $contributions,
            'claims' => $claims,
            'upcomingContributions' => $upcomingContributions,
            'pastDueContributions' => $pastDueContributions,
            'appCurrency' => $jsonAppCurrency
        ]);
    }
}
