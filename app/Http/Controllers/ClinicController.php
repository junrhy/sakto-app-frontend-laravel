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
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
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
               
            $responseData = $response->json();
            
            if(!$responseData) {
                return response()->json(['error' => 'Failed to connect to Clinic API.'], 500);
            }

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $patients = $responseData['patients'] ?? [];
            
            // Calculate totals for each patient
            $patients = collect($patients)->map(function ($patient) {
                $patient['total_bills'] = collect($patient['bills'] ?? [])->sum('bill_amount');
                $patient['total_payments'] = collect($patient['payments'] ?? [])->sum('payment_amount');
                $patient['balance'] = $patient['total_bills'] - $patient['total_payments'];
                return $patient;
            })->all();

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

    public function getBills($patientId)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/patient-bills/{$patientId}");
        return response()->json($response->json());
    }

    public function addBill(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-bills/{$request->patient_id}", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add bill'], 500);
        }
    }

    public function deleteBill($patientId, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/patient-bills/{$patientId}/{$id}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete bill'], 500);
        }
    }

    public function getPayments($patientId)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/patient-payments/{$patientId}");
        return response()->json($response->json());
    }

    public function addPayment(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-payments/{$request->patient_id}", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add payment'], 500);
        }
    }

    public function deletePayment($patientId, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/patient-payments/{$patientId}/{$id}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete payment'], 500);
        }
    }

    public function getCheckups($patientId)
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/patient-checkups/{$patientId}");
        return response()->json($response->json());
    }

    public function addCheckup(Request $request, $patientId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-checkups/{$patientId}", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add checkup'], 500);
        }
    }

    public function deleteCheckup($patientId, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/patient-checkups/{$patientId}/{$id}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete checkup'], 500);
        }
    }

    public function updateDentalChart(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/patient-dental-charts", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update dental chart'], 500);
        }
    }

    public function updateNextVisit(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/patients/{$id}/next-visit", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update next visit'], 500);
        }
    }
}