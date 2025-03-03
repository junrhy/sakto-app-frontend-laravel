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
        
        return Inertia::render('Dashboard/Index', [
            'dashboards' => $dashboards,
            'currentDashboard' => $currentDashboard,
        ]);
    }

    /**
     * Display the dashboard gallery page.
     */
    public function gallery(Request $request)
    {
        if (!$request->app) {
            return abort(404);
        }

        $user = auth()->user();
        $dashboards = Dashboard::where('user_id', $user->id)
            ->where('app', $request->app)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->withCount('widgets')
            ->get();

        // Process widget types separately to avoid null relationship issues
        $dashboards = $dashboards->map(function ($dashboard) {
            // Get widget types for this dashboard
            $widgetTypes = Widget::where('dashboard_id', $dashboard->id)
                ->select('type')
                ->get()
                ->pluck('type')
                ->countBy();

            $dashboard->widget_types = $widgetTypes;
            return $dashboard;
        });
        
        return Inertia::render('Dashboard/Gallery', [
            'dashboards' => $dashboards,
            'app' => $request->app
        ]);
    }

    /**
     * Set a dashboard as default for the app.
     */
    public function setDefault(Request $request, Dashboard $dashboard)
    {
        // First remove default status from all other dashboards for this app
        Dashboard::where('user_id', auth()->id())
            ->where('app', $dashboard->app)
            ->where('id', '!=', $dashboard->id)
            ->update(['is_default' => false]);

        // Set this dashboard as default
        $dashboard->update(['is_default' => true]);

        return redirect()->back()->with('message', 'Default dashboard updated successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'app' => 'required|string'
        ]);

        $dashboard = Dashboard::create([
            'name' => $validated['name'],
            'app' => $validated['app'],
            'user_id' => auth()->id(),
            'column_count' => 2, // Default to 2 columns
            'is_starred' => false,
            'is_default' => false // New dashboards are not default by default
        ]);

        return redirect()->back()->with('message', 'Dashboard created successfully');
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
    public function destroy(Dashboard $dashboard)
    {
        // Ensure the user owns this dashboard
        if ($dashboard->user_id !== auth()->id()) {
            abort(403);
        }

        // Don't allow deleting the default dashboard
        if ($dashboard->is_default) {
            return redirect()->back()->with('error', 'Cannot delete the default dashboard');
        }

        // Delete associated widgets first
        $dashboard->widgets()->delete();
        
        // Delete the dashboard
        $dashboard->delete();

        return redirect()->back()->with('message', 'Dashboard deleted successfully');
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
        return Inertia::render('Dashboard/Index', [
            'dashboards' => Dashboard::where('user_id', auth()->id())->get(),
            'currentDashboard' => $dashboard,
        ]);
    }

    /**
     * Toggle the starred status of a dashboard
     */
    public function toggleStar(Dashboard $dashboard)
    {
        // Ensure the user owns this dashboard
        if ($dashboard->user_id !== auth()->id()) {
            abort(403);
        }

        $dashboard->update([
            'is_starred' => !$dashboard->is_starred
        ]);

        return redirect()->back()->with('message', $dashboard->is_starred ? 'Dashboard starred' : 'Dashboard unstarred');
    }
}