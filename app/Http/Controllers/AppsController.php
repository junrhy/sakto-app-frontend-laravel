<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\Module;

class AppsController extends Controller
{
    public function index()
    {
        $appCurrency = json_decode(auth()->user()->app_currency);
        $project = Project::where('identifier', auth()->user()->project_identifier)->first();

        // Ensure enabledModules is properly cast as array
        $enabledModules = [];
        if ($project) {
            $enabledModules = is_array($project->enabledModules) 
                ? $project->enabledModules 
                : (is_string($project->enabledModules) ? json_decode($project->enabledModules, true) : []);
        }

        return Inertia::render('Apps', [
            'enabledModules' => $enabledModules
        ]);
    }

    public function getApps()
    {
        $project = Project::where('identifier', auth()->user()->project_identifier)->first();
        
        // Ensure enabledModules is properly cast as array
        $enabledModules = [];
        if ($project) {
            $enabledModules = is_array($project->enabledModules) 
                ? $project->enabledModules 
                : (is_string($project->enabledModules) ? json_decode($project->enabledModules, true) : []);
        }
        
        // Get apps from database instead of config
        $apps = Module::active()
            ->ordered()
            ->get()
            ->map(function ($module) {
                return [
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
                ];
            })
            ->toArray();
        
        return response()->json([
            'apps' => $apps,
            'enabledModules' => $enabledModules
        ]);
    }
} 