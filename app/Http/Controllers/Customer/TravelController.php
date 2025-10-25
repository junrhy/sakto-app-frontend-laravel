<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TravelController extends Controller
{
    /**
     * Display a listing of travel providers.
     */
    public function index(Request $request): Response
    {
        // Check if user is logged in and has travel project_identifier
        if (!auth()->check() || auth()->user()->project_identifier !== 'travel') {
            abort(403, 'Unauthorized access');
        }

        // Get all travel users with user_type = 'user'
        $travelProviders = User::where('project_identifier', 'travel')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        return Inertia::render('Customer/Travel/Index', [
            'travel' => $travelProviders,
        ]);
    }
}

