<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TravelController extends Controller
{
    private $packages = [
        [
            'id' => 1,
            'name' => "Boracay Getaway Package",
            'description' => "3D2N stay at a beachfront resort with activities",
            'price' => 15000,
            'duration' => "3 days",
            'inclusions' => ["Hotel", "Transfers", "Island Hopping", "Meals"],
            'type' => "Premium"
        ],
        [
            'id' => 2,
            'name' => "Palawan Explorer Package",
            'description' => "4D3N adventure package with underground river tour",
            'price' => 20000,
            'duration' => "4 days",
            'inclusions' => ["Hotel", "Transfers", "Tours", "Some Meals"],
            'type' => "Standard"
        ]
    ];

    private $bookings = [
        [
            'id' => 1,
            'customerName' => "John Smith",
            'packageId' => 1,
            'travelDate' => "2024-04-15",
            'numberOfPeople' => 2,
            'totalPrice' => 30000,
            'status' => 'confirmed'
        ],
        [
            'id' => 2,
            'customerName' => "Maria Santos",
            'packageId' => 2,
            'travelDate' => "2024-05-01",
            'numberOfPeople' => 4,
            'totalPrice' => 80000,
            'status' => 'pending'
        ]
    ];

    public function index()
    {
        return Inertia::render('Travel', [
            'initialPackages' => $this->packages,
            'initialBookings' => $this->bookings
        ]);
    }

    public function getPackages()
    {
        return response()->json($this->packages);
    }

    public function storePackage(Request $request)
    {
        $package = $request->all();
        $package['id'] = count($this->packages) + 1;
        array_push($this->packages, $package);
        return response()->json($package);
    }

    public function updatePackage(Request $request, $id)
    {
        $updatedPackage = $request->all();
        return response()->json($updatedPackage);
    }

    public function deletePackage($id)
    {
        return response()->json(['success' => true]);
    }

    public function getBookings()
    {
        return response()->json($this->bookings);
    }

    public function storeBooking(Request $request)
    {
        $booking = $request->all();
        $booking['id'] = count($this->bookings) + 1;
        array_push($this->bookings, $booking);
        return response()->json($booking);
    }

    public function updateBooking(Request $request, $id)
    {
        $updatedBooking = $request->all();
        return response()->json($updatedBooking);
    }

    public function deleteBooking($id)
    {
        return response()->json(['success' => true]);
    }

    public function show($identifier)
    {
        try {
            // Check if identifier is numeric (ID) or string (slug)
            $travel = null;
            
            if (is_numeric($identifier)) {
                // Search by ID
                $travel = \App\Models\User::where('project_identifier', 'travel')
                    ->where('id', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            } else {
                // Search by slug
                $travel = \App\Models\User::where('project_identifier', 'travel')
                    ->where('slug', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            }

            if (!$travel) {
                abort(404, 'Travel service not found');
            }

            return Inertia::render('Landing/Travel/Show', [
                'travel' => $travel,
                'identifier' => $identifier,
                'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
                'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
                'auth' => [
                    'user' => auth()->user()
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('TravelController show error: ' . $e->getMessage());
            abort(500, 'Unable to load travel information');
        }
    }
}