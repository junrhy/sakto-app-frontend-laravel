<?php

use App\Http\Controllers\TravelController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Travel Routes
|--------------------------------------------------------------------------
|
| Routes for travel management including travel packages and bookings.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Travel
    Route::prefix('travel')->group(function () {
        Route::get('/packages', [TravelController::class, 'getPackages']);
        Route::post('/packages', [TravelController::class, 'storePackage']);
        Route::put('/packages/{id}', [TravelController::class, 'updatePackage']);
        Route::delete('/packages/{id}', [TravelController::class, 'deletePackage']);
        Route::get('/bookings', [TravelController::class, 'getBookings']);
        Route::post('/bookings', [TravelController::class, 'storeBooking']);
        Route::put('/bookings/{id}', [TravelController::class, 'updateBooking']);
        Route::delete('/bookings/{id}', [TravelController::class, 'deleteBooking']);
    });
});
