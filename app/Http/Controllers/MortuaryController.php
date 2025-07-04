<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MortuaryController extends Controller
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
            
            // Fetch mortuary data
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/mortuary?client_identifier={$clientIdentifier}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $data = $response->json()['data'];
            $members = $data['members'] ?? [];
            $contributions = $data['contributions'] ?? [];
            $claims = $data['claims'] ?? [];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('Mortuary/Index', [
                'initialMembers' => $members,
                'initialContributions' => $contributions,
                'initialClaims' => $claims,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching mortuary data: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch mortuary data.'], 500);
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
                ->post("{$this->apiUrl}/mortuary/members", [
                    ...$validated,
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Member added successfully');
        } catch (\Exception $e) {
            Log::error('Error storing member: ' . $e->getMessage());
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
                ->put("{$this->apiUrl}/mortuary/members/{$id}", $validated);

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
                ->post("{$this->apiUrl}/mortuary/contributions/{$memberId}", $validated);

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
            $errors = [];

            foreach ($validated['contributions'] as $index => $contribution) {
                try {
                    $memberId = $contribution['member_id'];
                    $url = $this->apiUrl . '/mortuary/contributions/' . $memberId;
                    $data = $contribution;
                    $data['client_identifier'] = $clientIdentifier;
                    $response = Http::withToken($this->apiToken)->post($url, $data);

                    if ($response->successful()) {
                        $successCount++;
                    } else {
                        $errors[] = "Contribution " . ($index + 1) . ": " . $response->body();
                    }
                } catch (\Exception $e) {
                        $errors[] = "Contribution " . ($index + 1) . ": " . $e->getMessage();
                }
            }

            if ($successCount > 0) {
                $message = "Successfully recorded {$successCount} contributions.";
                if (count($errors) > 0) {
                    $message .= " Some contributions failed to record.";
                }
                return back()->with('success', $message);
            } else {
                return back()->with('error', 'Failed to record any contributions. ' . implode('; ', $errors));
            }
        } catch (\Exception $e) {
            Log::error('Error recording bulk contributions: ' . $e->getMessage());
            return back()->with('error', 'Failed to record bulk contributions.');
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
                ->put("{$this->apiUrl}/mortuary/contributions/{$memberId}/{$contributionId}", $validated);

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
            'claim_type' => 'required|in:funeral_service,burial_plot,transportation,memorial_service,other',
            'amount' => 'required|numeric|min:0',
            'date_of_death' => 'required|date',
            'deceased_name' => 'required|string',
            'relationship_to_member' => 'required|string',
            'cause_of_death' => 'nullable|string'
        ]);

        try {
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/mortuary/claims/{$memberId}", $validated);

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
                ->patch("{$this->apiUrl}/mortuary/claims/{$claimId}/status", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Claim status updated successfully');
        } catch (\Exception $e) {
            Log::error('Error updating claim status: ' . $e->getMessage());
            return back()->with('error', 'Failed to update claim status.');
        }
    }

    public function toggleActiveStatus(Request $request, string $claimId)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean'
        ]);

        try {
            $response = Http::withToken($this->apiToken)
                ->patch("{$this->apiUrl}/mortuary/claims/{$claimId}/active-status", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Claim active status updated successfully');
        } catch (\Exception $e) {
            Log::error('Error updating claim active status: ' . $e->getMessage());
            return back()->with('error', 'Failed to update claim active status.');
        }
    }

    public function getMemberClaims(string $memberId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/mortuary/claims/{$memberId}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json()['data']);
        } catch (\Exception $e) {
            Log::error('Error fetching member claims: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch member claims.'], 500);
        }
    }

    public function getMemberContributions(string $memberId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/mortuary/contributions/{$memberId}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json()['data']);
        } catch (\Exception $e) {
            Log::error('Error fetching member contributions: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch member contributions.'], 500);
        }
    }

    public function generateReport(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        try {
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/mortuary/reports", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json()['data']);
        } catch (\Exception $e) {
            Log::error('Error generating report: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate report.'], 500);
        }
    }

    public function deleteMember(string $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/mortuary/members/{$id}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Member deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting member: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete member.');
        }
    }

    public function deleteContribution(string $memberId, string $contributionId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/mortuary/contributions/{$memberId}/{$contributionId}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Contribution deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting contribution: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete contribution.');
        }
    }

    public function deleteClaim(string $memberId, string $claimId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/mortuary/claims/{$memberId}/{$claimId}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return back()->with('success', 'Claim deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting claim: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete claim.');
        }
    }

    public function updateClaim(Request $request, string $memberId, string $claimId)
    {
        $validated = $request->validate([
            'claim_type' => 'required|in:funeral_service,burial_plot,transportation,memorial_service,other',
            'amount' => 'required|numeric|min:0',
            'date_of_death' => 'required|date',
            'deceased_name' => 'required|string',
            'relationship_to_member' => 'required|string',
            'cause_of_death' => 'nullable|string'
        ]);

        try {
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/mortuary/claims/{$memberId}/{$claimId}", $validated);

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
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/mortuary/members/{$id}");

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $member = $response->json()['data'];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('Mortuary/MemberDetails', [
                'member' => $member,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching member details: ' . $e->getMessage());
            return back()->with('error', 'Failed to fetch member details.');
        }
    }
}
