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
        $this->apiUrl = env('API_URL');
        $this->apiToken = env('API_TOKEN');
    }

    public function index()
    {
        $payrolls = $this->getList();
        return Inertia::render('Payroll', ['payrolls' => $payrolls]);
    }

    public function getList(Request $request): JsonResponse
    {
        try {
            $client_identifier = $request->client_identifier;
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/payroll", ['client_identifier' => $client_identifier]);

            if (!$response->successful()) {
                throw new Exception('Failed to fetch payroll records from API');
            }

            return response()->json($response->json());
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
                'position' => 'required|string|max:255',
                'salary' => 'required|numeric|min:0',
                'startDate' => 'required|date',
                'status' => 'required|in:active,inactive',
            ]);
            $validated['client_identifier'] = $request->client_identifier;
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/payroll", $validated);
dd($response->json());
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
            $validated['client_identifier'] = $request->client_identifier;
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

    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/payroll/{$id}");

            if (!$response->successful()) {
                throw new Exception('Failed to delete payroll record from API');
            }

            return response()->json(null, 204);
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
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/payroll/overview");

            if (!$response->successful()) {
                throw new Exception('Failed to fetch payroll overview from API');
            }

            return response()->json($response->json());
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch payroll overview',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}