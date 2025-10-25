<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use App\Models\UserCustomer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the customer dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Get user's primary address
        $address = UserAddress::where('user_id', $user->id)
            ->where('is_primary', true)
            ->first();
        
        // Get businesses this customer is connected to
        $connectedBusinesses = $user->businesses()
            ->with('business')
            ->where('is_active', true)
            ->get();
        
        return Inertia::render('Customer/Dashboard', [
            'address' => $address,
            'connectedBusinesses' => $connectedBusinesses,
        ]);
    }
}

