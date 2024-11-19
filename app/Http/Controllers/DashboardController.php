<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Dashboard;
use App\Models\Widget;
class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if (!$request->app) {
            return abort(404);
        }

        $user = auth()->user();
        $dashboards = Dashboard::where('user_id', $user->id)->get();
        $currentDashboard = Dashboard::where('user_id', $user->id)->where('is_default', true)->where('app', $request->app)->first();
        $currentDashboard->widgets = Widget::where('dashboard_id', $currentDashboard->id)->get();
        
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
    public function update(Request $request, Dashboard $dashboard)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'column_count' => 'sometimes|integer|in:1,2,3',
            'is_starred' => 'sometimes|boolean',
            'app' => 'sometimes|string',
            // ... other validation rules
        ]);

        $dashboard->update($validated);

        return redirect()->back()->with('dashboard', $dashboard);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Get widgets for a specific dashboard
     */
    public function getWidgets(Dashboard $dashboard)
    {
        // Ensure the user owns this dashboard
        if ($dashboard->user_id !== auth()->id()) {
            abort(403);
        }

        // Eager load fresh widget data
        $dashboard->load('widgets');

        // Return data using Inertia
        return Inertia::render('Dashboard', [
            'dashboards' => Dashboard::where('user_id', auth()->id())->get(),
            'currentDashboard' => $dashboard,
        ]);
    }
}