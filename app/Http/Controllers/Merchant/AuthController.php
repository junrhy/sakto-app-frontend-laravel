<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Show the merchant login form.
     */
    public function showLoginForm(Request $request)
    {
        $projectParam = $request->query('project');

        return Inertia::render('Merchant/Auth/Login', [
            'projectParam' => $projectParam,
        ]);
    }

    /**
     * Handle a merchant login request.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();

            $user = Auth::user();

            if (!$user->isMerchant()) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors([
                    'email' => 'You do not have permission to access the merchant portal.',
                ]);
            }

            return redirect()->intended(route('merchant.dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    /**
     * Log the merchant out of the application.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('merchant.login');
    }
}
