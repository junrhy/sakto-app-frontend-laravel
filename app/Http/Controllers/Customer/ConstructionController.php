<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConstructionController extends Controller
{
    /**
     * Display a listing of construction providers.
     */
    public function index(Request $request): Response
    {
        // Check if user is logged in and has construction project_identifier
        if (!auth()->check() || auth()->user()->project_identifier !== 'construction') {
            abort(403, 'Unauthorized access');
        }

        // Get all construction users with user_type = 'user'
        $constructionProviders = User::where('project_identifier', 'construction')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        return Inertia::render('Customer/Construction/Index', [
            'construction' => $constructionProviders,
        ]);
    }
}

