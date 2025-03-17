<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;

class IpRestrictionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply to admin routes
        if (strpos($request->path(), 'admin') === 0) {
            // Check if IP restriction is enabled
            $ipRestrictionEnabled = Setting::get('ip_restriction_enabled', 'false');
            
            if ($ipRestrictionEnabled === 'true') {
                // Get allowed IPs
                $allowedIps = Setting::get('allowed_ips', '');
                
                if (!empty($allowedIps)) {
                    $allowedIpArray = array_map('trim', explode(',', $allowedIps));
                    $clientIp = $request->ip();
                    
                    // Check if client IP is in the allowed list
                    if (!in_array($clientIp, $allowedIpArray)) {
                        // If user is already logged in, log them out
                        if (Auth::check()) {
                            Auth::logout();
                            $request->session()->invalidate();
                            $request->session()->regenerateToken();
                        }
                        
                        abort(403, 'Access denied. Your IP address is not authorized to access the admin area.');
                    }
                }
            }
        }
        
        return $next($request);
    }
}
