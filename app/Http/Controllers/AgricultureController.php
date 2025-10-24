<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AgricultureController extends Controller
{
    /**
     * Display the agriculture landing page.
     */
    public function index()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Agriculture/Index');
    }
}

