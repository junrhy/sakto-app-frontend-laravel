<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class BillerController extends Controller
{
    protected $apiUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the billers index page.
     */
    public function index()
    {
        return Inertia::render('Biller/Index');
    }

    /**
     * Get all billers with filtering and pagination.
     */
    public function getBillers(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/billers', $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch billers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get biller categories.
     */
    public function getCategories(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/billers/categories', $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new biller.
     */
    public function store(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/billers', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create biller',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific biller.
     */
    public function show($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/billers/' . $id);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch biller',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a biller.
     */
    public function update(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->put($this->apiUrl . '/billers/' . $id, $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update biller',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a biller.
     */
    public function destroy($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete($this->apiUrl . '/billers/' . $id);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete biller',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk update biller status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/billers/bulk-update-status', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update billers status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk delete billers.
     */
    public function bulkDelete(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/billers/bulk-delete', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete billers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
