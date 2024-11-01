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
        $widgets = Widget::where('user_id', $user->id)->orderBy('id', 'desc')->get();
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
            'dashboard_id' => 'required|integer'
        ]);

        $validated['user_id'] = auth()->user()->id;
        
        $maxOrder = Widget::where('dashboard_id', $validated['dashboard_id'])
            ->where('column', $validated['column'])
            ->max('order');
        
        $validated['order'] = is_null($maxOrder) ? 0 : $maxOrder + 1;
        
        $widget = Widget::create($validated);
        
        return redirect()->back()->with('widget', $widget);
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
        $validated = $request->validate([
            'column' => 'required|integer|min:0',
        ]);

        try {
            $widget->update($validated);
            return redirect()->back()->with('widget', $widget);
        } catch (\Exception $e) {
            return redirect()->back();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Widget $widget)
    {
        $widget->delete();
        return redirect()->back();
    }

    public function reorder(Request $request, Widget $widget)
    {
        $request->validate([
            'direction' => ['required', 'in:up,down']
        ]);

        try {
            \DB::beginTransaction();

            $success = $request->direction === 'up' 
                ? $widget->moveUp() 
                : $widget->moveDown();

            if (!$success) {
                throw new \Exception('Could not move widget ' . $request->direction);
            }

            \DB::commit();

            // Return redirect with the dashboard ID to ensure proper state refresh
            return redirect()->back()->with('dashboard.id', $widget->dashboard_id);

        } catch (\Exception $e) {
            \DB::rollBack();
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}
