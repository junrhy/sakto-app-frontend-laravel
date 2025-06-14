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
            'auth' => [
                'user' => [
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'identifier' => auth()->user()->identifier,
                    'app_currency' => $appCurrency,
                    'credits' => auth()->user()->credits,
                    'is_admin' => auth()->user()->is_admin,
                    'project_identifier' => auth()->user()->project_identifier,
                    'theme' => auth()->user()->theme,
                    'theme_color' => auth()->user()->theme_color,
                ],
                'modules' => $project ? $project->enabledModules : []
            ],
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