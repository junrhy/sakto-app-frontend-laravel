<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobsController extends Controller
{
    /**
     * Display a listing of job providers.
     */
    public function index(Request $request): Response
    {
        // Check if user is logged in and has jobs project_identifier
        if (!auth()->check() || auth()->user()->project_identifier !== 'jobs') {
            abort(403, 'Unauthorized access');
        }

        // Get all jobs users with user_type = 'user'
        $jobProviders = User::where('project_identifier', 'jobs')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        return Inertia::render('Customer/Jobs/Index', [
            'jobs' => $jobProviders,
        ]);
    }
}

