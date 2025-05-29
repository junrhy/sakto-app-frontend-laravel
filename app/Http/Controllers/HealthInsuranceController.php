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
            'status' => 'required|in:active,inactive'
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/health-insurance/members", [
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
            'status' => 'required|in:active,inactive'
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
}
