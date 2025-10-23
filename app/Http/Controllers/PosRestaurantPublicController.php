<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class PosRestaurantPublicController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Show the public reservation page
     */
    public function reservation(Request $request): Response
    {
        try {
            // Get client identifier from request or use default
            $clientIdentifier = $request->get('client_identifier', 'default');
            
            // Get tables from backend API
            $tablesResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-tables?client_identifier={$clientIdentifier}");

            if (!$tablesResponse->successful()) {
                throw new \Exception('Failed to fetch tables');
            }

            $tables = $tablesResponse->json()['data']['fnb_tables'] ?? [];

            // Get opened dates from backend API
            $openedDatesResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-opened-dates?client_identifier={$clientIdentifier}");

            if (!$openedDatesResponse->successful()) {
                throw new \Exception('Failed to fetch opened dates');
            }

            $openedDates = $openedDatesResponse->json()['data'] ?? [];

            return Inertia::render('PosRestaurant/PublicReservation', [
                'tables' => $tables,
                'openedDates' => $openedDates,
                'restaurantName' => 'Restaurant',
                'restaurantAddress' => null,
                'restaurantPhone' => null,
                'clientIdentifier' => $clientIdentifier,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('PosRestaurant/PublicReservation', [
                'tables' => [],
                'openedDates' => [],
                'restaurantName' => 'Restaurant',
                'restaurantAddress' => null,
                'restaurantPhone' => null,
                'clientIdentifier' => $clientIdentifier ?? 'default',
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Submit a public reservation
     */
    public function submitReservation(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'countryCode' => 'required|string|max:10',
                'phone' => 'required|string|max:20|regex:/^[1-9][0-9]*$/',
                'date' => 'required|date',
                'time' => 'required|string',
                'guests' => 'required|integer|min:1|max:20',
                'notes' => 'nullable|string|max:1000',
                'client_identifier' => 'required|string',
            ], [
                'phone.regex' => 'Phone number cannot start with zero and must contain only numbers.',
            ]);

            // Combine country code and phone number
            $contact = $validated['countryCode'] . ' ' . $validated['phone'];

            // Prepare reservation data for API
            $reservationData = [
                'client_identifier' => $validated['client_identifier'],
                'name' => $validated['name'],
                'contact' => $contact,
                'email' => $validated['email'],
                'date' => $validated['date'],
                'time' => $validated['time'],
                'guests' => $validated['guests'],
                'notes' => $validated['notes'],
                'status' => 'pending',
            ];

            // Submit reservation to backend API
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/fnb-reservations", $reservationData);

            if (!$response->successful()) {
                $errorMessage = $response->json()['message'] ?? 'Failed to submit reservation';
                throw new \Exception($errorMessage);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Reservation submitted successfully',
                'data' => $response->json()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the reservation confirmation page
     */
    public function confirmReservation($token): Response
    {
        try {
            // Fetch reservation details by token from backend API
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/fnb-reservations/by-token/{$token}");

            if (!$response->successful()) {
                return Inertia::render('PosRestaurant/ReservationConfirmation', [
                    'token' => $token,
                    'reservation' => null,
                    'error' => 'Reservation not found'
                ]);
            }

            $reservation = $response->json()['data'];

            return Inertia::render('PosRestaurant/ReservationConfirmation', [
                'token' => $token,
                'reservation' => $reservation
            ]);

        } catch (\Exception $e) {
            return Inertia::render('PosRestaurant/ReservationConfirmation', [
                'token' => $token,
                'reservation' => null,
                'error' => 'Failed to load reservation details'
            ]);
        }
    }

}
