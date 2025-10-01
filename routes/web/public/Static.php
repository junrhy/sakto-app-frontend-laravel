<?php

use App\Models\User;
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
    return Inertia::render('Landing/Pricing');
})->name('pricing');

// Policy Routes
Route::prefix('policies')->group(function () {
    Route::get('/privacy', function () {
        return Inertia::render('Policies/Privacy');
    })->name('policies.privacy');
    
    Route::get('/terms', function () {
        return Inertia::render('Policies/Terms');
    })->name('policies.terms');
    
    Route::get('/cookies', function () {
        return Inertia::render('Policies/Cookies');
    })->name('policies.cookies');
    
    Route::get('/refund', function () {
        return Inertia::render('Policies/Refund');
    })->name('policies.refund');
    
    Route::get('/shipping', function () {
        return Inertia::render('Policies/Shipping');
    })->name('policies.shipping');
    
    Route::get('/returns', function () {
        return Inertia::render('Policies/Returns');
    })->name('policies.returns');
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

