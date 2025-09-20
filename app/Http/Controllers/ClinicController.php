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
                    'arn' => $request->arn,
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
            // Ensure patient_id is set correctly
            $billData = array_merge($request->all(), [
                'patient_id' => $patientId
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-bills", $billData);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add bill: ' . $e->getMessage()], 500);
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

    public function addPayment(Request $request, $patientId)
    {
        try {
            // Ensure patient_id is set correctly
            $paymentData = array_merge($request->all(), [
                'patient_id' => $patientId
            ]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-payments", $paymentData);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add payment: ' . $e->getMessage()], 500);
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
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add checkup: ' . $e->getMessage()], 500);
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

    // Clinic Payment Account Management Routes

    public function getPaymentAccounts(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $queryParams = array_merge(['client_identifier' => $clientIdentifier], $request->query());
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/clinic-payment-accounts", $queryParams);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch payment accounts'], 500);
        }
    }

    public function createPaymentAccount(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge(['client_identifier' => $clientIdentifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/clinic-payment-accounts", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create payment account'], 500);
        }
    }

    public function getPaymentAccount(Request $request, $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/clinic-payment-accounts/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch payment account'], 500);
        }
    }

    public function updatePaymentAccount(Request $request, $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge(['client_identifier' => $clientIdentifier]);
            
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/clinic-payment-accounts/{$id}", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update payment account'], 500);
        }
    }

    public function deletePaymentAccount(Request $request, $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/clinic-payment-accounts/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete payment account'], 500);
        }
    }

    public function assignPatientsToAccount(Request $request, $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge(['client_identifier' => $clientIdentifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/clinic-payment-accounts/{$id}/assign-patients", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to assign patients'], 500);
        }
    }

    public function removePatientsFromAccount(Request $request, $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge(['client_identifier' => $clientIdentifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/clinic-payment-accounts/{$id}/remove-patients", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to remove patients'], 500);
        }
    }

    public function createAccountBill(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge(['client_identifier' => $clientIdentifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-bills/account-bill", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create account bill'], 500);
        }
    }

    public function createAccountPayment(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            $request->merge(['client_identifier' => $clientIdentifier]);
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-payments/account-payment", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to record account payment'], 500);
        }
    }

    public function updateBillStatus(Request $request, $billId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/patient-bills/{$billId}/status", $request->all());
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update bill status'], 500);
        }
    }

    // Universal Medical Record System Endpoints

    /**
     * Get patient encounters
     */
    public function getPatientEncounters(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/patient-encounters", [
                    'client_identifier' => auth()->user()->identifier,
                    'patient_id' => $request->input('patient_id'),
                    'status' => $request->input('status'),
                    'encounter_type' => $request->input('encounter_type'),
                    'date_from' => $request->input('date_from'),
                    'date_to' => $request->input('date_to')
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch patient encounters'], 500);
        }
    }

    /**
     * Create patient encounter
     */
    public function createPatientEncounter(Request $request)
    {
        try {
            $data = $request->all();
            $data['client_identifier'] = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-encounters", $data);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create patient encounter'], 500);
        }
    }

    /**
     * Get patient vital signs
     */
    public function getPatientVitalSigns(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/patient-vital-signs", [
                    'client_identifier' => auth()->user()->identifier,
                    'patient_id' => $request->input('patient_id'),
                    'encounter_id' => $request->input('encounter_id'),
                    'date_from' => $request->input('date_from'),
                    'date_to' => $request->input('date_to'),
                    'abnormal_only' => $request->input('abnormal_only')
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch vital signs'], 500);
        }
    }

    /**
     * Get patient diagnoses
     */
    public function getPatientDiagnoses(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/patient-diagnoses", [
                    'client_identifier' => auth()->user()->identifier,
                    'patient_id' => $request->input('patient_id'),
                    'encounter_id' => $request->input('encounter_id'),
                    'status' => $request->input('status'),
                    'diagnosis_type' => $request->input('diagnosis_type')
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch diagnoses'], 500);
        }
    }

    /**
     * Get patient allergies
     */
    public function getPatientAllergies(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/patient-allergies", [
                    'client_identifier' => auth()->user()->identifier,
                    'patient_id' => $request->input('patient_id'),
                    'allergen_type' => $request->input('allergen_type'),
                    'severity' => $request->input('severity'),
                    'active_only' => $request->input('active_only')
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch allergies'], 500);
        }
    }

    /**
     * Create patient allergy
     */
    public function createPatientAllergy(Request $request)
    {
        try {
            $data = $request->all();
            $data['client_identifier'] = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-allergies", $data);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create allergy'], 500);
        }
    }

    /**
     * Update patient allergy
     */
    public function updatePatientAllergy(Request $request, $id)
    {
        try {
            $data = $request->all();
            $data['client_identifier'] = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/patient-allergies/{$id}", $data);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update allergy'], 500);
        }
    }

    /**
     * Delete patient allergy
     */
    public function deletePatientAllergy(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/patient-allergies/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete allergy'], 500);
        }
    }

    /**
     * Get patient medications
     */
    public function getPatientMedications(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/patient-medications", [
                    'client_identifier' => auth()->user()->identifier,
                    'patient_id' => $request->input('patient_id'),
                    'status' => $request->input('status'),
                    'medication_type' => $request->input('medication_type'),
                    'current_only' => $request->input('current_only')
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch medications'], 500);
        }
    }

    /**
     * Create patient medication
     */
    public function createPatientMedication(Request $request)
    {
        try {
            $data = $request->all();
            $data['client_identifier'] = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-medications", $data);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create medication'], 500);
        }
    }

    /**
     * Update patient medication
     */
    public function updatePatientMedication(Request $request, $id)
    {
        try {
            $data = $request->all();
            $data['client_identifier'] = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/patient-medications/{$id}", $data);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update medication'], 500);
        }
    }

    /**
     * Delete patient medication
     */
    public function deletePatientMedication(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/patient-medications/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete medication'], 500);
        }
    }

    /**
     * Get patient medical history
     */
    public function getPatientMedicalHistory(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/patient-medical-history", [
                    'client_identifier' => auth()->user()->identifier,
                    'patient_id' => $request->input('patient_id'),
                    'type' => $request->input('type'),
                    'active_only' => $request->input('active_only')
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch medical history'], 500);
        }
    }

    /**
     * Create patient medical history
     */
    public function createPatientMedicalHistory(Request $request)
    {
        try {
            $data = $request->all();
            $data['client_identifier'] = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/patient-medical-history", $data);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create medical history'], 500);
        }
    }

    /**
     * Update patient medical history
     */
    public function updatePatientMedicalHistory(Request $request, $id)
    {
        try {
            $data = $request->all();
            $data['client_identifier'] = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/patient-medical-history/{$id}", $data);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update medical history'], 500);
        }
    }

    /**
     * Delete patient medical history
     */
    public function deletePatientMedicalHistory(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/patient-medical-history/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete medical history'], 500);
        }
    }

    /**
     * Update patient VIP status
     */
    public function updateVipStatus(Request $request, $patientId)
    {
        try {
            $validated = $request->validate([
                'is_vip' => 'required|boolean',
                'vip_tier' => 'nullable|in:standard,gold,platinum,diamond',
                'vip_discount_percentage' => 'nullable|numeric|min:0|max:100',
                'vip_notes' => 'nullable|string',
                'priority_scheduling' => 'nullable|boolean',
                'extended_consultation_time' => 'nullable|boolean',
                'dedicated_staff_assignment' => 'nullable|boolean',
                'complimentary_services' => 'nullable|boolean'
            ]);

            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/patients/{$patientId}/vip-status", array_merge($validated, [
                    'client_identifier' => auth()->user()->identifier
                ]));

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $responseData = $response->json();
            
            return response()->json([
                'success' => true,
                'message' => 'VIP status updated successfully',
                'patient' => $responseData['patient'] ?? null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update VIP status: ' . $e->getMessage()
            ], 500);
        }
    }
}