<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredEmployeeController extends Controller
{
    /**
     * Display the employee registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Employee/Auth/Register');
    }

    /**
     * Handle an incoming employee registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'project_identifier' => $request->input('project_identifier', 'employee'),
            'user_type' => 'employee',
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('employee.dashboard');
    }
}
