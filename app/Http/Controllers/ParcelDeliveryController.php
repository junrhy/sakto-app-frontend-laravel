<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ParcelDeliveryController extends Controller
{
    protected $apiUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the parcel delivery dashboard.
     */
    public function index()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/parcel-deliveries", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $deliveries = $response->json()['data'] ?? [];

            // Calculate stats
            $stats = [
                'total_deliveries' => count($deliveries),
                'pending_deliveries' => count(array_filter($deliveries, fn($d) => $d['status'] === 'pending')),
                'in_transit_deliveries' => count(array_filter($deliveries, fn($d) => $d['status'] === 'in_transit')),
                'delivered_deliveries' => count(array_filter($deliveries, fn($d) => $d['status'] === 'delivered')),
                'total_revenue' => array_sum(array_column(array_filter($deliveries, fn($d) => $d['status'] === 'delivered'), 'estimated_cost')),
            ];

            return Inertia::render('ParcelDelivery/Index', [
                'deliveries' => $deliveries,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('ParcelDeliveryController index error: ' . $e->getMessage());
            return Inertia::render('ParcelDelivery/Index', [
                'deliveries' => [],
                'stats' => [
                    'total_deliveries' => 0,
                    'pending_deliveries' => 0,
                    'in_transit_deliveries' => 0,
                    'delivered_deliveries' => 0,
                    'total_revenue' => 0,
                ],
            ]);
        }
    }

    /**
     * Show the form for creating a new delivery.
     */
    public function create()
    {
        return Inertia::render('ParcelDelivery/Create');
    }

    /**
     * Store a newly created delivery.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'delivery_type' => 'required|in:express,standard,economy',
                'sender_name' => 'required|string|max:255',
                'sender_phone' => 'required|string|max:255',
                'sender_email' => 'nullable|email|max:255',
                'sender_address' => 'required|string',
                'sender_coordinates' => 'nullable|string',
                'recipient_name' => 'required|string|max:255',
                'recipient_phone' => 'required|string|max:255',
                'recipient_email' => 'nullable|email|max:255',
                'recipient_address' => 'required|string',
                'recipient_coordinates' => 'nullable|string',
                'package_description' => 'required|string',
                'package_weight' => 'required|numeric|min:0.01',
                'package_length' => 'nullable|numeric|min:0',
                'package_width' => 'nullable|numeric|min:0',
                'package_height' => 'nullable|numeric|min:0',
                'package_value' => 'nullable|numeric|min:0',
                'distance_km' => 'nullable|numeric|min:0',
                'pickup_date' => 'required|date|after_or_equal:today',
                'pickup_time' => 'required|date_format:H:i',
                'special_instructions' => 'nullable|string',
                'is_urgent' => 'nullable|boolean',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/parcel-deliveries", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return redirect()->route('parcel-delivery.index')
                ->with('message', 'Delivery created successfully');
        } catch (\Exception $e) {
            Log::error('ParcelDeliveryController store error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create delivery: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified delivery.
     */
    public function show($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/parcel-deliveries/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $delivery = $response->json()['data'] ?? null;

            if (!$delivery) {
                abort(404, 'Delivery not found');
            }

            return Inertia::render('ParcelDelivery/Show', [
                'delivery' => $delivery,
            ]);
        } catch (\Exception $e) {
            Log::error('ParcelDeliveryController show error: ' . $e->getMessage());
            abort(500, 'Unable to load delivery information');
        }
    }

    /**
     * Public tracking page.
     */
    public function track($reference = null)
    {
        return Inertia::render('ParcelDelivery/Track', [
            'reference' => $reference,
        ]);
    }

    // ==================== API PROXY METHODS ====================

    /**
     * Get all deliveries with filtering.
     */
    public function getDeliveries(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/parcel-deliveries", $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch deliveries', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch deliveries',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate pricing for a delivery.
     */
    public function calculatePricing(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/parcel-deliveries/calculate-pricing", $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to calculate pricing', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate pricing',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get delivery by reference (public tracking).
     */
    public function getDeliveryByReference($reference)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/parcel-deliveries/track/{$reference}");

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch delivery by reference', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch delivery',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update delivery status.
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/parcel-deliveries/{$id}/update-status", $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to update delivery status', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update delivery status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign courier to delivery.
     */
    public function assignCourier(Request $request, $id)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/parcel-deliveries/{$id}/assign-courier", $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to assign courier', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign courier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the courier management page.
     */
    public function couriers()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/parcel-delivery-couriers", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            $couriers = $response->json()['data'] ?? [];

            return Inertia::render('ParcelDelivery/Couriers', [
                'couriers' => $couriers,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load couriers page', ['error' => $e->getMessage()]);
            return Inertia::render('ParcelDelivery/Couriers', [
                'couriers' => [],
            ]);
        }
    }

    /**
     * Get couriers list.
     */
    public function getCouriers(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/parcel-delivery-couriers", $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch couriers', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch couriers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new courier.
     */
    public function storeCourier(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/parcel-delivery-couriers", $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to create courier', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create courier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a courier.
     */
    public function updateCourier(Request $request, $id)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/parcel-delivery-couriers/{$id}", $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to update courier', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update courier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a courier.
     */
    public function deleteCourier(Request $request, $id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/parcel-delivery-couriers/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to delete courier', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete courier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update delivery.
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'delivery_type' => 'sometimes|in:express,standard,economy',
                'sender_name' => 'sometimes|string|max:255',
                'sender_phone' => 'sometimes|string|max:255',
                'sender_email' => 'nullable|email|max:255',
                'sender_address' => 'sometimes|string',
                'sender_coordinates' => 'nullable|string',
                'recipient_name' => 'sometimes|string|max:255',
                'recipient_phone' => 'sometimes|string|max:255',
                'recipient_email' => 'nullable|email|max:255',
                'recipient_address' => 'sometimes|string',
                'recipient_coordinates' => 'nullable|string',
                'package_description' => 'sometimes|string',
                'package_weight' => 'sometimes|numeric|min:0.01',
                'package_length' => 'nullable|numeric|min:0',
                'package_width' => 'nullable|numeric|min:0',
                'package_height' => 'nullable|numeric|min:0',
                'package_value' => 'nullable|numeric|min:0',
                'distance_km' => 'nullable|numeric|min:0',
                'pickup_date' => 'sometimes|date',
                'pickup_time' => 'sometimes|date_format:H:i',
                'special_instructions' => 'nullable|string',
                'notes' => 'nullable|string',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/parcel-deliveries/{$id}", $validated);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return redirect()->route('parcel-delivery.show', $id)
                ->with('message', 'Delivery updated successfully');
        } catch (\Exception $e) {
            Log::error('ParcelDeliveryController update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update delivery: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete delivery.
     */
    public function destroy($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/parcel-deliveries/{$id}", [
                    'client_identifier' => auth()->user()->identifier
                ]);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('ParcelDeliveryController destroy error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete delivery',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

