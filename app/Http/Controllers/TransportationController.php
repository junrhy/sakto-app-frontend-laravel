<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TransportationController extends Controller
{
    protected $apiUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Display the transportation dashboard.
     */
    public function index()
    {
        return Inertia::render('Transportation/Index');
    }

    // ==================== FLEET MANAGEMENT ====================

    /**
     * Get all trucks with filtering and pagination.
     */
    public function getFleet(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/fleet', $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch fleet', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fleet',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get fleet dashboard statistics.
     */
    public function getFleetStats()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/fleet/stats', [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch fleet stats', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fleet statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new truck.
     */
    public function storeFleet(Request $request)
    {
        try {
            $validated = $request->validate([
                'plate_number' => 'required|string|max:255',
                'model' => 'required|string|max:255',
                'capacity' => 'required|integer|min:1',
                'status' => 'required|string|in:Available,In Transit,Maintenance',
                'last_maintenance' => 'nullable|date',
                'fuel_level' => 'nullable|numeric|min:0|max:100',
                'mileage' => 'nullable|integer|min:0',
                'driver' => 'nullable|string|max:255',
                'driver_contact' => 'nullable|string|max:255',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/transportation/fleet', $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to create truck', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create truck',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific truck.
     */
    public function showFleet($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/fleet/' . $id, [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to fetch truck', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch truck',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a truck.
     */
    public function updateFleet(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'plate_number' => 'required|string|max:255',
                'model' => 'required|string|max:255',
                'capacity' => 'required|integer|min:1',
                'status' => 'required|string|in:Available,In Transit,Maintenance',
                'last_maintenance' => 'nullable|date',
                'fuel_level' => 'nullable|numeric|min:0|max:100',
                'mileage' => 'nullable|integer|min:0',
                'driver' => 'nullable|string|max:255',
                'driver_contact' => 'nullable|string|max:255',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->put($this->apiUrl . '/transportation/fleet/' . $id, $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to update truck', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update truck',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a truck.
     */
    public function destroyFleet($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete($this->apiUrl . '/transportation/fleet/' . $id, [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to delete truck', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete truck',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update fuel level for a truck.
     */
    public function updateFuel(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'liters_added' => 'required|numeric|min:0',
                'cost' => 'required|numeric|min:0',
                'location' => 'required|string|max:255',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/transportation/fleet/' . $id . '/fuel', $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to update fuel', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update fuel level',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Schedule maintenance for a truck.
     */
    public function scheduleMaintenance(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|string|in:Routine,Repair',
                'description' => 'required|string',
                'cost' => 'required|numeric|min:0',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/transportation/fleet/' . $id . '/maintenance', $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to schedule maintenance', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule maintenance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get fuel history for a truck.
     */
    public function getFuelHistory($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/fleet/' . $id . '/fuel-history', [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch fuel history', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fuel history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get maintenance history for a truck.
     */
    public function getMaintenanceHistory($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/fleet/' . $id . '/maintenance-history', [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch maintenance history', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch maintenance history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== SHIPMENT TRACKING ====================

    /**
     * Get all shipments with filtering and pagination.
     */
    public function getShipments(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/shipments', $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch shipments', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch shipments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get shipment dashboard statistics.
     */
    public function getShipmentStats()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/shipments/stats', [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch shipment stats', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch shipment statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new shipment.
     */
    public function storeShipment(Request $request)
    {
        try {
            $validated = $request->validate([
                'truck_id' => 'required|integer',
                'driver' => 'required|string|max:255',
                'helpers' => 'nullable|array',
                'helpers.*.name' => 'required_with:helpers|string|max:255',
                'helpers.*.role' => 'required_with:helpers|string|max:255',
                'destination' => 'required|string|max:255',
                'origin' => 'required|string|max:255',
                'departure_date' => 'required|date',
                'arrival_date' => 'required|date|after:departure_date',
                'status' => 'required|string|in:Scheduled,In Transit,Delivered,Delayed',
                'cargo' => 'required|string|max:255',
                'weight' => 'required|numeric|min:0',
                'current_location' => 'nullable|string|max:255',
                'estimated_delay' => 'nullable|integer|min:0',
                'customer_contact' => 'required|string|max:255',
                'priority' => 'required|string|in:Low,Medium,High',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/transportation/shipments', $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to create shipment', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create shipment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific shipment.
     */
    public function showShipment($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/shipments/' . $id, [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to fetch shipment', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch shipment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a shipment.
     */
    public function updateShipment(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'truck_id' => 'required|integer',
                'driver' => 'required|string|max:255',
                'helpers' => 'nullable|array',
                'helpers.*.name' => 'required_with:helpers|string|max:255',
                'helpers.*.role' => 'required_with:helpers|string|max:255',
                'destination' => 'required|string|max:255',
                'origin' => 'required|string|max:255',
                'departure_date' => 'required|date',
                'arrival_date' => 'required|date|after:departure_date',
                'status' => 'required|string|in:Scheduled,In Transit,Delivered,Delayed',
                'cargo' => 'required|string|max:255',
                'weight' => 'required|numeric|min:0',
                'current_location' => 'nullable|string|max:255',
                'estimated_delay' => 'nullable|integer|min:0',
                'customer_contact' => 'required|string|max:255',
                'priority' => 'required|string|in:Low,Medium,High',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->put($this->apiUrl . '/transportation/shipments/' . $id, $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to update shipment', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update shipment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a shipment.
     */
    public function destroyShipment($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete($this->apiUrl . '/transportation/shipments/' . $id, [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to delete shipment', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete shipment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update shipment status.
     */
    public function updateShipmentStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:Scheduled,In Transit,Delivered,Delayed',
                'location' => 'required|string|max:255',
                'notes' => 'nullable|string',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/transportation/shipments/' . $id . '/status', $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to update shipment status', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update shipment status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get tracking history for a shipment.
     */
    public function getTrackingHistory($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/shipments/' . $id . '/tracking-history', [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch tracking history', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tracking history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== CARGO MONITORING ====================

    /**
     * Get all cargo items with filtering and pagination.
     */
    public function getCargo(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/cargo', $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch cargo', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cargo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get cargo dashboard statistics.
     */
    public function getCargoStats()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/cargo/stats', [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch cargo stats', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cargo statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new cargo item.
     */
    public function storeCargo(Request $request)
    {
        try {
            $validated = $request->validate([
                'shipment_id' => 'required|integer',
                'name' => 'required|string|max:255',
                'quantity' => 'required|integer|min:1',
                'unit' => 'required|string|in:kg,pieces,pallets,boxes',
                'description' => 'nullable|string',
                'special_handling' => 'nullable|string|max:255',
                'status' => 'required|string|in:Loaded,In Transit,Delivered,Damaged',
                'temperature' => 'nullable|numeric|min:-50|max:100',
                'humidity' => 'nullable|numeric|min:0|max:100',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/transportation/cargo', $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to create cargo', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create cargo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific cargo item.
     */
    public function showCargo($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/cargo/' . $id, [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to fetch cargo', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cargo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a cargo item.
     */
    public function updateCargo(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'shipment_id' => 'required|integer',
                'name' => 'required|string|max:255',
                'quantity' => 'required|integer|min:1',
                'unit' => 'required|string|in:kg,pieces,pallets,boxes',
                'description' => 'nullable|string',
                'special_handling' => 'nullable|string|max:255',
                'status' => 'required|string|in:Loaded,In Transit,Delivered,Damaged',
                'temperature' => 'nullable|numeric|min:-50|max:100',
                'humidity' => 'nullable|numeric|min:0|max:100',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->put($this->apiUrl . '/transportation/cargo/' . $id, $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to update cargo', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cargo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a cargo item.
     */
    public function destroyCargo($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete($this->apiUrl . '/transportation/cargo/' . $id, [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to delete cargo', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete cargo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update cargo status.
     */
    public function updateCargoStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:Loaded,In Transit,Delivered,Damaged',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/transportation/cargo/' . $id . '/status', $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to update cargo status', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cargo status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get cargo items by shipment.
     */
    public function getCargoByShipment($shipmentId)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/cargo/shipment/' . $shipmentId, [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch cargo by shipment', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cargo by shipment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== BOOKING MANAGEMENT ====================

    /**
     * Get all bookings with filtering and pagination.
     */
    public function getBookings(Request $request)
    {
        try {
            $request->merge(['client_identifier' => auth()->user()->identifier]);
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/bookings', $request->all());

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch bookings', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch bookings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get booking dashboard statistics.
     */
    public function getBookingStats()
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/bookings/stats', [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch booking stats', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch booking statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new booking.
     */
    public function storeBooking(Request $request)
    {
        try {
            $validated = $request->validate([
                'truck_id' => 'required|integer',
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email|max:255',
                'customer_phone' => 'required|string|max:255',
                'customer_company' => 'nullable|string|max:255',
                'pickup_location' => 'required|string|max:1000',
                'delivery_location' => 'required|string|max:1000',
                'pickup_date' => 'required|date|after_or_equal:today',
                'pickup_time' => 'required|date_format:H:i',
                'delivery_date' => 'required|date|after_or_equal:pickup_date',
                'delivery_time' => 'required|date_format:H:i',
                'cargo_description' => 'required|string|max:1000',
                'cargo_weight' => 'required|numeric|min:0.01',
                'cargo_unit' => 'required|string|in:kg,tons,pieces,pallets,boxes,liters',
                'special_requirements' => 'nullable|string|max:1000',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/transportation/bookings', $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to create booking', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific booking.
     */
    public function showBooking($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/bookings/' . $id, [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to fetch booking', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a booking.
     */
    public function updateBooking(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:Pending,Confirmed,In Progress,Completed,Cancelled',
                'notes' => 'nullable|string|max:1000',
                'estimated_cost' => 'nullable|numeric|min:0',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->put($this->apiUrl . '/transportation/bookings/' . $id, $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to update booking', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a booking.
     */
    public function destroyBooking($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete($this->apiUrl . '/transportation/bookings/' . $id, [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to delete booking', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific booking by reference (for authenticated users).
     */
    public function getBookingByReference(Request $request)
    {
        try {
            $request->validate([
                'booking_reference' => 'required|string',
                'client_identifier' => 'required|string'
            ]);

            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/bookings/reference', [
                    'client_identifier' => $request->client_identifier,
                    'booking_reference' => $request->booking_reference
                ]);
            
            $data = $response->json();
            
            return response()->json($data, $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to fetch booking by reference', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== PRICING MANAGEMENT ====================

    /**
     * Get all pricing configurations for the authenticated user.
     */
    public function getPricingConfigs(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/pricing-configs', [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch pricing configs', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pricing configurations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific pricing configuration.
     */
    public function showPricingConfig($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/pricing-configs/' . $id);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to fetch pricing config', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pricing configuration',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new pricing configuration.
     */
    public function storePricingConfig(Request $request)
    {
        try {
            $validated = $request->validate([
                'config_name' => 'required|string|max:255',
                'config_type' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'base_rates' => 'nullable|array',
                'distance_rates' => 'nullable|array',
                'weight_rates' => 'nullable|array',
                'special_handling_rates' => 'nullable|array',
                'surcharges' => 'nullable|array',
                'peak_hours' => 'nullable|array',
                'holidays' => 'nullable|array',
                'additional_costs' => 'nullable|array',
                'overtime_hours' => 'nullable|array',
                'currency' => 'nullable|string|max:10',
                'currency_symbol' => 'nullable|string|max:10',
                'decimal_places' => 'nullable|integer|min:0|max:4',
                'is_active' => 'nullable|boolean',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->post($this->apiUrl . '/transportation/pricing-configs', $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to create pricing config', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create pricing configuration',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a pricing configuration.
     */
    public function updatePricingConfig(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'config_name' => 'sometimes|required|string|max:255',
                'config_type' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'base_rates' => 'nullable|array',
                'distance_rates' => 'nullable|array',
                'weight_rates' => 'nullable|array',
                'special_handling_rates' => 'nullable|array',
                'surcharges' => 'nullable|array',
                'peak_hours' => 'nullable|array',
                'holidays' => 'nullable|array',
                'additional_costs' => 'nullable|array',
                'overtime_hours' => 'nullable|array',
                'currency' => 'nullable|string|max:10',
                'currency_symbol' => 'nullable|string|max:10',
                'decimal_places' => 'nullable|integer|min:0|max:4',
                'is_active' => 'nullable|boolean',
            ]);

            $response = Http::withToken($this->apiToken)
                ->put($this->apiUrl . '/transportation/pricing-configs/' . $id, $validated);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to update pricing config', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update pricing configuration',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a pricing configuration.
     */
    public function destroyPricingConfig($id)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->delete($this->apiUrl . '/transportation/pricing-configs/' . $id);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to delete pricing config', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete pricing configuration',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get default pricing configuration.
     */
    public function getDefaultPricingConfig(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/pricing-configs/default', [
                    'client_identifier' => auth()->user()->identifier
                ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch default pricing config', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch default pricing configuration',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate pricing preview.
     */
    public function calculatePricingPreview(Request $request)
    {
        try {
            $validated = $request->validate([
                'config_id' => 'nullable|integer|exists:transportation_pricing_configs,id',
                'truck_id' => 'required|integer|exists:transportation_fleets,id',
                'pickup_date' => 'required|date|after_or_equal:today',
                'pickup_time' => 'required|date_format:H:i',
                'delivery_date' => 'required|date|after_or_equal:pickup_date',
                'delivery_time' => 'required|date_format:H:i',
                'cargo_weight' => 'required|numeric|min:0.01',
                'cargo_unit' => 'required|string',
                'distance_km' => 'nullable|numeric|min:0',
                'route_type' => 'nullable|string',
                'requires_refrigeration' => 'nullable|boolean',
                'requires_special_equipment' => 'nullable|boolean',
                'requires_escort' => 'nullable|boolean',
                'is_urgent_delivery' => 'nullable|boolean',
            ]);

            $validated['client_identifier'] = auth()->user()->identifier;

            $response = Http::withToken($this->apiToken)
                ->get($this->apiUrl . '/transportation/pricing-configs/preview', $validated);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to calculate pricing preview', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate pricing preview',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}