<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserType
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$types): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        $allowedTypes = collect($types)
            ->flatMap(function (string $value) {
                return array_map(
                    static fn (string $item) => strtolower(trim($item)),
                    explode(',', $value),
                );
            })
            ->filter()
            ->values()
            ->all();

        if (empty($allowedTypes)) {
            throw new \InvalidArgumentException('EnsureUserType middleware requires at least one user type.');
        }

        $userType = strtolower((string) $user->user_type);

        if (!in_array($userType, $allowedTypes, true)) {
            abort(403, 'You do not have permission to access this area.');
        }

        return $next($request);
    }
}


