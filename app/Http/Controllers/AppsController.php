<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Project;

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
        
        return response()->json([
            'apps' => config('apps'),
            'enabledModules' => $enabledModules
        ]);
    }
} 