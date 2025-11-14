<?php

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Static Public Routes
|--------------------------------------------------------------------------
|
| Static routes that don't belong to specific controllers including
| policies, static pages, and utility routes.
|
*/

// Static Pages
Route::get('/pricing', function () {
    return Inertia::render('Public/Pricing');
})->name('pricing');

Route::get('/features', function () {
    return Inertia::render('Public/Features');
})->name('features');

// Policy Routes
Route::prefix('policies')->group(function () {
    Route::get('/privacy', function (Request $request) { 
        $hostname = $request->getHost();
        $subdomain = explode('.', $hostname)[0];
        $appName = $subdomain !== $hostname ? ucfirst(str_replace('-', ' ', $subdomain)) : ucfirst($hostname);
        return Inertia::render('Policies/PrivacyPolicy', [
            'hostname' => $appName
        ]); 
    })->name('privacy-policy');
    
    Route::get('/terms', function (Request $request) { 
        $hostname = $request->getHost();
        $subdomain = explode('.', $hostname)[0];
        $appName = $subdomain !== $hostname ? ucfirst(str_replace('-', ' ', $subdomain)) : ucfirst($hostname);
        return Inertia::render('Policies/TermsAndConditions', [
            'hostname' => $appName
        ]); 
    })->name('terms-and-conditions');
    
    Route::get('/cookies', function (Request $request) { 
        $hostname = $request->getHost();
        $subdomain = explode('.', $hostname)[0];
        $appName = $subdomain !== $hostname ? ucfirst(str_replace('-', ' ', $subdomain)) : ucfirst($hostname);
        return Inertia::render('Policies/CookiePolicy', [
            'hostname' => $appName
        ]); 
    })->name('cookie-policy');
    
    Route::get('/faq', function (Request $request) { 
        $hostname = $request->getHost();
        $subdomain = explode('.', $hostname)[0];
        $appName = $subdomain !== $hostname ? ucfirst(str_replace('-', ' ', $subdomain)) : ucfirst($hostname);
        return Inertia::render('Policies/FAQ', [
            'hostname' => $appName
        ]); 
    })->name('faq');
});


// Manifest Route
Route::get('/manifest.json', function (Request $request) {
    $startParam = $request->query('start', '/');
    $normalizedStart = Str::start($startParam, '/');
    $schemeHost = rtrim($request->getSchemeAndHttpHost(), '/');

    $manifest = [
        'name' => config('app.name', 'Neulify'),
        'short_name' => 'Neulify',
        'description' => 'Neulify is a digital solution provider for businesses and individuals.',
        'start_url' => $schemeHost . $normalizedStart,
        'scope' => $schemeHost . '/',
        'display' => 'standalone',
        'background_color' => '#ffffff',
        'theme_color' => '#ffffff',
        'icons' => [
            [
                'src' => asset('images/neulify-logo-app-icon.png'),
                'sizes' => '192x192',
                'type' => 'image/png',
                'purpose' => 'any maskable',
            ],
            [
                'src' => asset('images/neulify-logo-app-icon.png'),
                'sizes' => '512x512',
                'type' => 'image/png',
                'purpose' => 'any maskable',
            ],
        ],
    ];

    return response()->json($manifest);
})->name('manifest');

// Debug and utility routes
Route::get('/debug-auth', function () {
    return response()->json([
        'authenticated' => auth()->check(),
        'user' => auth()->user(),
        'session' => session()->all(),
        'headers' => request()->headers->all()
    ]);
})->name('debug.auth');

