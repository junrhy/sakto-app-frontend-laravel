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

        return Inertia::render('Apps', [
            'apps' => config('apps')
        ]);
    }

    public function getApps()
    {
        $project = Project::where('identifier', auth()->user()->project_identifier)->first();
        
        return response()->json([
            'apps' => config('apps'),
            'modules' => $project ? $project->enabledModules : []
        ]);
    }
} 