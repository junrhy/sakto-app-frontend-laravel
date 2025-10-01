<?php

use App\Http\Controllers\RentalPropertyController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rental Property Routes
|--------------------------------------------------------------------------
|
| Routes for rental property management including property creation,
| payment tracking, and property management.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Real Estate (subscription required)
    Route::prefix('rental-property')->group(function () {
        Route::get('/', [RentalPropertyController::class, 'index'])->name('rental-property');
        Route::get('/settings', [RentalPropertyController::class, 'settings'])->name('rental-property.settings');
        Route::get('/list', [RentalPropertyController::class, 'getProperties']);
        Route::post('/', [RentalPropertyController::class, 'store']);
        Route::post('/bulk', [RentalPropertyController::class, 'bulkDestroy']);
        
        // Parameter routes (must come after specific routes)
        Route::put('/{id}', [RentalPropertyController::class, 'update']);
        Route::delete('/{id}', [RentalPropertyController::class, 'destroy']);
        Route::post('/{id}/payment', [RentalPropertyController::class, 'recordPayment']);
        Route::get('/{id}/payment-history', [RentalPropertyController::class, 'getPaymentHistory']);
    });
});
