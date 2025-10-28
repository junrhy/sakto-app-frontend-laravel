<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ClinicEmbedController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Get clinic information for embedding
     */
    public function getClinicInfo($identifier)
    {
        try {
            // Find the clinic
            $clinic = null;
            if (is_numeric($identifier)) {
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('id', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'identifier', 'slug')
                    ->first();
            } else {
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('slug', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'identifier', 'slug')
                    ->first();
            }

            if (!$clinic) {
                return response()->json(['error' => 'Clinic not found'], 404);
            }

            // Get clinic services and information from backend API
            $clinicInfo = $this->getClinicInfoFromAPI($clinic->identifier);
            
            return response()->json([
                'clinic' => $clinic,
                'services' => $clinicInfo['services'] ?? [],
                'doctors' => $clinicInfo['doctors'] ?? [],
                'hours' => $clinicInfo['hours'] ?? [],
                'about' => $clinicInfo['about'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('ClinicEmbedController getClinicInfo error: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to load clinic information'], 500);
        }
    }

    /**
     * Book appointment from embedded form
     */
    public function bookAppointment(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'clinic_id' => 'required|string',
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

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            // Find the clinic
            $clinic = null;
            if (is_numeric($validated['clinic_id'])) {
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('id', $validated['clinic_id'])
                    ->first();
            } else {
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('slug', $validated['clinic_id'])
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
                'appointment_type' => 'consultation',
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

            // Prepare response data
            $appointmentResponse = [
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
                'clinic' => [
                    'id' => $clinic->id,
                    'name' => $clinic->name,
                    'email' => $clinic->email,
                    'contact_number' => $clinic->contact_number,
                    'identifier' => $clinic->identifier,
                    'slug' => $clinic->slug,
                ]
            ];

            return response()->json([
                'success' => true,
                'message' => 'Appointment booked successfully! We will contact you to confirm.',
                'appointment' => $appointmentResponse
            ]);

        } catch (\Exception $e) {
            Log::error('ClinicEmbedController appointment booking error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to book appointment. Please try again or call us directly.',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get clinic information from backend API
     */
    private function getClinicInfoFromAPI($clientIdentifier)
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
            Log::error('Failed to fetch clinic info: ' . $e->getMessage());
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
     * Generate embed script for a clinic
     */
    public function generateEmbedScript($identifier)
    {
        try {
            // Find the clinic
            $clinic = null;
            if (is_numeric($identifier)) {
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('id', $identifier)
                    ->select('id', 'name', 'identifier', 'slug')
                    ->first();
            } else {
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('slug', $identifier)
                    ->select('id', 'name', 'identifier', 'slug')
                    ->first();
            }

            if (!$clinic) {
                return response()->json(['error' => 'Clinic not found'], 404);
            }

            $embedScript = $this->generateEmbedCode($clinic);
            
            $clinicId = $clinic->slug ?: $clinic->id;
            
            return response()->json([
                'clinic' => $clinic,
                'embed_script' => $embedScript,
                'embed_url' => url("/embed/appointment/{$clinicId}")
            ]);
        } catch (\Exception $e) {
            Log::error('ClinicEmbedController script generation error: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to generate embed script'], 500);
        }
    }

    /**
     * Show the embed widget page
     */
    public function showWidget($identifier)
    {
        try {
            // Find the clinic
            $clinic = null;
            if (is_numeric($identifier)) {
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('id', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'identifier', 'slug')
                    ->first();
            } else {
                $clinic = \App\Models\User::where('project_identifier', 'medical')
                    ->where('slug', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'identifier', 'slug')
                    ->first();
            }

            if (!$clinic) {
                abort(404, 'Clinic not found');
            }

            return Inertia::render('Embed/AppointmentWidget', [
                'clinicId' => $clinic->slug ?: $clinic->id,
                'clinic' => $clinic,
            ]);
        } catch (\Exception $e) {
            Log::error('ClinicEmbedController showWidget error: ' . $e->getMessage());
            abort(500, 'Unable to load appointment widget');
        }
    }

    /**
     * Generate the actual embed code
     */
    private function generateEmbedCode($clinic)
    {
        $clinicId = $clinic->slug ?: $clinic->id;
        $embedUrl = url("/embed/appointment/{$clinicId}");
        
        return <<<HTML
<!-- Neulify Appointment Booking Widget -->
<div id="neulify-appointment-widget"></div>
<script>
(function() {
    var script = document.createElement('script');
    script.src = '{$embedUrl}/widget.js';
    script.async = true;
    script.onload = function() {
        if (window.NeulifyAppointmentWidget) {
            window.NeulifyAppointmentWidget.init({
                containerId: 'neulify-appointment-widget',
                clinicId: '{$clinicId}',
                apiUrl: '{$embedUrl}',
                theme: 'light', // or 'dark'
                primaryColor: '#0d9488',
                showClinicInfo: false,
                customTitle: 'Book Your Appointment',
                customSubtitle: 'Fill out the form below to schedule your appointment. We will contact you to confirm.'
            });
        }
    };
    document.head.appendChild(script);
})();
</script>
<!-- End Neulify Appointment Booking Widget -->
HTML;
    }
}
