<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EmployeeMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('employee.login');
        }

        $user = Auth::user();

        if (!$user->isEmployee()) {
            Auth::logout();

            return redirect()->route('employee.login')->withErrors([
                'email' => 'You do not have permission to access this area.',
            ]);
        }

        return $next($request);
    }
}
