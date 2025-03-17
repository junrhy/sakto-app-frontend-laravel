<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Setting;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class MaintenanceModeMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if maintenance mode is enabled
        $maintenanceMode = Setting::get('maintenance_mode', 'false');
        
        if ($maintenanceMode === 'true') {
            // Allow admins to bypass maintenance mode
            if (Auth::check() && Auth::user()->is_admin) {
                return $next($request);
            }
            
            // Skip maintenance mode for login and admin routes
            if ($request->is('login') || $request->is('admin/login') || $request->is('admin/logout')) {
                return $next($request);
            }
            
            // Get maintenance message
            $maintenanceMessage = Setting::get('maintenance_message', 'The site is currently undergoing scheduled maintenance. Please check back soon.');
            
            // Return maintenance page
            return Inertia::render('Maintenance', [
                'message' => $maintenanceMessage
            ])->toResponse($request)->setStatusCode(503);
        }
        
        return $next($request);
    }
}
