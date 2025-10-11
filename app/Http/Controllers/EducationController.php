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
        return Inertia::render('Public/Education/Index');
    }
}

