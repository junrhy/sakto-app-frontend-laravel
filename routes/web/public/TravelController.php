<?php

use App\Http\Controllers\TravelController;

/*
|--------------------------------------------------------------------------
| Travel Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for travel functionality.
|
*/

// Business Landing Pages
Route::get('/travel/page/{identifier}', [TravelController::class, 'show'])
    ->name('travel.show');
