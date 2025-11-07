<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        $projects = Project::select('identifier', 'name')->get();
        
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'projects' => $projects,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('home', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        // Get project parameter, default to 'public' if not provided or if 'trial'
        $project = $request->input('project');
        
        if (!$project || $project === 'trial') {
            $project = 'public';
        }
        
        // Preserve mobile parameter if present
        $routeParameters = [];
        if ($request->input('mobile') === '1') {
            $routeParameters['mobile'] = '1';
        }

        if (!Route::has($project)) {
            $project = 'public';
        }

        return redirect()->route($project, $routeParameters);
    }
}
