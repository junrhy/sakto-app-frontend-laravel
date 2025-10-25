<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /**
     * Display a listing of finance providers.
     */
    public function index(Request $request): Response
    {
        // Check if user is logged in and has finance project_identifier
        if (!auth()->check() || auth()->user()->project_identifier !== 'finance') {
            abort(403, 'Unauthorized access');
        }

        // Get all finance users with user_type = 'user'
        $financeProviders = User::where('project_identifier', 'finance')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        return Inertia::render('Customer/Finance/Index', [
            'finance' => $financeProviders,
        ]);
    }
}

