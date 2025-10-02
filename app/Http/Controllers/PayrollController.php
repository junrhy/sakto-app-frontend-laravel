<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Exception;
use Illuminate\Http\JsonResponse;

class PayrollController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index()
    {
        $jsonAppCurrency = json_decode(auth()->user()->app_currency);
        return Inertia::render('Payroll/Index', [
            'currency_symbol' => $jsonAppCurrency->symbol
        ]);
    }

    public function getList(): JsonResponse
    {
        try {
            $client_identifier = auth()->user()->identifier;
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/payroll", ['client_identifier' => $client_identifier]);

            if (!$response->successful()) {
                throw new Exception('Failed to fetch payroll records from API');
            }

            $data = $response->json();
            
            // Add currency information to the response
            $data['currency'] = $jsonAppCurrency;

            return response()->json($data);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch payroll records',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'position' => 'required|string|max:255',
                'salary' => 'required|numeric|min:0',
                'startDate' => 'required|date',
                'status' => 'required|in:active,inactive',
            ]);
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/payroll", $validated);
            if (!$response->successful()) {
                throw new Exception('Failed to store payroll record in API');
            }

            return response()->json($response->json(), 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create payroll record',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'position' => 'required|string|max:255',
                'salary' => 'required|numeric|min:0',
                'startDate' => 'required|date',
                'status' => 'required|in:active,inactive',
            ]);
            $validated['client_identifier'] = auth()->user()->identifier;
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/payroll/{$id}", $validated);

            if (!$response->successful()) {
                throw new Exception('Failed to update payroll record in API');
            }

            return response()->json($response->json());
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to update payroll record',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/payroll/{$id}");

            if (!$response->successful()) {
                throw new Exception('Failed to delete payroll record in API');
            }

            return response()->json(['message' => 'Payroll record deleted successfully']);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to delete payroll record',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/payroll/bulk", [
                    'ids' => $request->ids
                ]);

            if (!$response->successful()) {
                throw new Exception('Failed to bulk delete payroll records from API');
            }

            return response()->json(null, 204);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to bulk delete payroll records',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getOverview(): JsonResponse
    {
        try {
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/payroll/overview");

            if (!$response->successful()) {
                throw new Exception('Failed to fetch payroll overview from API');
            }

            $data = $response->json();
            
            // Add currency information to the response
            $data['currency'] = $jsonAppCurrency;

            return response()->json($data);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch payroll overview',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function settings()
    {
        try {
            // $clientIdentifier = auth()->user()->identifier;
            // $response = Http::withToken($this->apiToken)
            //     ->get("{$this->apiUrl}/payroll/settings", [
            //         'client_identifier' => $clientIdentifier
            //     ]);

            // if (!$response->successful()) {
            //     throw new \Exception('Failed to fetch payroll settings');
            // }

            // Dummy data
            $dummySettings = [
                'data' => [
                    'pay_period' => 'bi-weekly',
                    'tax_rate' => 20,
                    'overtime_rate' => 1.5,
                    'standard_hours' => 40,
                    'benefits' => [
                        'health_insurance' => true,
                        'dental_insurance' => true,
                        'retirement_plan' => true
                    ],
                    'deductions' => [
                        'social_security' => 6.2,
                        'medicare' => 1.45
                    ]
                ]
            ];

            return Inertia::render('Payroll/Settings', [
                'settings' => $dummySettings['data'],
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load settings');
        }
    }

    // Salary History Methods
    public function getSalaryHistory(): JsonResponse
    {
        try {
            $client_identifier = auth()->user()->identifier;
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/payroll/salary-history", ['client_identifier' => $client_identifier]);

            if (!$response->successful()) {
                throw new Exception('Failed to fetch salary history from API');
            }

            $data = $response->json();
            $data['currency'] = $jsonAppCurrency;

            return response()->json($data);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch salary history',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function storeSalaryHistory(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'employee_id' => 'required|string',
                'previous_salary' => 'required|numeric|min:0',
                'new_salary' => 'required|numeric|min:0',
                'change_reason' => 'required|string|max:255',
                'approved_by' => 'required|string|max:255',
                'effective_date' => 'required|date',
                'notes' => 'nullable|string'
            ]);
            
            $validated['client_identifier'] = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/payroll/salary-history", $validated);

            if (!$response->successful()) {
                throw new Exception('Failed to store salary history in API');
            }

            return response()->json($response->json(), 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create salary history record',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Payroll Periods Methods
    public function getPayrollPeriods(): JsonResponse
    {
        try {
            $client_identifier = auth()->user()->identifier;
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/payroll/periods", ['client_identifier' => $client_identifier]);

            if (!$response->successful()) {
                throw new Exception('Failed to fetch payroll periods from API');
            }

            $data = $response->json();
            $data['currency'] = $jsonAppCurrency;

            return response()->json($data);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch payroll periods',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function storePayrollPeriod(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'period_name' => 'required|string|max:255',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'created_by' => 'required|string|max:255',
                'notes' => 'nullable|string'
            ]);
            
            $validated['client_identifier'] = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/payroll/periods", $validated);

            if (!$response->successful()) {
                throw new Exception('Failed to store payroll period in API');
            }

            return response()->json($response->json(), 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create payroll period',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Time Tracking Methods
    public function getTimeTracking(): JsonResponse
    {
        try {
            $client_identifier = auth()->user()->identifier;
            $jsonAppCurrency = json_decode(auth()->user()->app_currency);
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/payroll/time-tracking", ['client_identifier' => $client_identifier]);

            if (!$response->successful()) {
                throw new Exception('Failed to fetch time tracking from API');
            }

            $data = $response->json();
            $data['currency'] = $jsonAppCurrency;

            return response()->json($data);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch time tracking',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function storeTimeTracking(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'employee_id' => 'required|string',
                'work_date' => 'required|date',
                'clock_in' => 'nullable|date_format:H:i:s',
                'clock_out' => 'nullable|date_format:H:i:s',
                'status' => 'required|in:present,absent,late,half_day,leave',
                'notes' => 'nullable|string',
                'location' => 'nullable|string|max:255'
            ]);
            
            $validated['client_identifier'] = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/payroll/time-tracking", $validated);

            if (!$response->successful()) {
                throw new Exception('Failed to store time tracking in API');
            }

            return response()->json($response->json(), 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to create time tracking record',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}