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
}