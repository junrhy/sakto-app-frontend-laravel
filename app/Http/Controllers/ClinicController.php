<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ClinicController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = env('API_URL');
        $this->apiToken = env('API_TOKEN');
    }

    public function index()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            // Fetch patients from the external API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/patients", [
                    'client_identifier' => $clientIdentifier
                ]);

            if(!$response->json()) {
                return response()->json(['error' => 'Failed to connect to Clinic API.'], 500);
            }
    
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $patients = $response->json()['patients'] ?? [];
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);

            return Inertia::render('Clinic', [
                'initialPatients' => $patients,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            // Handle error gracefully
            return Inertia::render('Clinic', [
                'initialPatients' => [],
                'error' => 'Failed to fetch patients data'
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge(['client_identifier' => $clientIdentifier]);
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patients", [
                    'name' => $request->name,
                    'birthdate' => $request->dateOfBirth,
                    'phone' => $request->contactNumber,
                    'email' => $request->email,
                    'client_identifier' => $clientIdentifier
                ]);
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create patient'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/patients/{$id}", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update patient'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/patients/{$id}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete patient'], 500);
        }
    }

    public function addBill(Request $request, $patientId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patients/{$patientId}/bills", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add bill'], 500);
        }
    }

    public function deleteBill($patientId, $billId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/patients/{$patientId}/bills/{$billId}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete bill'], 500);
        }
    }

    public function addPayment(Request $request, $patientId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patients/{$patientId}/payments", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add payment'], 500);
        }
    }

    public function deletePayment($patientId, $paymentId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/patients/{$patientId}/payments/{$paymentId}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete payment'], 500);
        }
    }

    public function addCheckup(Request $request, $patientId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patients/{$patientId}/checkups", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add checkup'], 500);
        }
    }

    public function deleteCheckup($patientId, $checkupId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/patients/{$patientId}/checkups/{$checkupId}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete checkup'], 500);
        }
    }

    public function updateDentalChart(Request $request, $patientId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/patients/{$patientId}/dental-chart", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update dental chart'], 500);
        }
    }

    public function updateNextVisit(Request $request, $patientId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/patients/{$patientId}/next-visit", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update next visit'], 500);
        }
    }
}