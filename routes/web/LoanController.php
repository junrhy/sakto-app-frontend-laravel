<?php

use App\Http\Controllers\LoanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Loan Routes
|--------------------------------------------------------------------------
|
| Routes for loan management including loan creation, payment tracking,
| and CBU (Capital Build Up) management.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // Lending
    Route::prefix('loan')->group(function () {
        Route::get('/', [LoanController::class, 'index'])->name('loan');
        Route::get('/settings', [LoanController::class, 'settings'])->name('loan.settings');
        Route::post('/', [LoanController::class, 'store']);
        Route::put('/{id}', [LoanController::class, 'update']);
        Route::delete('/{id}', [LoanController::class, 'destroy']);
        Route::post('/bulk-delete', [LoanController::class, 'bulkDestroy']);
        Route::post('/{id}/payment', [LoanController::class, 'recordPayment']);
        Route::delete('/{id}/payment/{paymentId}', [LoanController::class, 'deletePayment']);
        Route::get('/bills/{id}', [LoanController::class, 'getBills']);
        Route::post('/bill/{id}', [LoanController::class, 'createBill']);
        Route::put('/bill/{id}', [LoanController::class, 'updateBill']);
        Route::delete('/bill/{id}', [LoanController::class, 'deleteBill']);
        Route::patch('/bill/{id}/status', [LoanController::class, 'updateBillStatus']);

        // CBU (Capital Build Up) Routes
        Route::prefix('cbu')->group(function () {
            Route::get('/', [LoanController::class, 'getCbuFunds'])->name('loan.cbu.index');
            Route::get('/settings', [LoanController::class, 'cbuSettings'])->name('loan.cbu.settings');
            Route::post('/', [LoanController::class, 'storeCbuFund'])->name('loan.cbu.store');
            Route::put('/{id}', [LoanController::class, 'updateCbuFund'])->name('loan.cbu.update');
            Route::delete('/{id}', [LoanController::class, 'destroyCbuFund'])->name('loan.cbu.destroy');
            Route::post('/{id}/contribution', [LoanController::class, 'addCbuContribution'])->name('loan.cbu.contribution');
            Route::get('/{id}/contributions', [LoanController::class, 'getCbuContributions'])->name('loan.cbu.contributions');
            Route::get('/{id}/withdrawals', [LoanController::class, 'getCbuWithdrawals'])->name('loan.cbu.withdrawals');
            Route::get('/{id}/dividends', [LoanController::class, 'getCbuDividends'])->name('loan.cbu.dividends');
            Route::post('/{id}/dividend', [LoanController::class, 'addCbuDividend'])->name('loan.cbu.dividend');
            Route::get('/{id}/withdraw', [LoanController::class, 'withdrawCbuFund'])->name('loan.cbu.withdraw');
            Route::post('/{id}/withdraw', [LoanController::class, 'processCbuWithdrawal'])->name('loan.cbu.withdraw.process');
            Route::get('/{id}/history', [LoanController::class, 'getCbuHistory'])->name('loan.cbu.history');
            Route::get('/report', [LoanController::class, 'generateCbuReport'])->name('loan.cbu.report');
            Route::post('/{id}/send-report', [LoanController::class, 'sendFundReportEmail'])->name('loan.cbu.send-report');
        });
    });
});
