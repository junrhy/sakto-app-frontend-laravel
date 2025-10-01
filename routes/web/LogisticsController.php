<?php

use App\Http\Controllers\LogisticsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Logistics Routes
|--------------------------------------------------------------------------
|
| Routes for logistics management including truck management, bookings,
| and public logistics functionality.
|
*/

// Public logistics routes (no authentication required)
Route::get('/logistics', [LogisticsController::class, 'index'])->name('logistics');
Route::get('/logistics/{identifier}', [LogisticsController::class, 'show'])->name('logistics.show');

// Logistics API Routes (public)
Route::prefix('logistics')->group(function () {
    Route::get('/trucks/list', [LogisticsController::class, 'getTrucks'])->name('logistics.trucks.list');
    Route::get('/user/search', [LogisticsController::class, 'searchUser'])->name('logistics.users.search');
    
    // Public Booking Routes (no authentication required)
    Route::get('/bookings/list', [LogisticsController::class, 'getBookings'])->name('logistics.bookings.list');
    Route::get('/bookings/stats', [LogisticsController::class, 'getBookingStats'])->name('logistics.bookings.stats');
    Route::post('/bookings/store', [LogisticsController::class, 'storeBooking'])->name('logistics.bookings.store');
    Route::get('/bookings/reference', [LogisticsController::class, 'getBookingByReference'])->name('logistics.bookings.reference');
    
    // Public Booking Tracking Route (no authentication required)
    Route::get('/{identifier}/track', [LogisticsController::class, 'trackBooking'])->name('logistics.track');
});
