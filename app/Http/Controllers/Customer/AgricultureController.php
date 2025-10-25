<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgricultureController extends Controller
{
    /**
     * Display a listing of agriculture providers.
     */
    public function index(Request $request): Response
    {
        // Check if user is logged in and has agriculture project_identifier
        if (!auth()->check() || auth()->user()->project_identifier !== 'agriculture') {
            abort(403, 'Unauthorized access');
        }

        // Get all agriculture users with user_type = 'user'
        $agricultureProviders = User::where('project_identifier', 'agriculture')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        return Inertia::render('Customer/Agriculture/Index', [
            'agriculture' => $agricultureProviders,
        ]);
    }
}

