<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    /**
     * Display the finance landing page.
     */
    public function index()
    {
        // Redirect authenticated users to home
        if (auth()->check()) {
            return redirect()->route('home');
        }

        return Inertia::render('Public/Finance/Index');
    }
}

