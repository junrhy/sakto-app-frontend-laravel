<?php

use App\Http\Controllers\RentalItemController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rental Item Routes
|--------------------------------------------------------------------------
|
| Routes for rental item management including item creation, payment
| tracking, and rental management.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Rental Items
    Route::prefix('rental-item')->group(function () {
        Route::get('/', [RentalItemController::class, 'index'])->name('rental-items');
        Route::get('/settings', [RentalItemController::class, 'settings'])->name('rental-item.settings');
        Route::get('/list', [RentalItemController::class, 'getItems']);
        Route::post('/', [RentalItemController::class, 'store']);
        Route::put('/{id}', [RentalItemController::class, 'update']);
        Route::delete('/{id}', [RentalItemController::class, 'destroy']);
        Route::post('/bulk-delete', [RentalItemController::class, 'bulkDestroy']);
        Route::post('/{id}/payment', [RentalItemController::class, 'recordPayment']);
        Route::get('/{id}/payment-history', [RentalItemController::class, 'getPaymentHistory']);
    });
});
