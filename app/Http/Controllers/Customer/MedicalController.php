<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MedicalController extends Controller
{
    /**
     * Display a listing of medical providers.
     */
    public function index(Request $request): Response
    {
        // Check if user is logged in and has medical project_identifier
        if (!auth()->check() || auth()->user()->project_identifier !== 'medical') {
            abort(403, 'Unauthorized access');
        }

        // Get all medical users with user_type = 'user'
        $medicalProviders = User::where('project_identifier', 'medical')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        return Inertia::render('Customer/Medical/Index', [
            'medical' => $medicalProviders,
        ]);
    }
}

