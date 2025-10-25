<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FnbController extends Controller
{
    /**
     * Display a listing of F&B providers.
     */
    public function index(Request $request): Response
    {
        // Check if user is logged in and has fnb project_identifier
        if (!auth()->check() || auth()->user()->project_identifier !== 'fnb') {
            abort(403, 'Unauthorized access');
        }

        // Get all fnb users with user_type = 'user'
        $fnbProviders = User::where('project_identifier', 'fnb')
            ->where('user_type', 'user')
            ->select('id', 'name', 'email', 'contact_number', 'created_at', 'slug', 'identifier')
            ->latest()
            ->get();

        return Inertia::render('Customer/Fnb/Index', [
            'fnb' => $fnbProviders,
        ]);
    }
}

