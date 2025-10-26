<?php

use App\Http\Controllers\FlightController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Flight Routes
|--------------------------------------------------------------------------
|
| Routes for flight search and management functionality.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // Flight search
    Route::get('/flight-search', [FlightController::class, 'index'])->name('flight-search');
    Route::get('/flights', [FlightController::class, 'index'])->name('flights');
    Route::get('/api/flights/search-airports', [FlightController::class, 'searchAirports']);
    Route::get('/api/flights/search', [FlightController::class, 'search']);
});
