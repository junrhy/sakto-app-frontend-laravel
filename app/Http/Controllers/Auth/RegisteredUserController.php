<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Dashboard;
use App\Models\Project;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $projects = Project::select('identifier', 'name')->get();
        
        return Inertia::render('Auth/Register', [
            'projects' => $projects
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'project_identifier' => 'required|string|exists:projects,identifier',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'project_identifier' => $request->project_identifier,
        ]);

        event(new Registered($user));

        // Create a default dashboard for the user
        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => $user->id,
            'is_default' => true,
        ]); 

        Auth::login($user);

        return redirect(route('home', absolute: false));
    }
}
