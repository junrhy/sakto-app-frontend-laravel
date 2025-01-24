<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Models\Dashboard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Auth\Events\Registered;
use Inertia\Inertia;
use Inertia\Response;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                Auth::login($user);
                return redirect()->intended(route('home', absolute: false));
            }

            $projects = Project::select('identifier', 'name')->get();
            
            return Inertia::render('Auth/SelectProject', [
                'projects' => $projects,
                'googleUser' => [
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                ]
            ]);

        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Google authentication failed');
        }
    }

    public function register()
    {
        request()->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'google_id' => 'required|string',
            'project_identifier' => 'required|string|exists:projects,identifier',
        ]);

        $user = User::create([
            'name' => request('name'),
            'email' => request('email'),
            'google_id' => request('google_id'),
            'project_identifier' => request('project_identifier'),
            'password' => Hash::make(str()->random(32)),
        ]);

        event(new Registered($user));

        // Create a default dashboard for the user
        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => $user->id,
            'is_default' => true,
        ]);

        Auth::login($user);

        return redirect()->intended(route('home', absolute: false));
    }
} 