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
        return Inertia::render('Public/Construction/Index');
    }
}

