<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Dashboard;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {   
        $currentDashboard = Dashboard::where('user_id', auth()->user()->id)->where('is_default', true)->first();

        return Inertia::render('Dashboard', [
            'currentDashboard' => $currentDashboard,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}