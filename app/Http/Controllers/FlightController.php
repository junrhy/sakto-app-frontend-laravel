<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
class FlightController extends Controller
{
    private $accessToken;
    private $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('AMADEUS_API_ENV') === 'production' 
            ? 'https://api.amadeus.com' 
            : 'https://test.api.amadeus.com';
        
        $this->getAccessToken();
    }

    private function getAccessToken()
    {
        try {
            $response = Http::asForm()->post($this->baseUrl . '/v1/security/oauth2/token', [
                'grant_type' => 'client_credentials',
                'client_id' => env('AMADEUS_CLIENT_ID'),
                'client_secret' => env('AMADEUS_CLIENT_SECRET'),
            ]);

            if ($response->successful()) {
                $this->accessToken = $response->json()['access_token'];
                return true;
            } else {
                \Log::error('Amadeus token error: ' . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            \Log::error('Amadeus token exception: ' . $e->getMessage());
            return false;
        }
    }

    public function index()
    {
        return Inertia::render('FlightSearch');
    }

    public function searchAirports(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string|min:1',
        ]);

        try {
            if (!$this->accessToken && !$this->getAccessToken()) {
                return response()->json([
                    'error' => 'Failed to authenticate with Amadeus API'
                ], 500);
            }

            $response = Http::withToken($this->accessToken)
                ->get($this->baseUrl . '/v1/reference-data/locations', [
                    'subType' => 'AIRPORT',
                    'keyword' => $request->query('keyword'),
                    'page[limit]' => 20,
                    'sort' => 'analytics.travelers.score',
                    'view' => 'FULL'
                ]);

            if ($response->successful()) {
                $locations = collect($response->json()['data'])->map(function($location) {
                    if ($location['subType'] === 'AIRPORT') {
                        return [
                            'iataCode' => $location['iataCode'],
                            'name' => $location['name'],
                            'cityName' => $location['address']['cityName'],
                            'countryName' => $location['address']['countryName'],
                            'type' => 'airport',
                            'label' => "{$location['iataCode']} - {$location['name']}, {$location['address']['cityName']}, {$location['address']['countryName']}"
                        ];
                    } else {
                        return [
                            'iataCode' => $location['iataCode'],
                            'name' => "All airports in {$location['name']}",
                            'cityName' => $location['name'],
                            'countryName' => $location['address']['countryName'],
                            'type' => 'city',
                            'label' => "{$location['iataCode']} - All airports in {$location['name']}, {$location['address']['countryName']}"
                        ];
                    }
                })->filter()->values();
                
                return response()->json($locations);
            } else {
                return response()->json([
                    'error' => 'Failed to fetch airports',
                    'details' => $response->json()
                ], 422);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process airport search',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        $request->validate([
            'origin' => 'required|string|size:3',
            'destination' => 'required|string|size:3',
            'departureDate' => 'required|date|after:today',
            'adults' => 'required|integer|min:1|max:9',
            'travelClass' => 'required|in:ECONOMY,PREMIUM_ECONOMY,BUSINESS,FIRST',
        ]);

        try {
            if (!$this->accessToken && !$this->getAccessToken()) {
                return response()->json([
                    'error' => 'Failed to authenticate with Amadeus API'
                ], 500);
            }

            $response = Http::withToken($this->accessToken)
                ->get($this->baseUrl . '/v2/shopping/flight-offers', [
                    'originLocationCode' => $request->query('origin'),
                    'destinationLocationCode' => $request->query('destination'),
                    'departureDate' => $request->query('departureDate'),
                    'adults' => $request->query('adults'),
                    'travelClass' => $request->query('travelClass'),
                    'currencyCode' => 'PHP',
                    'max' => 20,
                ]);

            if ($response->successful()) {
                return response()->json($response->json()['data']);
            } else {
                return response()->json([
                    'error' => 'Failed to fetch flight offers',
                    'details' => $response->json()
                ], 422);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process flight search',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllAirports()
    {
        try {
            if (!$this->accessToken && !$this->getAccessToken()) {
                return response()->json([
                    'error' => 'Failed to authenticate with Amadeus API'
                ], 500);
            }

            $response = Http::withToken($this->accessToken)
                ->get($this->baseUrl . '/v1/reference-data/locations', [
                    'subType' => 'CITY,AIRPORT',
                    'keyword' => 'a',
                    'page[limit]' => 100,
                    'sort' => 'analytics.travelers.score',
                    'view' => 'FULL'
                ]);

            if ($response->successful()) {
                $locations = collect($response->json()['data'])->map(function($location) {
                    if ($location['subType'] === 'AIRPORT') {
                        return [
                            'iataCode' => $location['iataCode'],
                            'name' => $location['name'],
                            'cityName' => $location['address']['cityName'],
                            'countryName' => $location['address']['countryName'],
                            'type' => 'airport',
                            'label' => "{$location['iataCode']} - {$location['name']}, {$location['address']['cityName']}, {$location['address']['countryName']}"
                        ];
                    } else {
                        return [
                            'iataCode' => $location['iataCode'],
                            'name' => "All airports in {$location['name']}",
                            'cityName' => $location['name'],
                            'countryName' => $location['address']['countryName'],
                            'type' => 'city',
                            'label' => "{$location['iataCode']} - All airports in {$location['name']}, {$location['address']['countryName']}"
                        ];
                    }
                })->filter()->values();
                
                return response()->json($locations);
            } else {
                \Log::error('Amadeus API error: ' . json_encode($response->json()));
                return response()->json([
                    'error' => 'Failed to fetch airports',
                    'details' => $response->json()
                ], 422);
            }
        } catch (\Exception $e) {
            \Log::error('Airport request exception: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to process airport request',
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 