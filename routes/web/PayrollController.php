<?php

use App\Http\Controllers\PayrollController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Payroll Routes
|--------------------------------------------------------------------------
|
| Routes for payroll management including employee payroll processing
| and payroll settings.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection', 'premium'])->group(function () {
    // Payroll
    Route::prefix('payroll')->group(function () {
        Route::get('/', [PayrollController::class, 'index'])->name('payroll');
        Route::get('/settings', [PayrollController::class, 'settings'])->name('payroll.settings');
        Route::get('/list', [PayrollController::class, 'getList']);
        Route::get('/overview', [PayrollController::class, 'getOverview']);
        Route::post('/', [PayrollController::class, 'store']);
        Route::put('/{id}', [PayrollController::class, 'update']);
        Route::delete('/{id}', [PayrollController::class, 'destroy']);
        Route::delete('/bulk', [PayrollController::class, 'bulkDestroy']);
        
        // Salary History Routes
        Route::get('/salary-history', [PayrollController::class, 'getSalaryHistory']);
        Route::post('/salary-history', [PayrollController::class, 'storeSalaryHistory']);
        
        // Payroll Periods Routes
        Route::get('/periods', [PayrollController::class, 'getPayrollPeriods']);
        Route::post('/periods', [PayrollController::class, 'storePayrollPeriod']);
        
        // Time Tracking Routes
        Route::get('/time-tracking', [PayrollController::class, 'getTimeTracking']);
        Route::post('/time-tracking', [PayrollController::class, 'storeTimeTracking']);
    });
});
