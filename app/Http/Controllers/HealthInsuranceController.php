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

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error storing member: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to store member.'], 500);
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
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/health-insurance/members/{$id}", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error updating member: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update member.'], 500);
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

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error recording contribution: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to record contribution.'], 500);
        }
    }

    public function submitClaim(Request $request, string $memberId)
    {
        $validated = $request->validate([
            'claim_type' => 'required|in:hospitalization,outpatient,medication',
            'amount' => 'required|numeric|min:0',
            'date_of_service' => 'required|date',
            'hospital_name' => 'required|string',
            'diagnosis' => 'required|string',
            'documentation' => 'required|array',
            'documentation.*' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120'
        ]);

        try {
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/health-insurance/claims/{$memberId}", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Error submitting claim: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to submit claim.'], 500);
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
}
