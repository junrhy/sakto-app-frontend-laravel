<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class MedicalController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Show public clinic information
     */
    public function show($identifier)
    {
        try {
            // Check if identifier is numeric (ID) or string (slug)
            $clinic = null;
            
            if (is_numeric($identifier)) {
                // Search by ID
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('id', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            } else {
                // Search by slug
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('slug', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            }

            if (!$clinic) {
                abort(404, 'Clinic not found');
            }

            // Get clinic services and information from backend API
            $clinicInfo = $this->getClinicInfo($clinic->identifier);
            
            return Inertia::render('Landing/Medical/Show', [
                'clinic' => $clinic,
                'clinicInfo' => $clinicInfo,
                'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
                'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
                'auth' => [
                    'user' => auth()->user()
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('MedicalController show error: ' . $e->getMessage());
            abort(500, 'Unable to load clinic information');
        }
    }

    /**
     * Get clinic information from backend API
     */
    private function getClinicInfo($clientIdentifier)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/clinic-info", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                return [
                    'services' => [],
                    'doctors' => [],
                    'hours' => [],
                    'contact' => [],
                    'about' => null
                ];
            }

            return $response->json();
        } catch (\Exception $e) {
            \Log::error('Failed to fetch clinic info: ' . $e->getMessage());
            return [
                'services' => [],
                'doctors' => [],
                'hours' => [],
                'contact' => [],
                'about' => null
            ];
        }
    }

    /**
     * Book an appointment for a clinic
     */
    public function bookAppointment(Request $request, $identifier)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'patient_name' => 'required|string|max:255',
                'patient_email' => 'required|email|max:255',
                'patient_phone' => 'required|string|max:20',
                'appointment_date' => 'required|date|after:today',
                'appointment_time' => 'required|string',
                'service_name' => 'nullable|string|max:255',
                'doctor_name' => 'nullable|string|max:255',
                'notes' => 'nullable|string|max:1000',
                'preferred_language' => 'nullable|string|max:50',
            ]);

            // Find the clinic
            $clinic = null;
            if (is_numeric($identifier)) {
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('id', $identifier)
                    ->first();
            } else {
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('slug', $identifier)
                    ->first();
            }

            if (!$clinic) {
                return response()->json(['error' => 'Clinic not found'], 404);
            }

            // First, try to find existing patient by email, phone, or name
            $existingPatientResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/patients", [
                    'client_identifier' => $clinic->identifier,
                    'email' => $validated['patient_email'],
                    'phone' => $validated['patient_phone'],
                    'name' => $validated['patient_name'],
                ]);

            $patientId = null;
            
            if ($existingPatientResponse->successful()) {
                $existingPatientData = $existingPatientResponse->json();
                if (isset($existingPatientData['patients']) && count($existingPatientData['patients']) > 0) {
                    // Check for exact match on email first, then phone, then name
                    $patients = $existingPatientData['patients'];
                    
                    foreach ($patients as $patient) {
                        // Priority: email match, then phone match, then name match
                        if (isset($patient['email']) && $patient['email'] === $validated['patient_email']) {
                            $patientId = $patient['id'];
                            break;
                        } elseif (isset($patient['phone']) && $patient['phone'] === $validated['patient_phone']) {
                            $patientId = $patient['id'];
                            break;
                        } elseif (isset($patient['name']) && strtolower(trim($patient['name'])) === strtolower(trim($validated['patient_name']))) {
                            $patientId = $patient['id'];
                            break;
                        }
                    }
                }
            }

            // If no existing patient found, create a new one
            if (!$patientId) {
                $patientResponse = Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/patients", [
                        'name' => $validated['patient_name'],
                        'email' => $validated['patient_email'],
                        'phone' => $validated['patient_phone'],
                        'client_identifier' => $clinic->identifier,
                        'status' => 'active',
                    ]);

                if (!$patientResponse->successful()) {
                    throw new \Exception('Failed to create patient record: ' . $patientResponse->body());
                }

                $patientData = $patientResponse->json();
                $patientId = $patientData['patient']['id'] ?? $patientData['id'] ?? null;

                if (!$patientId) {
                    throw new \Exception('Failed to get patient ID from response');
                }
            }

            // Prepare appointment data
            $notes = $validated['notes'] ?? '';
            if ($validated['service_name']) {
                $notes = ($notes ? $notes . "\n\n" : '') . "Requested Service: " . $validated['service_name'];
            }

            $appointmentData = [
                'client_identifier' => $clinic->identifier,
                'patient_id' => $patientId,
                'patient_name' => $validated['patient_name'],
                'patient_phone' => $validated['patient_phone'],
                'patient_email' => $validated['patient_email'],
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $validated['appointment_time'],
                'appointment_type' => 'consultation', // Use default valid appointment type
                'notes' => $notes,
                'doctor_name' => $validated['doctor_name'],
                'status' => 'scheduled',
                'payment_status' => 'pending',
            ];

            // Send appointment data to backend API
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/appointments", $appointmentData);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $responseData = $response->json();
            $appointment = $responseData['appointment'] ?? null;

            // Prepare appointment data for the confirmation page
            $appointmentData = [
                'id' => $appointment['id'] ?? null,
                'patient_name' => $validated['patient_name'],
                'patient_email' => $validated['patient_email'],
                'patient_phone' => $validated['patient_phone'],
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $validated['appointment_time'],
                'service_name' => $validated['service_name'],
                'doctor_name' => $validated['doctor_name'],
                'notes' => $validated['notes'],
                'preferred_language' => $validated['preferred_language'],
                'status' => 'scheduled',
                'created_at' => now()->toISOString(),
            ];

            return Inertia::render('Landing/Medical/AppointmentConfirmation', [
                'appointment' => $appointmentData,
                'clinic' => $clinic,
                'message' => 'Appointment booked successfully! We will contact you to confirm.'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Let Inertia handle validation errors
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Appointment booking error: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'general' => 'Failed to book appointment. Please try again or call us directly.'
            ]);
        }
    }

}
