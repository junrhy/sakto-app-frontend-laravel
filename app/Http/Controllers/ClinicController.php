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

    /**
     * Get the performed_by value with team member fallback
     */
    private function getPerformedBy(Request $request)
    {
        $selectedTeamMemberId = $request->session()->get('selected_team_member_id');
        $performedBy = auth()->user()->name; // fallback
        
        if ($selectedTeamMemberId && auth()->user()->team_members_data) {
            $teamMember = collect(auth()->user()->team_members_data)->firstWhere('identifier', $selectedTeamMemberId);
            if ($teamMember && isset($teamMember['full_name'])) {
                $performedBy = $teamMember['full_name'];
            }
        }
        
        return $performedBy;
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

            return Inertia::render('Clinic/Index', [
                'initialPatients' => $patients,
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            // Handle error gracefully
            return Inertia::render('Clinic/Index', [
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

    public function addBill(Request $request, $patientId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-bills/{$patientId}", $request->all());
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

    public function updateDentalChart(Request $request, $patientId)
    {
        try {
            $request->merge(['patient_id' => $patientId]);
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

    public function getAppointments(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/appointments", [
                    'client_identifier' => $clientIdentifier,
                    'status' => $request->status,
                    'date' => $request->date,
                    'patient_id' => $request->patient_id
                ]);
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch appointments'], 500);
        }
    }

    public function storeAppointment(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge(['client_identifier' => $clientIdentifier]);
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/appointments", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create appointment'], 500);
        }
    }

    public function updateAppointment(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/appointments/{$id}", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update appointment'], 500);
        }
    }

    public function deleteAppointment($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/appointments/{$id}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete appointment'], 500);
        }
    }

    public function getTodayAppointments()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/appointments/today", [
                    'client_identifier' => $clientIdentifier
                ]);
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch today\'s appointments'], 500);
        }
    }

    public function getUpcomingAppointments(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/appointments/upcoming", [
                    'client_identifier' => $clientIdentifier,
                    'limit' => $request->limit ?? 10
                ]);
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch upcoming appointments'], 500);
        }
    }

    public function updateAppointmentStatus(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->patch("{$this->apiUrl}/appointments/{$id}/status", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update appointment status'], 500);
        }
    }

    public function updateAppointmentPaymentStatus(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->patch("{$this->apiUrl}/appointments/{$id}/payment-status", $request->all());
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update appointment payment status'], 500);
        }
    }

    public function settings()
    {
        try {
            // $clientIdentifier = auth()->user()->identifier;
            // $response = Http::withToken($this->apiToken)
            //     ->get("{$this->apiUrl}/clinic/settings", [
            //         'client_identifier' => $clientIdentifier
            //     ]);

            // if (!$response->successful()) {
            //     throw new \Exception('Failed to fetch clinic settings');
            // }

            // Dummy data
            $dummySettings = [
                'data' => [
                    'general' => [
                        'clinic_name' => 'Sample Clinic',
                        'description' => 'A modern healthcare facility',
                        'address' => '123 Medical Street',
                        'phone' => '+1234567890',
                        'email' => 'clinic@example.com',
                        'operating_hours' => [
                            'monday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
                            'tuesday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
                            'wednesday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
                            'thursday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
                            'friday' => ['open' => '09:00', 'close' => '17:00', 'closed' => false],
                            'saturday' => ['open' => '09:00', 'close' => '13:00', 'closed' => false],
                            'sunday' => ['open' => '00:00', 'close' => '00:00', 'closed' => true]
                        ]
                    ],
                    'appointments' => [
                        'enable_appointments' => true,
                        'appointment_duration' => 30,
                        'appointment_buffer' => 15,
                        'enable_reminders' => true,
                        'reminder_hours' => 24,
                        'enable_online_booking' => true
                    ],
                    'features' => [
                        'enable_insurance' => true,
                        'insurance_providers' => ['Blue Cross', 'Aetna', 'Cigna'],
                        'enable_prescriptions' => true,
                        'enable_lab_results' => true,
                        'enable_dental_charts' => true,
                        'enable_medical_history' => true,
                        'enable_patient_portal' => true
                    ],
                    'billing' => [
                        'enable_billing' => true,
                        'tax_rate' => 10,
                        'currency' => 'USD',
                        'payment_methods' => ['Cash', 'Credit Card', 'Insurance'],
                        'invoice_prefix' => 'INV-',
                        'invoice_footer' => 'Thank you for choosing our clinic!'
                    ]
                ]
            ];

            return Inertia::render('Clinic/Settings', [
                'settings' => $dummySettings['data'],
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load settings');
        }
    }

    public function inventory()
    {
        try {
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            return Inertia::render('Clinic/Inventory', [
                'appCurrency' => $jsonAppCurrency
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load inventory');
        }
    }

    public function getInventory(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $params = $request->all();
            $params['client_identifier'] = $clientIdentifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/clinic-inventory", $params);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch inventory items'], 500);
        }
    }

    public function storeInventoryItem(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge([
                'client_identifier' => $clientIdentifier,
                'performed_by' => $this->getPerformedBy($request)
            ]);

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/clinic-inventory", $request->all());

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create inventory item: ' . $e->getMessage()], 500);
        }
    }

    public function updateInventoryItem(Request $request, $id)
    {
        try {
            $request->merge([
                'performed_by' => $this->getPerformedBy($request),
                'client_identifier' => auth()->user()->identifier
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/clinic-inventory/{$id}", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update inventory item: ' . $e->getMessage()], 500);
        }
    }

    public function deleteInventoryItem($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/clinic-inventory/{$id}", ['client_identifier' => auth()->user()->identifier]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete inventory item: ' . $e->getMessage()], 500);
        }
    }

    public function addInventoryStock(Request $request, $id)
    {
        try {
            $request->merge([
                'performed_by' => $this->getPerformedBy($request),
                'client_identifier' => auth()->user()->identifier
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/clinic-inventory/{$id}/add-stock", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add stock: ' . $e->getMessage()], 500);
        }
    }

    public function removeInventoryStock(Request $request, $id)
    {
        try {
            $request->merge([
                'performed_by' => $this->getPerformedBy($request),
                'client_identifier' => auth()->user()->identifier
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/clinic-inventory/{$id}/remove-stock", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to remove stock: ' . $e->getMessage()], 500);
        }
    }

    public function adjustInventoryStock(Request $request, $id)
    {
        try {
            $request->merge([
                'performed_by' => $this->getPerformedBy($request),
                'client_identifier' => auth()->user()->identifier
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/clinic-inventory/{$id}/adjust-stock", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to adjust stock: ' . $e->getMessage()], 500);
        }
    }

    public function getInventoryCategories()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/clinic-inventory/categories", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch categories'], 500);
        }
    }

    public function getInventoryAlerts(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $type = $request->get('type', 'low-stock');
            
            $endpoint = match($type) {
                'low-stock' => 'low-stock-alerts',
                'expiring' => 'expiring-alerts',
                'expired' => 'expired-items',
                default => 'low-stock-alerts'
            };
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/clinic-inventory/{$endpoint}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch alerts'], 500);
        }
    }
}