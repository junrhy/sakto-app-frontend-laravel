<?php

use App\Models\User;
use Illuminate\Http\Request;
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
    return Inertia::render('Pricing');
})->name('pricing');

Route::get('/features', function () {
    return Inertia::render('Features');
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


// Manifest Routes
Route::get('/manifest/member/{identifier}.json', function ($identifier) {
    try {
        $user = User::where('project_identifier', 'community')
            ->where('identifier', $identifier)
            ->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $manifest = [
            'name' => $user->name . ' - Sakto Member',
            'short_name' => $user->name,
            'description' => 'Member profile for ' . $user->name,
            'start_url' => '/m/' . $user->identifier,
            'display' => 'standalone',
            'background_color' => '#ffffff',
            'theme_color' => '#000000',
            'icons' => [
                [
                    'src' => '/images/icon-192x192.png',
                    'sizes' => '192x192',
                    'type' => 'image/png'
                ],
                [
                    'src' => '/images/icon-512x512.png',
                    'sizes' => '512x512',
                    'type' => 'image/png'
                ]
            ]
        ];

        return response()->json($manifest);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to generate manifest'], 500);
    }
})->name('manifest.member');

// Content Creator Manifest
Route::get('/manifest/content/{slug}.json', function ($slug) {
    try {
        $manifest = [
            'name' => 'Content Creator - Sakto',
            'short_name' => 'Content Creator',
            'description' => 'Content creator profile',
            'start_url' => '/post/' . $slug,
            'display' => 'standalone',
            'background_color' => '#ffffff',
            'theme_color' => '#000000',
            'icons' => [
                [
                    'src' => '/images/icon-192x192.png',
                    'sizes' => '192x192',
                    'type' => 'image/png'
                ],
                [
                    'src' => '/images/icon-512x512.png',
                    'sizes' => '512x512',
                    'type' => 'image/png'
                ]
            ]
        ];

        return response()->json($manifest);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to generate manifest'], 500);
    }
})->name('manifest.content');

// Debug and utility routes
Route::get('/debug-auth', function () {
    return response()->json([
        'authenticated' => auth()->check(),
        'user' => auth()->user(),
        'session' => session()->all(),
        'headers' => request()->headers->all()
    ]);
})->name('debug.auth');

