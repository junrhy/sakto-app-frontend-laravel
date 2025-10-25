<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EducationController extends Controller
{
    /**
     * Display a listing of education providers.
     */
    public function index(Request $request): Response
    {
        // Check if user is logged in and has education project_identifier
        if (!auth()->check() || auth()->user()->project_identifier !== 'education') {
            abort(403, 'Unauthorized access');
        }

        // Get all education users with user_type = 'user'
        $educationProviders = User::where('project_identifier', 'education')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        return Inertia::render('Customer/Education/Index', [
            'education' => $educationProviders,
        ]);
    }
}

