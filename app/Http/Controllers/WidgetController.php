<?php

namespace App\Http\Controllers;

use App\Models\Widget;
use Illuminate\Http\Request;
use Inertia\Inertia;


class WidgetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        $widgets = $user->currentDashboard->widgets;
        return Inertia::render('Dashboard', [
            'widgets' => $widgets
        ]); 
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'column' => 'required|integer',
            'dashboard_id' => 'required|exists:dashboards,id'
        ]);

        $widget = Widget::create($validated);

        // Return just the widget data as a partial response
        return back()->with([
            'widget' => $widget
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Widget $widget)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Widget $widget)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Widget $widget)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Widget $widget)
    {
        //
    }
}
