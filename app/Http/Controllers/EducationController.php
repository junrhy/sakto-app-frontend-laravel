<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class EducationController extends Controller
{
    /**
     * Display the education landing page.
     */
    public function index()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Education/Index');
    }
}

