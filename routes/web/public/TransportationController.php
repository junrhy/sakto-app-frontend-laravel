<?php

use App\Http\Controllers\TransportationController;

/*
|--------------------------------------------------------------------------
| Transportation Controller Public Routes
|--------------------------------------------------------------------------
|
| Public routes for transportation functionality including driver routes.
|
*/

// Driver Location Update Routes (outside main group)
Route::prefix('driver')->group(function () {
    Route::get('/trucks', [TransportationController::class, 'getDriverTrucks'])->name('driver.trucks.list');
});
