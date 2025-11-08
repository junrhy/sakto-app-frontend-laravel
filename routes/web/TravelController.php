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

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->prefix('travel')->name('travel.')->group(function () {
    // Inertia pages
    Route::get('/', [TravelController::class, 'index'])->name('packages.index');
    Route::get('/bookings', [TravelController::class, 'bookings'])->name('bookings.index');

    // Package management proxies
    Route::get('/packages/list', [TravelController::class, 'getPackages'])->name('packages.list');
    Route::post('/packages', [TravelController::class, 'storePackage'])->name('packages.store');
    Route::put('/packages/{id}', [TravelController::class, 'updatePackage'])->name('packages.update');
    Route::delete('/packages/{id}', [TravelController::class, 'deletePackage'])->name('packages.destroy');

    // Booking management proxies
    Route::get('/bookings/list', [TravelController::class, 'getBookings'])->name('bookings.list');
    Route::post('/bookings', [TravelController::class, 'storeBooking'])->name('bookings.store');
    Route::put('/bookings/{id}', [TravelController::class, 'updateBooking'])->name('bookings.update');
    Route::delete('/bookings/{id}', [TravelController::class, 'deleteBooking'])->name('bookings.destroy');
});
