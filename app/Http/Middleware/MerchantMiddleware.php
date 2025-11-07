<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class MerchantMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('merchant.login');
        }

        $user = Auth::user();

        if (!$user->isMerchant()) {
            Auth::logout();

            return redirect()->route('merchant.login')->withErrors([
                'email' => 'You do not have permission to access this area.',
            ]);
        }

        return $next($request);
    }
}
