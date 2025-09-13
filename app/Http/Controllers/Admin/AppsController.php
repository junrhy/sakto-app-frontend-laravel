<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;

class AppsController extends Controller
{
    public function index()
    {
        $apps = Module::active()
            ->ordered()
            ->get()
            ->map(function ($module) {
                return [
                    'id' => $module->id,
                    'title' => $module->title,
                    'route' => $module->route,
                    'visible' => $module->visible,
                    'description' => $module->description,
                    'price' => $module->price,
                    'categories' => $module->categories,
                    'comingSoon' => $module->coming_soon,
                    'pricingType' => $module->pricing_type,
                    'includedInPlans' => $module->included_in_plans,
                    'bgColor' => $module->bg_color,
                    'icon' => $module->icon,
                    'rating' => $module->rating,
                    'order' => $module->order,
                ];
            })
            ->toArray();
        
        return Inertia::render('Admin/Apps/Index', [
            'apps' => $apps
        ]);
    }

    public function create()
    {
        $subscriptionPlans = SubscriptionPlan::where('is_active', true)
            ->with('project:id,name,identifier')
            ->orderBy('price')
            ->get(['id', 'name', 'slug', 'price', 'duration_in_days', 'project_id']);
            
        return Inertia::render('Admin/Apps/Create', [
            'subscriptionPlans' => $subscriptionPlans
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'route' => 'required|string|max:255',
            'visible' => 'boolean',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'categories' => 'required|array',
            'categories.*' => 'string',
            'comingSoon' => 'boolean',
            'pricingType' => 'required|in:free,one-time,subscription',
            'includedInPlans' => 'array',
            'includedInPlans.*' => 'string',
            'bgColor' => 'required|string',
            'icon' => 'nullable|string|max:255',
            'rating' => 'required|numeric|min:0|max:5',
        ]);

        // Generate identifier from title
        $identifier = strtolower(str_replace([' ', '&', '-'], ['-', 'and', '-'], $validated['title']));
        
        // Get the next order value
        $maxOrder = Module::max('order') ?? 0;
        
        Module::create([
            'name' => $validated['title'],
            'identifier' => $identifier,
            'title' => $validated['title'],
            'route' => $validated['route'],
            'visible' => $validated['visible'] ?? false,
            'description' => $validated['description'],
            'price' => $validated['price'],
            'categories' => $validated['categories'],
            'coming_soon' => $validated['comingSoon'] ?? false,
            'pricing_type' => $validated['pricingType'],
            'included_in_plans' => $validated['includedInPlans'] ?? [],
            'bg_color' => $validated['bgColor'],
            'icon' => $validated['icon'] ?? 'default',
            'rating' => $validated['rating'],
            'order' => $maxOrder + 1,
            'is_active' => true
        ]);
        
        return redirect()->route('admin.apps.index')
            ->with('success', 'App created successfully.');
    }

    public function edit($id)
    {
        $module = Module::find($id);
        
        if (!$module) {
            return redirect()->route('admin.apps.index')
                ->with('error', 'App not found.');
        }
        
        $subscriptionPlans = SubscriptionPlan::where('is_active', true)
            ->with('project:id,name,identifier')
            ->orderBy('price')
            ->get(['id', 'name', 'slug', 'price', 'duration_in_days', 'project_id']);
        
        $app = [
            'id' => $module->id,
            'title' => $module->title,
            'route' => $module->route,
            'visible' => $module->visible,
            'description' => $module->description,
            'price' => $module->price,
            'categories' => $module->categories,
            'comingSoon' => $module->coming_soon,
            'pricingType' => $module->pricing_type,
            'includedInPlans' => $module->included_in_plans,
            'bgColor' => $module->bg_color,
            'icon' => $module->icon,
            'rating' => $module->rating,
            'order' => $module->order,
        ];
        
        return Inertia::render('Admin/Apps/Edit', [
            'app' => $app,
            'subscriptionPlans' => $subscriptionPlans
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'route' => 'required|string|max:255',
            'visible' => 'boolean',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'categories' => 'required|array',
            'categories.*' => 'string',
            'comingSoon' => 'boolean',
            'pricingType' => 'required|in:free,one-time,subscription',
            'includedInPlans' => 'array',
            'includedInPlans.*' => 'string',
            'bgColor' => 'required|string',
            'icon' => 'nullable|string|max:255',
            'rating' => 'required|numeric|min:0|max:5',
        ]);

        $module = Module::find($id);
        
        if (!$module) {
            return redirect()->route('admin.apps.index')
                ->with('error', 'App not found.');
        }
        
        // Generate identifier from title if it changed
        $identifier = strtolower(str_replace([' ', '&', '-'], ['-', 'and', '-'], $validated['title']));
        
        $module->update([
            'name' => $validated['title'],
            'identifier' => $identifier,
            'title' => $validated['title'],
            'route' => $validated['route'],
            'visible' => $validated['visible'] ?? false,
            'description' => $validated['description'],
            'price' => $validated['price'],
            'categories' => $validated['categories'],
            'coming_soon' => $validated['comingSoon'] ?? false,
            'pricing_type' => $validated['pricingType'],
            'included_in_plans' => $validated['includedInPlans'] ?? [],
            'bg_color' => $validated['bgColor'],
            'icon' => $validated['icon'] ?? $module->icon ?? 'default',
            'rating' => $validated['rating'],
        ]);
        
        return redirect()->route('admin.apps.index')
            ->with('success', 'App updated successfully.');
    }

    public function destroy($id)
    {
        $module = Module::find($id);
        
        if (!$module) {
            return redirect()->route('admin.apps.index')
                ->with('error', 'App not found.');
        }
        
        $module->delete();
        
        return redirect()->route('admin.apps.index')
            ->with('success', 'App deleted successfully.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|min:1',
        ]);

        foreach ($validated['order'] as $newOrder => $moduleId) {
            Module::where('id', $moduleId)->update(['order' => $newOrder + 1]);
        }
        
        return response()->json(['success' => true]);
    }

}
