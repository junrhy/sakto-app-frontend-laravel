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
        $user = auth()->user();
        $dashboards = Dashboard::where('user_id', $user->id)->get();
        $currentDashboard = $dashboards->first() ?? Dashboard::create([
            'user_id' => $user->id,
            'name' => 'Main Dashboard',
            'widgets' => [],
        ]);

        return Inertia::render('Dashboard', [
            'dashboards' => $dashboards,
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