<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class JobsController extends Controller
{
    public function show($identifier)
    {
        try {
            // Check if identifier is numeric (ID) or string (slug)
            $jobs = null;
            
            if (is_numeric($identifier)) {
                // Search by ID
                $jobs = \App\Models\User::where('project_identifier', 'jobs')
                    ->where('id', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            } else {
                // Search by slug
                $jobs = \App\Models\User::where('project_identifier', 'jobs')
                    ->where('slug', $identifier)
                    ->select('id', 'name', 'email', 'contact_number', 'app_currency', 'created_at', 'identifier', 'slug')
                    ->first();
            }

            if (!$jobs) {
                abort(404, 'Jobs service not found');
            }

            return Inertia::render('Landing/Jobs/Show', [
                'jobsService' => $jobs,
                'identifier' => $identifier,
                'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
                'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
                'auth' => [
                    'user' => auth()->user()
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('JobsController show error: ' . $e->getMessage());
            abort(500, 'Unable to load jobs information');
        }
    }
}