<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogisticsController extends Controller
{
    /**
     * Display a listing of logistics providers.
     */
    public function index(Request $request): Response
    {
        // Check if user is logged in and has logistics project_identifier
        if (!auth()->check() || auth()->user()->project_identifier !== 'logistics') {
            abort(403, 'Unauthorized access');
        }

        // Get all logistics users with user_type = 'user'
        $logisticsProviders = User::where('project_identifier', 'logistics')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        return Inertia::render('Customer/Logistics/Index', [
            'logistics' => $logisticsProviders,
        ]);
    }
}

