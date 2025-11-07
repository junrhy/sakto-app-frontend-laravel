<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register global middleware
        $middleware->append([
            \App\Http\Middleware\MaintenanceModeMiddleware::class,
        ]);

        // Register route middleware aliases
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'customer' => \App\Http\Middleware\CustomerMiddleware::class,
            'merchant' => \App\Http\Middleware\MerchantMiddleware::class,
            'ip_restriction' => \App\Http\Middleware\IpRestrictionMiddleware::class,
            'team.member.selection' => \App\Http\Middleware\TeamMemberSelectionMiddleware::class,
            'cors' => \App\Http\Middleware\CorsMiddleware::class,
            'premium' => \App\Http\Middleware\RequiresPremiumAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
