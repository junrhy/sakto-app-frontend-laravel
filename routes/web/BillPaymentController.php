<?php

use App\Http\Controllers\BillPaymentController;
use App\Http\Controllers\BillerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Bill Payment Routes
|--------------------------------------------------------------------------
|
| Routes for bill payment management including bill payments and billers.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    // Bill Payments (subscription required)
    Route::prefix('bill-payments')->group(function () {
        Route::get('/', [BillPaymentController::class, 'index'])->name('bill-payments');
        Route::get('/list', [BillPaymentController::class, 'getBillPayments'])->name('bill-payments.list');
        Route::get('/billers', [BillPaymentController::class, 'getBillers'])->name('bill-payments.billers');
        Route::get('/statistics', [BillPaymentController::class, 'getStatistics'])->name('bill-payments.statistics');
        Route::get('/overdue', [BillPaymentController::class, 'getOverdueBills'])->name('bill-payments.overdue');
        Route::get('/upcoming', [BillPaymentController::class, 'getUpcomingBills'])->name('bill-payments.upcoming');
        Route::post('/', [BillPaymentController::class, 'store'])->name('bill-payments.store');
        Route::get('/{id}', [BillPaymentController::class, 'show'])->name('bill-payments.show');
        Route::put('/{id}', [BillPaymentController::class, 'update'])->name('bill-payments.update');
        Route::delete('/{id}', [BillPaymentController::class, 'destroy'])->name('bill-payments.destroy');
        Route::post('/bulk-update-status', [BillPaymentController::class, 'bulkUpdateStatus'])->name('bill-payments.bulk-update-status');
        Route::post('/bulk-delete', [BillPaymentController::class, 'bulkDelete'])->name('bill-payments.bulk-delete');
    });

    // Billers (subscription required)
    Route::prefix('billers')->group(function () {
        Route::get('/', [BillerController::class, 'index'])->name('billers');
        Route::get('/list', [BillerController::class, 'getBillers'])->name('billers.list');
        Route::get('/categories', [BillerController::class, 'getCategories'])->name('billers.categories');
        Route::post('/', [BillerController::class, 'store'])->name('billers.store');
        Route::post('/bulk-update-status', [BillerController::class, 'bulkUpdateStatus'])->name('billers.bulk-update-status');
        Route::post('/bulk-delete', [BillerController::class, 'bulkDelete'])->name('billers.bulk-delete');
        
        // Parameter routes (must come after specific routes)
        Route::get('/{id}', [BillerController::class, 'show'])->name('billers.show');
        Route::put('/{id}', [BillerController::class, 'update'])->name('billers.update');
        Route::delete('/{id}', [BillerController::class, 'destroy'])->name('billers.destroy');
    });
});
