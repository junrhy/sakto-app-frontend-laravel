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
        return Inertia::render('Public/Agriculture/Index');
    }
}

