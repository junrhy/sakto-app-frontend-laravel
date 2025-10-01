<?php

use App\Http\Controllers\PublicController;
use Illuminate\Http\Request;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for public pages and home redirects.
|
*/

// Public Pages
Route::get('/public', [PublicController::class, 'index'])->name('public');
Route::get('/neulify', [PublicController::class, 'neulify'])->name('neulify');
Route::get('/shop', [PublicController::class, 'shop'])->name('shop');
Route::get('/delivery', [PublicController::class, 'delivery'])->name('delivery');
Route::get('/jobs', [PublicController::class, 'jobs'])->name('jobs');
Route::get('/medical', [PublicController::class, 'medical'])->name('medical');
Route::get('/travel', [PublicController::class, 'travel'])->name('travel');

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
    return redirect()->route('public');
});
