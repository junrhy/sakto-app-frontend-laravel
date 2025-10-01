<?php

use App\Http\Controllers\LandingController;
use Illuminate\Http\Request;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Landing Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for landing pages and home redirects.
|
*/

// Landing Pages
Route::get('/landing', [LandingController::class, 'index'])->name('landing');
Route::get('/neulify', [LandingController::class, 'neulify'])->name('neulify');
Route::get('/shop', [LandingController::class, 'shop'])->name('shop');
Route::get('/delivery', [LandingController::class, 'delivery'])->name('delivery');
Route::get('/jobs', [LandingController::class, 'jobs'])->name('jobs');
Route::get('/medical', [LandingController::class, 'medical'])->name('medical');
Route::get('/landing/travel', [LandingController::class, 'travel'])->name('travel.landing');
Route::get('/landing/delivery', [LandingController::class, 'delivery'])->name('delivery.landing');
Route::get('/landing/jobs', [LandingController::class, 'jobs'])->name('jobs.landing');
Route::get('/landing/shop', [LandingController::class, 'shop'])->name('shop.landing');

// Home Route with Host-based Redirects
Route::get('/', function (Request $request) {
    $host = $request->getHost();
    $path = $request->path();
    
    // Check for shop, delivery, or jobs in host or path
    if (stripos($host, 'shop') !== false || stripos($path, 'shop') !== false) {
        return redirect()->route('shop');   
    } elseif (stripos($host, 'delivery') !== false || stripos($path, 'delivery') !== false) {
        return redirect()->route('delivery');
    } elseif (stripos($host, 'jobs') !== false || stripos($path, 'jobs') !== false) {
        return redirect()->route('jobs');
    } elseif (stripos($host, 'community') !== false || stripos($path, 'community') !== false) {
        return redirect()->route('community');
    } elseif (stripos($host, 'logistics') !== false || stripos($path, 'logistics') !== false) {
        return redirect()->route('logistics');
    }
    
    // Default welcome page
    return redirect()->route('landing');
});
