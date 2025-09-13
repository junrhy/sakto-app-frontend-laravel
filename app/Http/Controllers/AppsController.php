<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\Module;
use App\Models\UserApp;

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
        
        // Get user-added apps
        $userAddedApps = UserApp::forUser(auth()->user()->identifier)
            ->pluck('module_identifier')
            ->toArray();
        
        // Get ALL apps from database (not just active ones)
        $apps = Module::ordered()
            ->get()
            ->map(function ($module) use ($enabledModules, $userAddedApps) {
                $isInSubscription = in_array($module->identifier, $enabledModules);
                $isUserAdded = in_array($module->identifier, $userAddedApps);
                
                return [
                    'id' => $module->id,
                    'identifier' => $module->identifier,
                    'title' => $module->title,
                    'route' => $module->route,
                    'visible' => $module->visible,
                    'description' => $module->description,
                    'price' => (float) $module->price, // Ensure price is returned as float for frontend
                    'categories' => $module->categories,
                    'comingSoon' => $module->coming_soon,
                    'pricingType' => $module->pricing_type,
                    'includedInPlans' => $module->included_in_plans,
                    'bgColor' => $module->bg_color,
                    'icon' => $module->icon,
                    'rating' => (float) $module->rating, // Ensure rating is also returned as float
                    'isInSubscription' => $isInSubscription,
                    'isUserAdded' => $isUserAdded,
                    'isAvailable' => $isInSubscription || $isUserAdded,
                ];
            })
            ->toArray();
        
        return response()->json([
            'apps' => $apps,
            'enabledModules' => $enabledModules,
            'userAddedApps' => $userAddedApps
        ]);
    }

    public function addApp(Request $request)
    {
        $validated = $request->validate([
            'module_identifier' => 'required|string|exists:modules,identifier'
        ]);

        $userIdentifier = auth()->user()->identifier;
        $moduleIdentifier = $validated['module_identifier'];

        // Get the module to check if it exists and get its details
        $module = Module::where('identifier', $moduleIdentifier)->first();
        
        if (!$module) {
            return response()->json([
                'message' => 'Module not found'
            ], 404);
        }

        // Check if user already has this app
        $existingUserApp = UserApp::forUser($userIdentifier)
            ->forModule($moduleIdentifier)
            ->first();

        if ($existingUserApp) {
            return response()->json([
                'message' => 'App already added to your collection'
            ], 400);
        }

        // Check if the app is coming soon
        if ($module->coming_soon) {
            return response()->json([
                'message' => 'This app is coming soon and cannot be added yet'
            ], 400);
        }

        // Add the app to user's collection
        UserApp::create([
            'user_identifier' => $userIdentifier,
            'module_identifier' => $moduleIdentifier
        ]);

        return response()->json([
            'message' => 'App added successfully',
            'app' => [
                'title' => $module->title,
                'price' => (float) $module->price,
                'pricingType' => $module->pricing_type
            ]
        ]);
    }

    public function removeApp(Request $request)
    {
        $validated = $request->validate([
            'module_identifier' => 'required|string|exists:modules,identifier'
        ]);

        $userIdentifier = auth()->user()->identifier;
        $moduleIdentifier = $validated['module_identifier'];

        // Get the module to return its details
        $module = Module::where('identifier', $moduleIdentifier)->first();

        // Remove the app from user's collection
        $deleted = UserApp::forUser($userIdentifier)
            ->forModule($moduleIdentifier)
            ->delete();

        if ($deleted) {
            return response()->json([
                'message' => 'App removed successfully',
                'app' => $module ? [
                    'title' => $module->title,
                    'price' => (float) $module->price,
                    'pricingType' => $module->pricing_type
                ] : null
            ]);
        } else {
            return response()->json([
                'message' => 'App not found in your collection'
            ], 404);
        }
    }
} 