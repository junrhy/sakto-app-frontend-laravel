<?php

use App\Http\Controllers\SemaphoreAccountController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Semaphore Account Routes
|--------------------------------------------------------------------------
|
| Routes for Semaphore account management functionality.
|
*/

Route::middleware(['auth', 'verified', 'team.member.selection'])->group(function () {
    Route::get('/semaphore-accounts', [SemaphoreAccountController::class, 'index'])->name('semaphore-accounts.index');
    Route::post('/semaphore-accounts', [SemaphoreAccountController::class, 'store'])->name('semaphore-accounts.store');
    Route::put('/semaphore-accounts/{semaphoreAccount}', [SemaphoreAccountController::class, 'update'])->name('semaphore-accounts.update');
    Route::delete('/semaphore-accounts/{semaphoreAccount}', [SemaphoreAccountController::class, 'destroy'])->name('semaphore-accounts.destroy');
    Route::post('/semaphore-accounts/{semaphoreAccount}/toggle', [SemaphoreAccountController::class, 'toggleActive'])->name('semaphore-accounts.toggle');
    Route::post('/semaphore-accounts/{semaphoreAccount}/test', [SemaphoreAccountController::class, 'test'])->name('semaphore-accounts.test');
});
