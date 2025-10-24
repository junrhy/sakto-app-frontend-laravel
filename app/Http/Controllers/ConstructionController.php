<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ConstructionController extends Controller
{
    /**
     * Display the construction landing page.
     */
    public function index()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Construction/Index');
    }
}

